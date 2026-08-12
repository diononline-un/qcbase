import { ALL_AGENTS } from "@/lib/agents"

interface CreatorBannerSectionProps {
  settings: {
    banner_left_url: string | null
    banner_right_url: string | null
    banner_url: string | null
    social_instagram: string | null
    social_tiktok: string | null
    social_discord: string | null
    social_website: string | null
    best_agent: string | null
    disable_platform_refs: boolean
  }
  theme: { primaryColor?: string; backgroundColor?: string }
  tier: string
  campaign: {
    banner_url: string | null
    target_url: string | null
    title: string
  } | null
}

export function CreatorBannerSection({ settings, theme, tier, campaign }: CreatorBannerSectionProps) {
  const leftBanner = settings.banner_left_url || settings.banner_url
  const rightBanner = settings.banner_right_url

  const hasSocials = settings.social_instagram || settings.social_tiktok || settings.social_discord || settings.social_website

  const showCampaignOverlay = campaign && !(tier === "creator_plus" && settings.disable_platform_refs)

  const bestAgent = settings.best_agent ? ALL_AGENTS.find((a) => a.id === settings.best_agent) : null

  return (
    <section className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl">
        {/* Two-Column Banner */}
        <div className="grid grid-cols-2 gap-0">
          {/* Left Banner */}
          <div className="relative aspect-[3/1] overflow-hidden">
            {leftBanner ? (
              <img src={leftBanner} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: theme.backgroundColor || theme.primaryColor || "#18181b" }}>
                <span className="font-mono text-xs text-white/40">Your Banner</span>
              </div>
            )}
          </div>

          {/* Right Banner */}
          <div className="relative aspect-[3/1] overflow-hidden">
            {showCampaignOverlay && campaign?.banner_url ? (
              <a href={campaign.target_url || "#"} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                <img src={campaign.banner_url} alt={campaign.title} className="h-full w-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-background/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">Ad</span>
              </a>
            ) : rightBanner ? (
              <img src={rightBanner} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="font-mono text-xs text-muted-foreground">QCBase</span>
              </div>
            )}
          </div>
        </div>

        {/* Best Agent + Social Links */}
        {(bestAgent || hasSocials) && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {bestAgent && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  Best Agent: {bestAgent.name}
                </span>
              )}
            </div>

            {hasSocials && (
              <div className="flex flex-wrap items-center gap-1.5">
                {settings.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-zinc-200 px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-zinc-400 hover:text-foreground dark:border-zinc-700 dark:hover:border-zinc-500">
                    Instagram
                  </a>
                )}
                {settings.social_tiktok && (
                  <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-zinc-200 px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-zinc-400 hover:text-foreground dark:border-zinc-700 dark:hover:border-zinc-500">
                    TikTok
                  </a>
                )}
                {settings.social_discord && (
                  <a href={settings.social_discord} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-zinc-200 px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-zinc-400 hover:text-foreground dark:border-zinc-700 dark:hover:border-zinc-500">
                    Discord
                  </a>
                )}
                {settings.social_website && (
                  <a href={settings.social_website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-md border border-zinc-200 px-2.5 py-1 font-mono text-[10px] text-muted-foreground transition-colors hover:border-zinc-400 hover:text-foreground dark:border-zinc-700 dark:hover:border-zinc-500">
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
