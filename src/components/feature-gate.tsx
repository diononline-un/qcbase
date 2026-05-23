import type { ReactNode } from "react"
import { hasFeature, type Tier } from "@/lib/tiers"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

interface FeatureGateProps {
  feature: string
  tier: Tier
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ feature, tier, children, fallback }: FeatureGateProps) {
  if (hasFeature(tier, feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <Lock className="h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium text-muted-foreground">
        Diese Funktion benötigt ein höheres Tier
      </p>
      <Badge variant="outline" className="mt-2">
        Upgrade erforderlich
      </Badge>
    </div>
  )
}
