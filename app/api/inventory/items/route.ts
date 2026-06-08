import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase'
import { lookupId } from '@/lib/lookups'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// ── POST: create or upsert an item under a room ─────────────────────────────
const upsertSchema = z.object({
  itemId:         z.string().uuid().optional(),
  roomId:         z.string().uuid(),
  itemTypeCode:   z.string().optional(),
  itemLabel:      z.string().optional(),
  quantity:       z.number().int().min(1).default(1),
  conditionCode:  z.string().optional(),
  notes:          z.string().optional(),
  sortOrder:      z.number().int().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = upsertSchema.parse(body)

    const [itemTypeId, conditionId] = await Promise.all([
      data.itemTypeCode  ? lookupId('ref_item_types',       data.itemTypeCode).catch(() => null) : Promise.resolve(null),
      data.conditionCode ? lookupId('ref_condition_levels', data.conditionCode).catch(() => null) : Promise.resolve(null),
    ])

    const itemId = data.itemId ?? randomUUID()
    let dbSaved = false

    try {
      const admin = createAdminClient()
      const payload = {
        InventoryItem_id: itemId,
        room_id:          data.roomId,
        item_type_id:     itemTypeId,
        item_label:       data.itemLabel ?? null,
        quantity:         data.quantity,
        condition_id:     conditionId,
        clerk_notes:      data.notes ?? null,
        sort_order:       data.sortOrder ?? 0,
      }
      const { error } = await admin
        .from('inventory_items')
        .upsert(payload as never, { onConflict: 'InventoryItem_id' })
      if (!error) dbSaved = true
      else console.warn('[inventory.items] upsert error:', error.message)
    } catch (err) {
      console.warn('[inventory.items] Supabase unavailable:', err)
    }

    return NextResponse.json({ success: true, itemId, dbSaved })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    console.error('[inventory.items] unexpected error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}

const deleteSchema = z.object({ itemId: z.string().uuid() })

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { itemId } = deleteSchema.parse(body)
    try {
      const admin = createAdminClient()
      const { error } = await admin
        .from('inventory_items')
        .delete()
        .eq('InventoryItem_id', itemId)
      if (error) console.warn('[inventory.items DELETE] error:', error.message)
    } catch { /* tolerate offline */ }
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Invalid itemId.' }, { status: 400 })
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
