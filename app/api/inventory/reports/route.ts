import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { lookupId } from '@/lib/lookups'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// ── POST: create a new draft report ─────────────────────────────────────────
//
// Best-effort persistence: if Supabase rejects (env vars missing, FK on User_id
// because the NextAuth user isn't in `public.users`, etc.) we still return a
// client-side UUID so the DIY page can keep working offline-first.

const createSchema = z.object({
  reportTypeCode: z.string().min(1),         // ref_report_types.code
  propertyId:     z.string().uuid().optional(),
  inspectionDate: z.string().min(1),
  inspectorName:  z.string().min(1),
  // Optional address fields when the user is capturing a new property
  addressLine1:   z.string().optional(),
  addressLine2:   z.string().optional(),
  city:           z.string().optional(),
  postcode:       z.string().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    // Resolve lookup ids
    let reportTypeId: number | null = null
    let statusId:     number | null = null
    try {
      reportTypeId = await lookupId('ref_report_types',  data.reportTypeCode)
      statusId     = await lookupId('ref_report_status', 'draft')
    } catch { /* tolerate offline */ }

    let reportId: string = randomUUID()
    let dbSaved  = false
    let warning: string | null = null

    try {
      const admin = createAdminClient()
      const payload = {
        property_id:        data.propertyId ?? null,
        report_type_id:     reportTypeId,
        User_Id:            null, // NextAuth ids don't map to Supabase auth.users yet
        status_id:          statusId,
        ai_generated:       false,
        clerk_notes:        data.inspectorName
          ? `Inspector: ${data.inspectorName}`
          : null,
      }
      // Supabase JS strict-types don't always pick this row shape up cleanly
      // for tables with case-sensitive PostgreSQL columns; cast to never.
      const { data: row, error } = await admin
        .from('inventory_reports')
        .insert(payload as never)
        .select('"InventoryReport_id"')
        .single()

      if (error) {
        console.warn('[inventory.reports] insert failed:', error.message)
        warning = 'Report not persisted to database — continuing offline.'
      } else if (row) {
        reportId = (row as { InventoryReport_id: string }).InventoryReport_id
        dbSaved = true
      }
    } catch (err) {
      console.warn('[inventory.reports] Supabase unavailable:', err)
      warning = 'Report not persisted to database — continuing offline.'
    }

    return NextResponse.json({
      success:  true,
      reportId,
      dbSaved,
      warning,
      session: session ? { name: session.user?.name, email: session.user?.email } : null,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    console.error('[inventory.reports] unexpected error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error.' },
      { status: 500 },
    )
  }
}

// ── PATCH: autosave draft / update fields ───────────────────────────────────
const patchSchema = z.object({
  reportId:   z.string().uuid(),
  statusCode: z.string().optional(),          // e.g. 'pending_review'
  aiSummary:  z.string().optional(),
  pdfUrl:     z.string().optional(),
  notes:      z.string().optional(),
})

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const data = patchSchema.parse(body)

    const update: Record<string, unknown> = {}
    if (data.aiSummary !== undefined) update.ai_summary = data.aiSummary
    if (data.pdfUrl    !== undefined) update.pdf_url    = data.pdfUrl
    if (data.notes     !== undefined) update.clerk_notes = data.notes
    if (data.statusCode) {
      const statusId = await lookupId('ref_report_status', data.statusCode).catch(() => null)
      if (statusId) update.status_id = statusId
    }

    try {
      const admin = createAdminClient()
      const { error } = await admin
        .from('inventory_reports')
        .update(update as never)
        .eq('InventoryReport_id', data.reportId)
      if (error) {
        return NextResponse.json({ success: false, message: error.message, dbSaved: false })
      }
      return NextResponse.json({ success: true, dbSaved: true })
    } catch (err) {
      console.warn('[inventory.reports PATCH] supabase unavailable:', err)
      return NextResponse.json({ success: true, dbSaved: false, warning: 'Persistence skipped' })
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: err.errors[0]?.message ?? 'Invalid request.' },
        { status: 400 },
      )
    }
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 })
  }
}
