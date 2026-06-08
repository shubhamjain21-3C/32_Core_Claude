import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { AI_ANALYSIS_ENABLED, hasAnthropicKey, CLAUDE_MODEL } from '@/lib/anthropic'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ── Prompt template — kept here for easy iteration ─────────────────────────
const INVENTORY_PROMPT = `You are a professional UK property inventory clerk. Analyse the provided property photos and produce a detailed, professional inventory condition report.

For each image, identify and assess:
- Walls (marks, cracks, paint condition, stains)
- Ceiling (cracks, stains, damp, light fittings)
- Floor / carpet (stains, damage, wear)
- Windows (condition, handles, locks, glass)
- Doors (condition, handles, locks, hinges, frames)
- Electrical fittings (sockets, switches, light fittings — visible condition only)
- Appliances (washing machine, fridge, oven, dishwasher — when visible)
- Fixtures and fittings (curtain rails, blinds, radiators, towel rails)
- Furniture (if provided by landlord)
- Any visible damage, marks, or items of concern

For each identified item output an object with: item_name, category (door|window|wall|ceiling|floor|appliance|fixture|fitting|furniture|electrical|other), condition (excellent|good|fair|poor|damaged), description (1-2 professional sentences), concerns (issues noted or empty string).

Also provide an overall room summary of 2-3 sentences.
User notes for this room: {USER_NOTES}

Respond ONLY with valid JSON:
{
  "room_summary": "string",
  "overall_condition": "excellent|good|fair|poor|damaged",
  "items": [{ "item_name": "", "category": "", "condition": "", "description": "", "concerns": "" }]
}`

interface RoomPayload {
  name:      string
  mediaUrls: string[]
  notes:     string[]
}

interface AnalysedRoom {
  room_name:         string
  room_summary:      string
  overall_condition: string
  items: Array<{
    item_name:   string
    category:    string
    condition:   string
    description: string
    concerns:    string
  }>
}

// ── Stubbed analysis used when the AI flag is off (or no key) ──────────────
function stubAnalysis(rooms: RoomPayload[]): AnalysedRoom[] {
  return rooms.map(r => ({
    room_name:    r.name,
    room_summary: r.notes?.length
      ? r.notes.join(' ').slice(0, 240)
      : 'AI analysis is currently disabled. Captured media and notes have been saved and can be reviewed manually.',
    overall_condition: 'good',
    items: [],
  }))
}

// ── Image source helpers (same shape as before) ────────────────────────────
function isImageUrl(url: string)     { return /\.(jpg|jpeg|png|webp|heic|gif)(\?|$)/i.test(url) }
function isImageDataUri(url: string) { return /^data:image\//i.test(url) }

type ImageSource =
  | { type: 'url';    url: string }
  | { type: 'base64'; media_type: string; data: string }

function parseImageSource(url: string): ImageSource | null {
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/[\w+.-]+);base64,(.+)$/)
    if (!match) return null
    return { type: 'base64', media_type: match[1], data: match[2] }
  }
  if (isImageUrl(url) || url.includes('/storage/v1/object/')) {
    // Supabase signed URLs may not include a recognisable extension — accept storage URLs too.
    return { type: 'url', url }
  }
  return null
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json() as { rooms?: RoomPayload[] }
    const rooms = body.rooms ?? []

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json({ error: 'No rooms supplied.' }, { status: 400 })
    }

    // ── Feature-flag stub: keeps the DIY flow working without an API key ──
    if (!AI_ANALYSIS_ENABLED || !hasAnthropicKey) {
      return NextResponse.json({
        analysis:   stubAnalysis(rooms),
        stubbed:    true,
        message:    AI_ANALYSIS_ENABLED
          ? 'AI analysis is enabled but ANTHROPIC_API_KEY is missing — returning a stubbed report.'
          : 'AI analysis is disabled. Set NEXT_PUBLIC_AI_ANALYSIS_ENABLED=true (and ANTHROPIC_API_KEY on the server) to enable Claude-powered reports.',
      })
    }

    // ── Live Claude call ─────────────────────────────────────────────────────
    // TODO: when wiring AI for real, consider:
    //   - parallelising room calls
    //   - persisting structured output back onto inventory_rooms / inventory_items
    //   - bumping CLAUDE_MODEL to the latest Sonnet/Opus
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const analysisResults: AnalysedRoom[] = []

    for (const room of rooms) {
      const imageSources = (room.mediaUrls ?? [])
        .filter(url => isImageUrl(url) || isImageDataUri(url) || url.includes('/storage/v1/object/'))
        .map(parseImageSource)
        .filter((s): s is ImageSource => s !== null)

      if (imageSources.length === 0) {
        analysisResults.push({
          room_name:         room.name,
          room_summary:      'No images provided for AI analysis.',
          overall_condition: 'good',
          items:             [],
        })
        continue
      }

      const imageContents = imageSources.map(source => ({
        type: 'image' as const,
        source: source.type === 'base64'
          ? {
              type: 'base64' as const,
              media_type: source.media_type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: source.data,
            }
          : { type: 'url' as const, url: source.url },
      }))

      const prompt = INVENTORY_PROMPT.replace(
        '{USER_NOTES}',
        room.notes?.join('. ') || 'None provided',
      )

      const response = await client.messages.create({
        model:      CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            ...imageContents,
            { type: 'text', text: prompt },
          ],
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

      let parsed: Omit<AnalysedRoom, 'room_name'>
      try {
        parsed = JSON.parse(text)
      } catch {
        const match = text.match(/\{[\s\S]*\}/)
        parsed = match
          ? JSON.parse(match[0])
          : { room_summary: text, overall_condition: 'good', items: [] }
      }

      analysisResults.push({ room_name: room.name, ...parsed })
    }

    return NextResponse.json({ analysis: analysisResults, stubbed: false })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[inventory.analyse] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
