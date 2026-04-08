# ---------------------------------------------------------------------------
# Log Analytics Workspace
# ---------------------------------------------------------------------------

resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${local.name_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  sku               = "PerGB2018"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Application Insights
# ---------------------------------------------------------------------------

resource "azurerm_application_insights" "main" {
  name                = "appi-${local.name_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  workspace_id     = azurerm_log_analytics_workspace.main.id
  application_type = "web"

  retention_in_days = var.log_retention_days

  # Disable sampling so all telemetry is captured (adjust if ingestion costs
  # become significant in production).
  sampling_percentage = 100

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Action Group – email on alert
# ---------------------------------------------------------------------------

resource "azurerm_monitor_action_group" "email" {
  name                = "ag-${local.name_prefix}-email"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "hb-alerts"

  email_receiver {
    name                    = "team-email"
    email_address           = var.alert_email
    use_common_alert_schema = true
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Alert 1 – Error rate > 5%
#
# Uses Application Insights "Failed requests" metric.
# ---------------------------------------------------------------------------

resource "azurerm_monitor_metric_alert" "error_rate" {
  name                = "alert-${local.name_prefix}-error-rate"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Fires when the failed-request rate exceeds ${var.alert_error_rate_threshold}%."
  severity            = 2 # Warning
  frequency           = "PT5M"
  window_size         = "PT15M"
  auto_mitigate       = true

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/failed"
    aggregation      = "Count"
    operator         = "GreaterThan"
    threshold        = var.alert_error_rate_threshold

    # Dynamic thresholds not used here; absolute count is simpler to reason about.
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Alert 2 – P95 response time > 2 s
# ---------------------------------------------------------------------------

resource "azurerm_monitor_metric_alert" "p95_response" {
  name                = "alert-${local.name_prefix}-p95-response"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Fires when P95 server response time exceeds ${var.alert_p95_response_ms} ms."
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"
  auto_mitigate       = true

  criteria {
    metric_namespace = "microsoft.insights/components"
    metric_name      = "requests/duration"
    aggregation      = "Maximum" # Closest proxy to P95 available as a standard metric
    operator         = "GreaterThan"
    threshold        = var.alert_p95_response_ms
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Alert 3 – SQL DTU / vCore utilisation > 80%
# ---------------------------------------------------------------------------

resource "azurerm_monitor_metric_alert" "sql_dtu" {
  name                = "alert-${local.name_prefix}-sql-dtu"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_mssql_database.main.id]
  description         = "Fires when SQL CPU percentage exceeds ${var.alert_dtu_threshold}%."
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"
  auto_mitigate       = true

  criteria {
    # Serverless databases expose cpu_percent rather than dtu_consumption_percent.
    metric_namespace = "Microsoft.Sql/servers/databases"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = var.alert_dtu_threshold
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Alert 4 – Container App restart count > 0
# ---------------------------------------------------------------------------

resource "azurerm_monitor_metric_alert" "container_restarts" {
  name                = "alert-${local.name_prefix}-container-restarts"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_container_app.api.id]
  description         = "Fires when the Container App registers any restart."
  severity            = 1 # Error
  frequency           = "PT5M"
  window_size         = "PT15M"
  auto_mitigate       = true

  criteria {
    metric_namespace = "Microsoft.App/containerApps"
    metric_name      = "RestartCount"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 0
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Application Insights – availability test (basic ping)
# ---------------------------------------------------------------------------

resource "azurerm_application_insights_standard_web_test" "api_ping" {
  name                    = "webtest-${local.name_prefix}-api-ping"
  resource_group_name     = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  application_insights_id = azurerm_application_insights.main.id

  geo_locations = [
    "us-va-ash-azr",  # East US
    "us-tx-sn1-azr",  # South Central US
    "us-il-ch1-azr",  # North Central US
  ]

  request {
    url      = "https://${var.api_hostname}/health/live"
    http_verb = "GET"
    follow_redirects_enabled = true

    header {
      name  = "Accept"
      value = "application/json"
    }
  }

  validation_rules {
    expected_status_code          = 200
    ssl_check_enabled             = true
    ssl_cert_remaining_lifetime   = 7
  }

  frequency    = 300  # every 5 minutes
  timeout      = 30
  enabled      = true
  retry_enabled = true

  tags = local.common_tags
}

# Alert tied to the availability test
resource "azurerm_monitor_metric_alert" "api_availability" {
  name                = "alert-${local.name_prefix}-api-availability"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [
    azurerm_application_insights.main.id,
    azurerm_application_insights_standard_web_test.api_ping.id,
  ]
  description  = "Fires when the API health endpoint is unavailable from 2+ test locations."
  severity     = 0 # Critical
  frequency    = "PT1M"
  window_size  = "PT5M"
  auto_mitigate = true

  application_insights_web_test_location_availability_criteria {
    web_test_id           = azurerm_application_insights_standard_web_test.api_ping.id
    component_id          = azurerm_application_insights.main.id
    failed_location_count = 2
  }

  action {
    action_group_id = azurerm_monitor_action_group.email.id
  }

  tags = local.common_tags
}
