# ---------------------------------------------------------------------------
# Resource Group
# ---------------------------------------------------------------------------

output "resource_group_name" {
  description = "Name of the main resource group."
  value       = azurerm_resource_group.main.name
}

output "resource_group_id" {
  description = "Resource ID of the main resource group."
  value       = azurerm_resource_group.main.id
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

output "sql_server_fqdn" {
  description = "Fully-qualified domain name of the Azure SQL Server."
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Name of the Azure SQL Database."
  value       = azurerm_mssql_database.main.name
}

output "sql_connection_string" {
  description = "ADO.NET connection string (password redacted — retrieve from Key Vault)."
  value = format(
    "Server=tcp:%s,1433;Initial Catalog=%s;Persist Security Info=False;User ID=%s;Password=<from-keyvault>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;",
    azurerm_mssql_server.main.fully_qualified_domain_name,
    azurerm_mssql_database.main.name,
    var.sql_admin_login,
  )
  sensitive = false
}

# ---------------------------------------------------------------------------
# Container App
# ---------------------------------------------------------------------------

output "container_app_fqdn" {
  description = "Default FQDN assigned to the Container App."
  value       = azurerm_container_app.api.latest_revision_fqdn
}

output "container_app_url" {
  description = "Public HTTPS URL of the Container App."
  value       = "https://${azurerm_container_app.api.latest_revision_fqdn}"
}

output "container_app_environment_id" {
  description = "Resource ID of the Container Apps Environment."
  value       = azurerm_container_app_environment.main.id
}

# ---------------------------------------------------------------------------
# Static Web App
# ---------------------------------------------------------------------------

output "static_web_app_default_hostname" {
  description = "Default hostname of the Static Web App."
  value       = azurerm_static_web_app.frontend.default_host_name
}

output "static_web_app_url" {
  description = "Public HTTPS URL of the Static Web App."
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "static_web_app_api_key" {
  description = "Deployment API key for the Static Web App (used by CI/CD)."
  value       = azurerm_static_web_app.frontend.api_key
  sensitive   = true
}

# ---------------------------------------------------------------------------
# Monitoring
# ---------------------------------------------------------------------------

output "app_insights_instrumentation_key" {
  description = "Application Insights instrumentation key."
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "app_insights_connection_string" {
  description = "Application Insights connection string."
  value       = azurerm_application_insights.main.connection_string
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace."
  value       = azurerm_log_analytics_workspace.main.id
}

output "log_analytics_workspace_customer_id" {
  description = "Customer (workspace) ID of the Log Analytics workspace."
  value       = azurerm_log_analytics_workspace.main.workspace_id
}

# ---------------------------------------------------------------------------
# Security
# ---------------------------------------------------------------------------

output "key_vault_uri" {
  description = "URI of the Key Vault."
  value       = azurerm_key_vault.main.vault_uri
}

output "key_vault_id" {
  description = "Resource ID of the Key Vault."
  value       = azurerm_key_vault.main.id
}

output "api_managed_identity_client_id" {
  description = "Client ID of the Container App managed identity."
  value       = azurerm_user_assigned_identity.api.client_id
}

output "api_managed_identity_principal_id" {
  description = "Principal ID of the Container App managed identity."
  value       = azurerm_user_assigned_identity.api.principal_id
}
