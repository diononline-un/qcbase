import type { AgentConfig, ParsedLink } from "./types"
import {
  litbuy, oopbuy, hipobuy, acbuy, gtbuy, usfans,
  kakobuy, cssbuy, cnfans, superbuy, lovegobuy,
} from "./agents"
import { parseSourceUrl } from "@/lib/parser"

const ALL_AGENTS: AgentConfig[] = [
  litbuy, oopbuy, hipobuy, acbuy, gtbuy, usfans,
  kakobuy, cssbuy, cnfans, superbuy, lovegobuy,
]

export { ALL_AGENTS }

export function getAgent(id: string): AgentConfig | undefined {
  return ALL_AGENTS.find((a) => a.id === id)
}

export function getAgentsForPlatform(platform: string): AgentConfig[] {
  return ALL_AGENTS.filter((a) => a.supportedPlatforms.includes(platform))
}

export function buildAgentUrl(
  sourceUrl: string,
  agentId: string,
  affiliateCode?: string
): string {
  const agent = getAgent(agentId)
  if (!agent) {
    return sourceUrl
  }

  const parsed = parseSourceUrl(sourceUrl)

  return agent.buildUrl({
    sourceUrl,
    itemId: parsed?.itemId || sourceUrl,
    platform: parsed?.platform || "unknown",
    affiliateCode,
  })
}
