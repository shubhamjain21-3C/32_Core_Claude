import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase'
import { lookupId } from '@/lib/lookups'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// ── POST: create or upsert a room ──────────────────────────────────────────
const upsertSchema = z.object({
  reportId:        z.string().uuid(),
  roomId:          z.string().uuid().optional(), // present = update
  roomName:        z.string().min(1),
  roomTypeCode:    z.string().optional(),
  conditionCode:   z.string().optional(),
  notes:           z.string().optional(),
  sortOrder:       z.number().int().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = upsertSchema.parse(body)

    const [roomTypeId, conditionId] = await Promise.all([
      data.roomTypeCode  ? lookupId('ref_room_types',       data.roomTypeCode).catch(() => null) : Promise.resolve(null),
      data.conditionCode ? lookupId('ref_condition_levels', data.conditionCode).catch(() => null) : Promise.resolve(null),
    ])

    const roomId = data.roomId ?? randomUUID()
    let dbSaved = false

    try {
      const admin = createAdminClient()
      const payload = {
        InventoryRoom_Id:   roomId,
        InventoryReport_id: data.reportId,
        room_name:          data.roomName,
        room_type_id:       roomTypeId,
        condition_id:       conditionId,
        clerk_notes:        data.notes ?? null,
        sort_order:         data.sortOrder ?? 0,
      }
      const { error } = await admin
        .from('inventory_rooms')
        .upsert(payload as never, { onConflict: 'InventoryRoom_Id' })
      if (!error) dbSaved = true
      else console.warn('[inventory.rooms] upsert error:', error.message)
    } catch (err) {
      console.warn('[inventory.rooms] Supabase unavailable:', err)
    }

    return NextResponse.json({ success: true, roomId, dbSaved })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    console.error('[inventory.rooms] unexpected error:', err)
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}

// ── DELETE: remove a room (best-effort) ─────────────────────────────────────
const deleteSchema = z.object({ roomId: z.string().uuid() })

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { roomId } = deleteSchema.parse(body)
    try {
      const admin = createAdminClient()
      const { error } = await admin
        .from('inventory_rooms')
        .delete()
        .eq('InventoryRoom_Id', roomId)
      if (error) console.warn('[inventory.rooms DELETE] error:', error.message)
    } catch { /* tolerate offline */ }
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid roomId.' },
        { status: 400 },
      )
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
