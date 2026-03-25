const PRODUCTION_SITE_URL = "https://hobbyasap.com"

function normalizeSiteUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value
}

export function getClientSiteUrl() {
  const configuredPublicUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredPublicUrl) {
    return normalizeSiteUrl(configuredPublicUrl)
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL
  }

  if (typeof window !== "undefined") {
    return normalizeSiteUrl(window.location.origin)
  }

  return "http://localhost:3000"
}
