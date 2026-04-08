# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

variable "subscription_id" {
  description = "Azure Subscription ID where resources will be deployed."
  type        = string
  sensitive   = true
}

variable "resource_group_name" {
  description = "Name of the primary resource group."
  type        = string
  default     = "rg-homebase"
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "westus2"
}

variable "environment" {
  description = "Deployment environment label (e.g. dev, staging, prod)."
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "owner_tag" {
  description = "Owner tag applied to all resources."
  type        = string
  default     = "fhazdev"
}

# ---------------------------------------------------------------------------
# Networking / DNS
# ---------------------------------------------------------------------------

variable "frontend_hostname" {
  description = "Custom domain for the Static Web App (frontend)."
  type        = string
  default     = "homebase.fhbox.xyz"
}

variable "api_hostname" {
  description = "Custom domain for the API (Container App)."
  type        = string
  default     = "api.homebase.fhbox.xyz"
}

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

variable "sql_admin_login" {
  description = "SQL Server administrator login name."
  type        = string
  default     = "homebaseadmin"
  sensitive   = true
}

variable "sql_admin_password" {
  description = "SQL Server administrator password. Must meet Azure complexity requirements."
  type        = string
  sensitive   = true
}

variable "sql_database_name" {
  description = "Name of the Azure SQL Database."
  type        = string
  default     = "homebase-db"
}

variable "sql_max_size_gb" {
  description = "Maximum database size in GB (free tier cap is 32 GB)."
  type        = number
  default     = 32
}

variable "sql_auto_pause_delay_minutes" {
  description = "Number of minutes of inactivity before the serverless database auto-pauses (-1 to disable)."
  type        = number
  default     = 60
}

# ---------------------------------------------------------------------------
# Container App
# ---------------------------------------------------------------------------

variable "container_image" {
  description = "Full container image reference for the API, e.g. myregistry.azurecr.io/homebase-api:latest."
  type        = string
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "container_cpu" {
  description = "CPU allocation for the Container App (0.25, 0.5, 0.75, 1.0 …)."
  type        = number
  default     = 0.25
}

variable "container_memory" {
  description = "Memory allocation for the Container App (e.g. '0.5Gi', '1Gi')."
  type        = string
  default     = "0.5Gi"
}

variable "container_min_replicas" {
  description = "Minimum number of Container App replicas (0 = scale-to-zero)."
  type        = number
  default     = 0
}

variable "container_max_replicas" {
  description = "Maximum number of Container App replicas."
  type        = number
  default     = 3
}

variable "container_port" {
  description = "Port the container listens on."
  type        = number
  default     = 8080
}

# ---------------------------------------------------------------------------
# Monitoring / Alerting
# ---------------------------------------------------------------------------

variable "alert_email" {
  description = "Email address that receives monitoring alerts."
  type        = string
  default     = "fjhshadow@gmail.com"
}

variable "log_retention_days" {
  description = "Number of days to retain logs in Log Analytics workspace."
  type        = number
  default     = 30
}

variable "alert_error_rate_threshold" {
  description = "Failed-request percentage that triggers the error-rate alert."
  type        = number
  default     = 5
}

variable "alert_p95_response_ms" {
  description = "P95 response time in milliseconds that triggers the latency alert."
  type        = number
  default     = 2000
}

variable "alert_dtu_threshold" {
  description = "DTU percentage that triggers the database alert."
  type        = number
  default     = 80
}

# ---------------------------------------------------------------------------
# Key Vault
# ---------------------------------------------------------------------------

variable "key_vault_sku" {
  description = "Key Vault SKU name (standard or premium)."
  type        = string
  default     = "standard"
}
