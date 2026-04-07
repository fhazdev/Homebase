data "azurerm_client_config" "current" {}

# ---------------------------------------------------------------------------
# User-Assigned Managed Identity – API Container App
# ---------------------------------------------------------------------------

resource "azurerm_user_assigned_identity" "api" {
  name                = "id-${local.name_prefix}-api"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Key Vault
# ---------------------------------------------------------------------------

resource "azurerm_key_vault" "main" {
  name                = "kv-${local.name_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id

  sku_name                      = var.key_vault_sku
  soft_delete_retention_days    = 7
  purge_protection_enabled      = true
  enable_rbac_authorization     = false # use access policies for simplicity
  public_network_access_enabled = true  # locked down via network_acls below

  network_acls {
    bypass         = "AzureServices"
    default_action = "Deny"

    # Allow the Terraform executor's outbound IP to read/write secrets during
    # plan/apply. Add additional IPs for CI/CD agents as needed.
    # ip_rules = ["<your-cicd-agent-ip>/32"]
    ip_rules = []
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Key Vault Access Policies
# ---------------------------------------------------------------------------

# Terraform deployment principal – full secret management
resource "azurerm_key_vault_access_policy" "terraform_deployer" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get", "List", "Set", "Delete", "Purge", "Recover", "Backup", "Restore",
  ]

  key_permissions = [
    "Get", "List", "Create", "Delete", "Purge", "Recover",
  ]

  certificate_permissions = [
    "Get", "List",
  ]
}

# API managed identity – read secrets only
resource "azurerm_key_vault_access_policy" "api_identity" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.api.principal_id

  secret_permissions = [
    "Get", "List",
  ]
}

# ---------------------------------------------------------------------------
# Key Vault Secrets
# ---------------------------------------------------------------------------

resource "azurerm_key_vault_secret" "sql_admin_password" {
  name         = "sql-admin-password"
  value        = var.sql_admin_password
  key_vault_id = azurerm_key_vault.main.id

  content_type    = "text/plain"
  expiration_date = "2027-01-01T00:00:00Z"

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.terraform_deployer]
}

resource "azurerm_key_vault_secret" "sql_connection_string" {
  name  = "sql-connection-string"
  value = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_admin_login};Password=${var.sql_admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

  key_vault_id    = azurerm_key_vault.main.id
  content_type    = "text/plain"
  expiration_date = "2027-01-01T00:00:00Z"

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.terraform_deployer]
}

resource "azurerm_key_vault_secret" "app_insights_connection_string" {
  name         = "appinsights-connection-string"
  value        = azurerm_application_insights.main.connection_string
  key_vault_id = azurerm_key_vault.main.id
  content_type = "text/plain"

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.terraform_deployer]
}

resource "azurerm_key_vault_secret" "static_web_app_api_key" {
  name         = "static-web-app-api-key"
  value        = azurerm_static_web_app.frontend.api_key
  key_vault_id = azurerm_key_vault.main.id
  content_type = "text/plain"

  tags = local.common_tags

  depends_on = [azurerm_key_vault_access_policy.terraform_deployer]
}

# ---------------------------------------------------------------------------
# SQL Server Firewall Rules
# ---------------------------------------------------------------------------

# Allow all Azure-internal traffic (required for Container Apps + SQL)
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name      = "AllowAzureServices"
  server_id = azurerm_mssql_server.main.id

  # Azure magic IP range: 0.0.0.0/0 with start=end=0.0.0.0 means
  # "Allow access to Azure services".
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# Block all non-Azure public access by default.
# Add developer / CI IP ranges as additional rules as needed, for example:
#
# resource "azurerm_mssql_firewall_rule" "developer_vpn" {
#   name             = "DeveloperVPN"
#   server_id        = azurerm_mssql_server.main.id
#   start_ip_address = "203.0.113.0"
#   end_ip_address   = "203.0.113.255"
# }

# ---------------------------------------------------------------------------
# Role Assignments – Container App identity → SQL
# ---------------------------------------------------------------------------

# Grant the API managed identity the "db_datareader / db_datawriter" roles
# inside SQL via an AAD-contained user. This is done in the database itself
# (outside Terraform) after the identity is created. The resource below
# records the Azure RBAC assignment at the server level.
resource "azurerm_role_assignment" "api_sql_contributor" {
  scope                = azurerm_mssql_server.main.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.api.principal_id

  description = "Allows the API managed identity to connect to the SQL server via AAD auth."
}

# ---------------------------------------------------------------------------
# Role Assignments – Container App identity → Key Vault
# (redundant with access policy above; kept for RBAC-based deployments)
# ---------------------------------------------------------------------------

# No additional RBAC assignments needed when using access policies.
# Uncomment if you switch enable_rbac_authorization = true on the Key Vault:
#
# resource "azurerm_role_assignment" "api_kv_secrets_user" {
#   scope                = azurerm_key_vault.main.id
#   role_definition_name = "Key Vault Secrets User"
#   principal_id         = azurerm_user_assigned_identity.api.principal_id
# }
