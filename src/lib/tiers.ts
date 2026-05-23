export const Tier = {
  FREE: "free",
  CREATOR: "creator",
  CREATOR_PLUS: "creator_plus",
  RESELLER: "reseller",
} as const

export type Tier = (typeof Tier)[keyof typeof Tier]

export const TIER_FEATURES: Record<Tier, string[]> = {
  [Tier.FREE]: [
    "auto_oos_scrubber",
    "auto_qc_3",
    "standard_agent",
  ],
  [Tier.CREATOR]: [
    "multi_agent",
    "audience_capture",
    "basic_analytics",
    "ui_customization",
    "auto_oos_scrubber",
    "auto_qc_3",
    "standard_agent",
  ],
  [Tier.CREATOR_PLUS]: [
    "custom_domain",
    "ad_override",
    "qc_curation",
    "priority_scraping",
    "multi_agent",
    "audience_capture",
    "basic_analytics",
    "ui_customization",
    "auto_oos_scrubber",
    "auto_qc_3",
    "standard_agent",
  ],
  [Tier.RESELLER]: [
    "missed_opps_dashboard",
    "search_trends",
    "trend_alerts",
  ],
}

export function hasFeature(tier: Tier, feature: string): boolean {
  return TIER_FEATURES[tier]?.includes(feature) ?? false
}

export function getMissingFeatures(tier: Tier, desiredFeatures: string[]): string[] {
  return desiredFeatures.filter((f) => !hasFeature(tier, f))
}

export const TIER_LABELS: Record<Tier, string> = {
  [Tier.FREE]: "Free",
  [Tier.CREATOR]: "Creator",
  [Tier.CREATOR_PLUS]: "Creator+",
  [Tier.RESELLER]: "Reseller",
}

export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  [Tier.FREE]: "Market Grab – Grundlegende Funktionen",
  [Tier.CREATOR]: "Creator – Mehr Agenten, Analytics, Customization",
  [Tier.CREATOR_PLUS]: "Creator+ – Custom Domain, Ad-Override, QC-Curation",
  [Tier.RESELLER]: "Reseller / Data Pro – Dashboard-Zugang, Trends & Alerts",
}
