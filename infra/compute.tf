# ---------------------------------------------------------------------------
# Log Analytics – linked to Container Apps Environment
# (workspace created in monitoring.tf; referenced here)
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Container Apps Environment (Consumption plan)
# ---------------------------------------------------------------------------

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${local.name_prefix}"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  # Consumption workload profile – no dedicated nodes, true scale-to-zero.
  workload_profile {
    name                  = "Consumption"
    workload_profile_type = "Consumption"
    minimum_count         = 0
    maximum_count         = 0 # 0 = platform-managed for Consumption
  }

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Container App – API
# ---------------------------------------------------------------------------

resource "azurerm_container_app" "api" {
  name                         = "ca-${local.name_prefix}-api"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"

  # Attach the user-assigned managed identity so the app can pull secrets
  # from Key Vault without storing credentials in environment variables.
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.api.id]
  }

  # ---------------------------------------------------------------------------
  # Ingress – external HTTPS with custom domain
  # ---------------------------------------------------------------------------
  ingress {
    external_enabled           = true
    target_port                = var.container_port
    allow_insecure_connections = false
    transport                  = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  # Custom domain binding is handled separately via azurerm_container_app_custom_domain
  # after the Container App exists and DNS is validated. See web.tf for that resource.

  # ---------------------------------------------------------------------------
  # Container definition
  # ---------------------------------------------------------------------------
  template {
    min_replicas = var.container_min_replicas
    max_replicas = var.container_max_replicas

    container {
      name   = "api"
      image  = var.container_image
      cpu    = var.container_cpu
      memory = var.container_memory

      # -----------------------------------------------------------------------
      # Environment variables – non-sensitive values set directly;
      # sensitive values pulled from Key Vault via secretRef.
      # -----------------------------------------------------------------------
      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = var.environment == "prod" ? "Production" : "Development"
      }

      env {
        name  = "ApplicationInsights__ConnectionString"
        value = azurerm_application_insights.main.connection_string
      }

      env {
        name        = "ConnectionStrings__DefaultConnection"
        secret_name = "sql-connection-string"
      }

      env {
        name        = "KeyVault__Uri"
        value       = azurerm_key_vault.main.vault_uri
      }

      # -----------------------------------------------------------------------
      # Liveness & readiness probes
      # -----------------------------------------------------------------------
      liveness_probe {
        transport = "HTTP"
        path      = "/health/live"
        port      = var.container_port

        initial_delay           = 10
        interval_seconds        = 15
        timeout                 = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport = "HTTP"
        path      = "/health/ready"
        port      = var.container_port

        interval_seconds        = 10
        timeout                 = 5
        failure_count_threshold = 3
        success_count_threshold = 1
      }
    }

    # -------------------------------------------------------------------------
    # HTTP scaling rule – scale up when concurrent requests exceed threshold
    # -------------------------------------------------------------------------
    http_scale_rule {
      name                = "http-scaler"
      concurrent_requests = "20"
    }
  }

  # ---------------------------------------------------------------------------
  # Secrets – referenced by env vars above
  # ---------------------------------------------------------------------------
  secret {
    name  = "sql-connection-string"
    # Retrieve at runtime from Key Vault; value stored as a Key Vault reference.
    key_vault_secret_id = azurerm_key_vault_secret.sql_connection_string.id
    identity            = azurerm_user_assigned_identity.api.id
  }

  tags = local.common_tags

  lifecycle {
    # Image is managed by the CD pipeline deploy-api step, not Terraform.
    # Terraform handles infrastructure (env vars, scaling, secrets); the
    # container-apps-deploy-action updates the image on each deploy.
    ignore_changes = [
      template[0].container[0].image,
    ]
  }

  depends_on = [
    azurerm_key_vault_access_policy.api_identity,
  ]
}

# ---------------------------------------------------------------------------
# Diagnostic settings for Container Apps Environment
# ---------------------------------------------------------------------------

resource "azurerm_monitor_diagnostic_setting" "container_app_env" {
  name                       = "diag-cae-${local.name_prefix}"
  target_resource_id         = azurerm_container_app_environment.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "ContainerAppConsoleLogs"
  }

  enabled_log {
    category = "ContainerAppSystemLogs"
  }

  enabled_metric {
    category = "AllMetrics"
  }
}
