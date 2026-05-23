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
      await supabase.from("click_events").insert({
        product_id: productId,
        creator_id: creatorId,
        agent_id: agentId,
      })
    } catch {}

    const affiliateCode = affiliateCodes[agentId] || ""
    const encoded = encodeURIComponent(sourceUrl)
    let url = ""
    switch (agentId) {
      case "cnfans":
        url = `https://cnfans.com/search/all?keyword=${encoded}${affiliateCode ? `&aff=${affiliateCode}` : ""}`
        break
      case "superbuy":
        url = `https://superbuy.com/en/page/buy?url=${encoded}${affiliateCode ? `&tag=${affiliateCode}` : ""}`
        break
      default:
        url = `https://${agentId}.com/item?url=${encoded}${affiliateCode ? `&aff=${affiliateCode}` : ""}`
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="inline-flex w-full items-center justify-between rounded-md border border-zinc-200 bg-background px-3 py-2 text-xs transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
        style={{ borderColor: accentColor ? `${accentColor}40` : undefined }}
      >
        <span className="inline-flex items-center gap-1 text-muted-foreground">
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
