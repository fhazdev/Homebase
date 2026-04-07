terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-homebase-tfstate"
    storage_account_name = "sthomebasetfstate"
    container_name       = "tfstate"
    key                  = "homebase.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }

  subscription_id = var.subscription_id
}

# ---------------------------------------------------------------------------
# Resource Group
# ---------------------------------------------------------------------------

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Locals
# ---------------------------------------------------------------------------

locals {
  app_name = "homebase"
  env      = var.environment

  # Naming convention: <type>-<app>-<env>
  name_prefix = "${local.app_name}-${local.env}"

  common_tags = {
    project     = "HomeBase"
    environment = var.environment
    managed_by  = "terraform"
    owner       = var.owner_tag
  }
}
