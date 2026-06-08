import Anthropic from '@anthropic-ai/sdk'

// ── Feature flag — flip to enable Claude-powered inventory analysis ──
// Set NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true in your environment AND ensure
// ANTHROPIC_API_KEY is set on the server. Default is "off" so the DIY flow
// works end-to-end with a stubbed response.
export const AI_ANALYSIS_ENABLED =
  (process.env.NEXT_PUBLIC_AI_ANALYSIS_ENABLED ?? 'false').toLowerCase() === 'true'

export const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY

if (!hasAnthropicKey) {
  console.warn('[anthropic] ANTHROPIC_API_KEY not set — AI features disabled')
}

export const anthropic = hasAnthropicKey
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// Default model — bump to a newer Claude when needed.
// Keep in sync with /api/inventory/analyse.
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
