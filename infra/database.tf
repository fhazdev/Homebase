# ---------------------------------------------------------------------------
# Azure SQL Server
# ---------------------------------------------------------------------------

resource "azurerm_mssql_server" "main" {
  name                         = "sql-${local.name_prefix}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password

  # Prefer Entra ID (AAD) auth; SQL auth is kept for operational access.
  azuread_administrator {
    login_username              = "homebase-sql-admins"
    object_id                   = azurerm_user_assigned_identity.api.principal_id
    azuread_authentication_only = false
  }

  # Outbound connections from Azure services go through the server's public IP
  # unless overridden by the virtual network rule below.
  public_network_access_enabled = true # controlled via firewall rules in security.tf

  minimum_tls_version = "1.2"

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Azure SQL Database – Free-tier Serverless
#
# Free tier: up to 100,000 vCore-seconds/month and 32 GB storage.
# Achieved via:
#   - sku_name  = "GP_S_Gen5_1"  (General Purpose Serverless, 1 vCore)
#   - auto_pause_delay_in_minutes = var.sql_auto_pause_delay_minutes
#   - free_limit_exhaustion_behavior = "AutoPause"
# ---------------------------------------------------------------------------

resource "azurerm_mssql_database" "main" {
  name      = var.sql_database_name
  server_id = azurerm_mssql_server.main.id

  # General Purpose Serverless Gen5 1-vCore is the SKU that qualifies for the
  # Azure SQL Database free offer (one free DB per subscription).
  sku_name = "GP_S_Gen5_1"

  # Serverless auto-scaling range (vCores)
  min_capacity = 0.5
  max_size_gb  = var.sql_max_size_gb

  # Auto-pause after N minutes of inactivity (free-tier friendly)
  auto_pause_delay_in_minutes = var.sql_auto_pause_delay_minutes

  # When free monthly limit is reached, pause instead of incurring charges.
  free_limit_exhaustion_behavior = "AutoPause"

  # Zone redundancy is not available on free/serverless SKUs.
  zone_redundant = false

  # Geo-redundant backup not available on free tier.
  geo_backup_enabled = false

  # Keep 7-day point-in-time restore.
  short_term_retention_policy {
    retention_days           = 7
    backup_interval_in_hours = 24
  }

  # Long-term retention (optional – free, using LRS).
  long_term_retention_policy {
    weekly_retention  = "P4W"
    monthly_retention = "P3M"
    yearly_retention  = "P1Y"
    week_of_year      = 1
  }

  tags = local.common_tags

  lifecycle {
    prevent_destroy = true
  }
}

# ---------------------------------------------------------------------------
# Diagnostic settings – stream SQL audit logs to Log Analytics
# ---------------------------------------------------------------------------

resource "azurerm_monitor_diagnostic_setting" "sql_server" {
  name                       = "diag-sql-${local.name_prefix}"
  target_resource_id         = "${azurerm_mssql_server.main.id}/databases/master"
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "SQLSecurityAuditEvents"
  }

  metric {
    category = "Basic"
    enabled  = false
  }
}

resource "azurerm_monitor_diagnostic_setting" "sql_database" {
  name                       = "diag-sqldb-${local.name_prefix}"
  target_resource_id         = azurerm_mssql_database.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "SQLInsights"
  }

  enabled_log {
    category = "AutomaticTuning"
  }

  enabled_log {
    category = "QueryStoreRuntimeStatistics"
  }

  enabled_log {
    category = "Errors"
  }

  metric {
    category = "Basic"
    enabled  = true
  }

  metric {
    category = "InstanceAndAppAdvanced"
    enabled  = true
  }
}
