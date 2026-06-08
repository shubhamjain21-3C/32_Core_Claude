import { NextResponse } from 'next/server'
import { z } from 'zod'
import { jsPDF } from 'jspdf'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const runtime  = 'nodejs'

// ── Schema ──────────────────────────────────────────────────────────────────
const roomSchema = z.object({
  room_name:         z.string(),
  room_type_label:   z.string().optional(),
  overall_condition: z.string().optional(),
  room_summary:      z.string().optional(),
  notes:             z.string().optional(),
  items: z.array(z.object({
    item_name:   z.string(),
    condition:   z.string().optional(),
    description: z.string().optional(),
    concerns:    z.string().optional(),
  })).default([]),
  imageUrls: z.array(z.string()).default([]),
})

const pdfSchema = z.object({
  reportId:        z.string().uuid().optional(),
  reportTypeLabel: z.string().default('Inventory Report'),
  propertyAddress: z.string().default(''),
  inspectionDate:  z.string().default(''),
  inspectorName:   z.string().default(''),
  preparedBy:      z.string().default(''),
  rooms:           z.array(roomSchema).default([]),
})

// Colour palette — keep aligned with the amber/gold brand
const COLOURS = {
  primary:   [212, 134, 10] as [number, number, number],
  dark:      [44, 31, 20]   as [number, number, number],
  muted:     [139, 58, 42]  as [number, number, number],
  bg:        [255, 248, 238] as [number, number, number],
  divider:   [212, 134, 10] as [number, number, number],
}

const CONDITION_RGB: Record<string, [number, number, number]> = {
  excellent: [22, 163, 74],
  good:      [5, 150, 105],
  fair:      [217, 119, 6],
  poor:      [234, 88, 12],
  damaged:   [220, 38, 38],
  missing:   [127, 29, 29],
  not_applicable: [120, 120, 120],
}

