import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const INVENTORY_PROMPT = `You are a professional UK property inventory clerk. Analyse the provided property photos and produce a detailed, professional inventory condition report.

For each image, identify and assess:
- Walls (marks, cracks, paint condition, stains)
- Ceiling (cracks, stains, damp, light fittings)
- Floor / carpet (stains, damage, wear)
- Windows (condition, handles, locks, glass)
- Doors (condition, handles, locks, hinges, frames)
- Electrical fittings (sockets, switches, light fittings — visible condition only)
- Appliances (if visible — washing machine, fridge, oven, dishwasher)
- Fixtures and fittings (curtain rails, blinds, radiators, towel rails)
- Furniture (if provided by landlord — condition, marks, damage)
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

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|webp|heic|gif)(\?|$)/i.test(url)
}

function isImageDataUri(url: string) {
  return /^data:image\//i.test(url)
}

type ImageSource =
  | { type: 'url'; url: string }
  | { type: 'base64'; media_type: string; data: string }

function parseImageSource(url: string): ImageSource | null {
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/[\w+.-]+);base64,(.+)$/)
    if (!match) return null
    return { type: 'base64', media_type: match[1], data: match[2] }
  }
  if (isImageUrl(url)) {
    return { type: 'url', url }
  }
  return null
}

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured. Add it to your environment variables.' },
        { status: 503 }
      )
    }

    const { rooms } = await req.json() as {
      rooms: Array<{ name: string; mediaUrls: string[]; notes: string[] }>
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const analysisResults = []

    for (const room of rooms) {
      const imageSources = room.mediaUrls
        .filter(url => isImageUrl(url) || isImageDataUri(url))
        .map(parseImageSource)
        .filter((s): s is ImageSource => s !== null)

      if (imageSources.length === 0) {
        analysisResults.push({
          room_name: room.name,
          room_summary: 'No images provided for AI analysis.',
          overall_condition: 'good',
          items: [],
        })
        continue
      }

      const imageContents = imageSources.map(source => ({
        type: 'image' as const,
        source: source.type === 'base64'
          ? { type: 'base64' as const, media_type: source.media_type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: source.data }
          : { type: 'url' as const, url: (source as { type: 'url'; url: string }).url },
      }))

      const prompt = INVENTORY_PROMPT.replace(
        '{USER_NOTES}',
        room.notes?.join('. ') || 'None provided'
      )

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
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

      let analysis
      try {
        analysis = JSON.parse(text)
      } catch {
        const match = text.match(/\{[\s\S]*\}/)
        analysis = match ? JSON.parse(match[0]) : { room_summary: text, overall_condition: 'good', items: [] }
      }

      analysisResults.push({ room_name: room.name, ...analysis })
    }

    return NextResponse.json({ analysis: analysisResults })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Inventory analyse error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
