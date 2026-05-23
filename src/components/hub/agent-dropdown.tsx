"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExternalLink, ChevronDown, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const AGENT_LIST = [
  { id: "litbuy", name: "LitBuy" },
  { id: "oopbuy", name: "OopBuy" },
  { id: "hipobuy", name: "HipoBuy" },
  { id: "acbuy", name: "ACBuy" },
  { id: "gtbuy", name: "GTBuy" },
  { id: "usfans", name: "USFans" },
  { id: "kakobuy", name: "KakoBuy" },
  { id: "cssbuy", name: "CSSBuy" },
  { id: "cnfans", name: "CNFans" },
  { id: "superbuy", name: "Superbuy" },
  { id: "lovegobuy", name: "LoveGoBuy" },
]

interface AgentDropdownProps {
  sourceUrl: string
  productId: string
  creatorId: string
  creatorSlug: string
  affiliateCodes: Record<string, string>
  accentColor?: string
}

export function AgentDropdown({ sourceUrl, productId, creatorId, creatorSlug, affiliateCodes, accentColor }: AgentDropdownProps) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const handleAgentClick = async (agentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from("click_events").insert({
        product_id: productId,
        creator_id: creatorId,
        agent_id: agentId,
      })
    } catch {
      // silently fail tracking
    }

    const affiliateCode = affiliateCodes[agentId] || ""
    const encodedUrl = encodeURIComponent(sourceUrl)
    const agentUrl = buildAgentUrl(agentId, sourceUrl, affiliateCode)

    window.open(agentUrl, "_blank", "noopener,noreferrer")
  }

  function buildAgentUrl(agentId: string, sourceUrl: string, affiliateCode: string): string {
    const encoded = encodeURIComponent(sourceUrl)
    switch (agentId) {
      case "mulebuy":
      case "litbuy":
      case "oopbuy":
      case "hipobuy":
      case "acbuy":
      case "gtbuy":
      case "usfans":
      case "kakobuy":
      case "cssbuy":
      case "lovegobuy":
        return `https://${agentId}.com/item?url=${encoded}${affiliateCode ? `&aff=${affiliateCode}` : ""}`
      case "cnfans":
        return `https://cnfans.com/search/all?keyword=${encoded}${affiliateCode ? `&aff=${affiliateCode}` : ""}`
      case "superbuy":
        return `https://superbuy.com/en/page/buy?url=${encoded}${affiliateCode ? `&tag=${affiliateCode}` : ""}`
      default:
        return `https://${agentId}.com/item?url=${encoded}`
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm hover:bg-accent hover:text-accent-foreground">
        <span className="inline-flex items-center gap-1">
          <Store className="h-3 w-3" />
          Agent wählen
        </span>
        <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Wähle einen Agenten</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {AGENT_LIST.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => handleAgentClick(agent.id)}
            className="cursor-pointer text-xs"
          >
            <ExternalLink className="mr-2 h-3 w-3" />
            {agent.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
