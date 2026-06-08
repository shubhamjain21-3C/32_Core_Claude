import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { lookupId } from '@/lib/lookups'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// Server runtime keeps file uploads off the edge — we use the service-role
// Supabase client to bypass RLS for inventory media (private bucket).
export const runtime = 'nodejs'

const BUCKET = 'inventory-media'
const MAX_BYTES = 100 * 1024 * 1024 // 100 MB / file

function sanitiseName(name: string) {
  return name.replace(/[^\w.\-]+/g, '_').slice(0, 120)
}

function detectMediaTypeCode(mime: string): 'image' | 'video' | 'document' | 'pdf' {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime === 'application/pdf') return 'pdf'
  return 'document'
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const reportId = form.get('reportId')?.toString() ?? ''
    const roomId   = form.get('roomId')?.toString()   ?? ''
    const itemId   = form.get('itemId')?.toString()   || null
    const caption  = form.get('caption')?.toString()  ?? ''

    if (!file || !reportId || !roomId) {
      return NextResponse.json(
        { success: false, message: 'file, reportId and roomId are required.' },
        { status: 400 },
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, message: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB).` },
        { status: 413 },
      )
    }

    const mediaTypeCode = detectMediaTypeCode(file.type)
    const fileName      = `${Date.now()}-${randomUUID().slice(0, 8)}-${sanitiseName(file.name || 'file')}`
    // Path encodes report + room (or item) for clean structure & RLS-friendly listing.
    const storagePath   = `${reportId}/${itemId ?? roomId}/${fileName}`

    let admin
    try {
      admin = createAdminClient()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Storage is not configured. Please contact support.' },
        { status: 500 },
      )
    }

    // ── Upload to Supabase Storage ────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
    if (uploadError) {
      console.error('[inventory.upload] storage error:', uploadError.message)
      return NextResponse.json(
        { success: false, message: `Upload failed: ${uploadError.message}` },
        { status: 502 },
      )
    }

    // Signed URL — keeps the file private but lets the page render it for review.
    const { data: signed } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7) // 7 days

    // ── Insert media row (best-effort) ────────────────────────────────────────
    const [entityTypeId, mediaTypeId] = await Promise.all([
      lookupId('ref_entity_types', itemId ? 'inventory_item' : 'inventory_room').catch(() => null),
      lookupId('ref_media_types',  mediaTypeCode).catch(() => null),
    ])

    const mediaId = randomUUID()
    let mediaRowSaved = false
    try {
      const insertPayload = {
        Media_id:       mediaId,
        entity_type_id: entityTypeId,
        entity_id:      itemId ?? roomId,
        storage_path:   storagePath,
        public_url:     signed?.signedUrl ?? '',
        media_type_id:  mediaTypeId,
        caption:        caption || null,
        User_Id:        null,
        // Inventory media is retained — never auto-deleted.
        auto_delete_at: null,
      }
      const { error: mediaError } = await admin
        .from('media')
        .insert(insertPayload as never)
      if (mediaError) {
        console.warn('[inventory.upload] media row insert failed:', mediaError.message)
      } else {
        mediaRowSaved = true
      }
    } catch (err) {
      console.warn('[inventory.upload] media row insert exception:', err)
    }

    return NextResponse.json({
      success:       true,
      mediaId,
      storagePath,
      publicUrl:     signed?.signedUrl ?? null,
      mediaTypeCode,
      mediaRowSaved,
    })
  } catch (err) {
    console.error('[inventory.upload] unexpected error:', err)
    return NextResponse.json(
      { success: false, message: 'Upload error. Please try again.' },
      { status: 500 },
    )
  }
}

// Delete a previously-uploaded media item by storage path
const allowedDeleteRe = /^[\w-]+\/[\w-]+\/.+$/
export async function DELETE(req: Request) {
  try {
    const body = await req.json() as { storagePath?: string; mediaId?: string }
    const path = body.storagePath
    if (!path || !allowedDeleteRe.test(path)) {
      return NextResponse.json({ success: false, message: 'storagePath required.' }, { status: 400 })
    }
    try {
      const admin = createAdminClient()
      await admin.storage.from(BUCKET).remove([path])
      if (body.mediaId) {
        await admin.from('media').delete().eq('Media_id', body.mediaId)
      }
    } catch (err) {
      console.warn('[inventory.upload DELETE] error:', err)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 })
  }
}