// ── Builder ────────────────────────────────────────────────────────────────
function buildPdf(data: z.infer<typeof pdfSchema>) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw  = doc.internal.pageSize.getWidth()
  const ph  = doc.internal.pageSize.getHeight()
  const m   = 14
  const mw  = pw - m * 2

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...COLOURS.dark)
  doc.rect(0, 0, pw, 32, 'F')
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...COLOURS.primary)
  doc.text('3C Core', m, 14)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(255, 255, 255)
  doc.text(data.reportTypeLabel, m, 21)
  doc.setFontSize(7)
  doc.text('Connected | Consistent | Confident', m, 27)
  doc.setFontSize(7).setTextColor(255, 255, 255)
  doc.text('Office 818, 1 Roundhouse Road,', pw - m, 12, { align: 'right' })
  doc.text('Pride Park, Derby, DE24 8JE', pw - m, 17, { align: 'right' })
  doc.text('contactus@3ccore.com  ·  3ccore.com', pw - m, 22, { align: 'right' })

  let y = 42

  // ── Meta block ─────────────────────────────────────────────────────────────
  doc.setTextColor(...COLOURS.dark).setFontSize(8)
  const meta: Array<[string, string]> = [
    ['Report ID',       (data.reportId ?? '—').slice(0, 24)],
    ['Report Type',     data.reportTypeLabel],
    ['Inspection Date', data.inspectionDate || '—'],
    ['Inspector',       data.inspectorName  || '—'],
    ['Prepared by',     data.preparedBy     || data.inspectorName || '—'],
    ['Property',        data.propertyAddress || '—'],
  ]
  for (const [k, v] of meta) {
    doc.setFont('helvetica', 'bold').text(`${k}:`, m, y)
    doc.setFont('helvetica', 'normal').text(v, m + 32, y)
    y += 6
  }
  y += 2
  doc.setDrawColor(...COLOURS.divider).setLineWidth(0.5).line(m, y, pw - m, y)
  y += 8

  // ── Rooms ──────────────────────────────────────────────────────────────────
  for (const room of data.rooms) {
    if (y > ph - 60) { doc.addPage(); y = 20 }

    // Room title bar
    doc.setFillColor(...COLOURS.bg)
    doc.rect(m, y - 5, mw, 10, 'F')
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...COLOURS.dark)
    doc.text(room.room_name, m + 2, y + 2)
    if (room.overall_condition) {
      const rgb = CONDITION_RGB[room.overall_condition] ?? COLOURS.dark
      doc.setFontSize(8).setTextColor(...rgb)
      doc.text(room.overall_condition.toUpperCase(), pw - m - 2, y + 2, { align: 'right' })
    }
    y += 12

    // Room type / summary / notes
    if (room.room_type_label) {
      doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(...COLOURS.muted)
      doc.text(`Type: ${room.room_type_label}`, m, y); y += 5
    }
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...COLOURS.dark)
    if (room.room_summary) {
      const lines = doc.splitTextToSize(room.room_summary, mw)
      doc.text(lines, m, y); y += lines.length * 4.5 + 3
    }
    if (room.notes) {
      doc.setFont('helvetica', 'italic').setTextColor(...COLOURS.muted)
      const noteLines = doc.splitTextToSize(`Notes: ${room.notes}`, mw)
      doc.text(noteLines, m, y); y += noteLines.length * 4.5 + 3
      doc.setFont('helvetica', 'normal').setTextColor(...COLOURS.dark)
    }

    // Items table
    if (room.items.length > 0) {
      if (y > ph - 40) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold').setFontSize(7)
      doc.setFillColor(...COLOURS.primary).rect(m, y - 4, mw, 7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('Item',        m + 2,  y)
      doc.text('Condition',   m + 60, y)
      doc.text('Description', m + 90, y)
      y += 6

      for (const item of room.items) {
        if (y > ph - 25) { doc.addPage(); y = 20 }
        const descLines = doc.splitTextToSize(item.description ?? '', mw - 92)
        const rowH = Math.max(descLines.length * 4, 6)
        doc.setFillColor(252, 250, 245).rect(m, y - 4, mw, rowH + 3, 'F')
        doc.setFont('helvetica', 'normal').setFontSize(7).setTextColor(...COLOURS.dark)
        doc.text(item.item_name, m + 2, y)
        const condRgb = CONDITION_RGB[(item.condition ?? '').toLowerCase()] ?? COLOURS.dark
        doc.setTextColor(...condRgb)
        doc.text((item.condition ?? '').toUpperCase(), m + 60, y)
        doc.setTextColor(...COLOURS.dark)
        doc.text(descLines, m + 90, y)
        y += rowH + 4
      }
    }
    y += 6
  }

  // ── Signature blocks ───────────────────────────────────────────────────────
  if (y > ph - 60) { doc.addPage(); y = 20 }
  y += 4
  doc.setDrawColor(...COLOURS.divider).line(m, y, pw - m, y)
  y += 8
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...COLOURS.dark)
  doc.text('Signatures', m, y); y += 8

  const colW = mw / 3 - 4
  const signBlock = (label: string, x: number) => {
    doc.setDrawColor(...COLOURS.muted).setLineWidth(0.3)
    doc.line(x, y + 14, x + colW, y + 14)
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...COLOURS.muted)
    doc.text(label, x, y + 19)
    doc.text('Date: __________________', x, y + 24)
  }
  signBlock('Landlord / Manager', m)
  signBlock('Tenant',             m + colW + 4)
  signBlock('Agent / Inspector',  m + (colW + 4) * 2)

  // ── Footer (every page) ────────────────────────────────────────────────────
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(7).setTextColor(180, 180, 180)
    doc.text('Generated by 3C Core | contactus@3ccore.com | 3ccore.com', m, ph - 8)
    doc.text(`Page ${p} of ${total}`, pw - m, ph - 8, { align: 'right' })
  }

  return doc
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = pdfSchema.parse(body)

    const doc = buildPdf(data)
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    let storedUrl: string | null = null
    let storagePath: string | null = null

    // Upload to inventory-reports bucket (best-effort)
    if (data.reportId) {
      try {
        const admin = createAdminClient()
        storagePath = `${data.reportId}/inventory-${Date.now()}.pdf`
        const { error: upErr } = await admin.storage
          .from('inventory-reports')
          .upload(storagePath, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          })
        if (!upErr) {
          const { data: signed } = await admin.storage
            .from('inventory-reports')
            .createSignedUrl(storagePath, 60 * 60 * 24 * 30) // 30 days
          storedUrl = signed?.signedUrl ?? null
          // Best-effort: save the URL onto the report row
          await admin
            .from('inventory_reports')
            .update({ pdf_url: storedUrl } as never)
            .eq('InventoryReport_id', data.reportId)
        } else {
          console.warn('[generate-pdf] storage upload failed:', upErr.message)
        }
      } catch (err) {
        console.warn('[generate-pdf] storage not available:', err)
      }
    }

    // Return the PDF inline so the browser can download immediately. We attach
    // the signed URL in a header so the caller can also link to the stored copy.
    return new NextResponse(pdfBuffer, {
      status:  200,
      headers: {
        'Content-Type':         'application/pdf',
        'Content-Disposition':  `attachment; filename="3CCore-Inventory-${(data.reportId ?? 'report').slice(0, 8)}.pdf"`,
        'X-Stored-Pdf-Url':     storedUrl ?? '',
        'X-Stored-Pdf-Path':    storagePath ?? '',
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Invalid request.' }, { status: 400 })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[generate-pdf] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
