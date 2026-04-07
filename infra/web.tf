# ---------------------------------------------------------------------------
# Static Web App – Free tier
#
# Free tier includes:
#   - 100 GB/month bandwidth
#   - 0.5 GB storage
#   - Custom domains with free managed TLS certificates
#   - Global CDN distribution
# ---------------------------------------------------------------------------

resource "azurerm_static_web_app" "frontend" {
  name                = "stapp-${local.name_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  # "Free" maps to the Azure Static Web Apps free plan.
  sku_tier = "Free"
  sku_size = "Free"

  # Configuration file (staticwebapp.config.json) is deployed alongside the
  # app build artifact – not managed here. API proxy rules pointing to the
  # Container App are defined in that file.

  tags = local.common_tags
}

# ---------------------------------------------------------------------------
# Custom domain binding
#
# Prerequisites (done outside Terraform / in your DNS provider):
#   1. Create a CNAME record:
#        homebase.fhbox.xyz  →  <stapp-name>.azurestaticapps.net
#   2. For an apex/root domain, use an ALIAS or ANAME record instead.
#
# Azure automatically provisions and renews a managed TLS certificate once the
# DNS record resolves correctly.
# ---------------------------------------------------------------------------

resource "azurerm_static_web_app_custom_domain" "frontend" {
  static_web_app_id = azurerm_static_web_app.frontend.id
  domain_name       = var.frontend_hostname

  # "cname-delegation" tells Azure to validate ownership via the CNAME record.
  # Switch to "txt" if you need TXT-record validation (e.g. for apex domains).
  validation_type = "cname-delegation"
}

# ---------------------------------------------------------------------------
# Store the Static Web App deployment API key in Key Vault
# so CI/CD pipelines can retrieve it without hardcoding.
# (Secret defined in security.tf as azurerm_key_vault_secret.static_web_app_api_key)
# ---------------------------------------------------------------------------
