'use client'
import { useState, useRef, useEffect, Fragment } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ServicePageHeader } from '@/components/layout/ServicePageHeader'
import { ComingSoonWidget } from '@/components/ui/ComingSoonWidget'
import { BookingForm } from '@/components/forms/BookingForm'
import {
  Upload, Camera, X, Plus, ChevronRight, ChevronLeft,
  Download, Loader2, LogIn, FileVideo,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'build' | 'faqs' | 'prices' | 'book'

interface RoomFile { file: File; preview: string }

interface Room {
  id: string
  name: string
  files: RoomFile[]
  notes: string
}

interface PropertyDetails {
  reportType: 'check_in' | 'check_out'
  addressLine1: string
  addressLine2: string
  postcode: string
  propertyType: 'flat' | 'house' | 'hmo' | 'student'
  inspectionDate: string
  inspectorName: string
}

interface AnalysisItem {
  item_name: string
  category: string
  condition: string
  description: string
  concerns: string
}

interface RoomAnalysis {
  room_name: string
  room_summary: string
  overall_condition: string
  items: AnalysisItem[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'build',    label: 'Build Report' },
  { id: 'faqs',     label: 'FAQs' },
  { id: 'prices',   label: 'Prices' },
  { id: 'book',     label: 'Book Agent' },
]

const WIZARD_STEPS = [
  { n: 1, label: 'Property' },
  { n: 2, label: 'Rooms' },
  { n: 3, label: 'AI Analysis' },
  { n: 4, label: 'Review' },
  { n: 5, label: 'Download' },
]

const CONDITION_COLORS: Record<string, string> = {
  excellent: '#16a34a',
  good:      '#059669',
  fair:      '#D97706',
  poor:      '#EA580C',
  damaged:   '#DC2626',
}

const CONDITION_RGB: Record<string, [number, number, number]> = {
  excellent: [22, 163, 74],
  good:      [5, 150, 105],
  fair:      [217, 119, 6],
  poor:      [234, 88, 12],
  damaged:   [220, 38, 38],
}

const DEFAULT_ROOMS: Room[] = [
  { id: 'r1', name: 'Living Room', files: [], notes: '' },
  { id: 'r2', name: 'Kitchen',     files: [], notes: '' },
  { id: 'r3', name: 'Bedroom 1',   files: [], notes: '' },
  { id: 'r4', name: 'Bathroom',    files: [], notes: '' },
  { id: 'r5', name: 'Hallway',     files: [], notes: '' },
]

const inputCls = 'w-full rounded-lg border border-[rgba(212,134,10,0.3)] bg-white/70 px-3 py-2 text-sm text-[#2C1F14] focus:outline-none focus:border-[#D4860A] transition-colors'
const labelCls = 'block text-xs font-medium text-[#8B3A2A] mb-1 tracking-wide'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

async function generateInventoryPDF(
  reportId: string,
  userName: string,
  details: PropertyDetails,
  analysis: RoomAnalysis[],
) {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw  = doc.internal.pageSize.getWidth()
  const ph  = doc.internal.pageSize.getHeight()
  const m   = 14
  const mw  = pw - m * 2

  // Header bar
  doc.setFillColor(44, 31, 20)
  doc.rect(0, 0, pw, 32, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(240, 168, 48)
  doc.text('3C Core', m, 14)
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text('Inventory Report', m, 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Connected | Consistent | Confident', m, 29)

  let y = 42

  const meta = [
    ['Report ID',   reportId],
    ['Report Type', details.reportType === 'check_in' ? 'Check-In Inventory' : 'Check-Out Inventory'],
    ['Date',        details.inspectionDate],
    ['Inspector',   details.inspectorName],
    ['Prepared by', userName],
    ['Property',    [details.addressLine1, details.addressLine2, details.postcode].filter(Boolean).join(', ')],
    ['Type',        details.propertyType.toUpperCase()],
  ]

  doc.setFontSize(8)
  doc.setTextColor(44, 31, 20)
  for (const [k, v] of meta) {
    doc.setFont('helvetica', 'bold')
    doc.text(`${k}:`, m, y)
    doc.setFont('helvetica', 'normal')
    doc.text(v, m + 30, y)
    y += 6
  }

  y += 2
  doc.setDrawColor(212, 134, 10)
  doc.setLineWidth(0.5)
  doc.line(m, y, pw - m, y)
  y += 8

  for (const room of analysis) {
    if (y > ph - 40) { doc.addPage(); y = 20 }

    doc.setFillColor(255, 248, 238)
    doc.rect(m, y - 5, mw, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(44, 31, 20)
    doc.text(room.room_name, m + 2, y + 2)

    const condRgb = CONDITION_RGB[room.overall_condition] ?? [5, 150, 105]
    doc.setFontSize(8)
    doc.setTextColor(condRgb[0], condRgb[1], condRgb[2])
    doc.text(`${(room.overall_condition ?? 'good').toUpperCase()}`, pw - m - 28, y + 2)
    y += 12

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(44, 31, 20)
    const summaryLines = doc.splitTextToSize(room.room_summary ?? '', mw)
    doc.text(summaryLines, m, y)
    y += summaryLines.length * 5 + 5

    if (room.items?.length) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setFillColor(212, 134, 10)
      doc.rect(m, y - 4, mw, 7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text('Item', m + 2, y)
      doc.text('Condition', m + 58, y)
      doc.text('Description', m + 88, y)
      y += 6

      for (const item of room.items) {
        if (y > ph - 30) { doc.addPage(); y = 20 }
        const descLines = doc.splitTextToSize(item.description ?? '', mw - 90)
        const rowH = Math.max(descLines.length * 4, 6)
        doc.setFillColor(252, 250, 245)
        doc.rect(m, y - 4, mw, rowH + 3, 'F')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(44, 31, 20)
        doc.text(item.item_name ?? '', m + 2, y)
        const cRgb = CONDITION_RGB[item.condition] ?? [5, 150, 105]
        doc.setTextColor(cRgb[0], cRgb[1], cRgb[2])
        doc.text((item.condition ?? '').toUpperCase(), m + 58, y)
        doc.setTextColor(44, 31, 20)
        doc.text(descLines, m + 88, y)
        y += rowH + 4
      }
    }
    y += 8
  }

  doc.setFontSize(7)
  doc.setTextColor(180, 180, 180)
  doc.text('Generated by 3C Core — Connected | Consistent | Confident', m, ph - 10)
  doc.text(`Report ID: ${reportId}`, pw - m - 60, ph - 10)

  doc.save(`3CCore-Inventory-${reportId.slice(0, 8)}.pdf`)
}

// ── StepIndicator ─────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-start justify-center mb-8 overflow-x-auto">
      {WIZARD_STEPS.map((s, i) => (
        <Fragment key={s.n}>
          {i > 0 && (
            <div className={`h-px w-8 sm:w-12 mt-4 shrink-0 ${step > i ? 'bg-[#D4860A]' : 'bg-[rgba(212,134,10,0.2)]'}`} />
          )}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              step >= s.n
                ? 'bg-[#D4860A] border-[#D4860A] text-white'
                : 'bg-white border-[rgba(212,134,10,0.3)] text-[rgba(212,134,10,0.4)]'
            }`}>{s.n}</div>
            <span className={`text-[10px] whitespace-nowrap ${step >= s.n ? 'text-[#D4860A]' : 'text-[rgba(44,31,20,0.35)]'}`}>
              {s.label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

// ── BuildReport Wizard ────────────────────────────────────────────────────────

function BuildReport() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep]         = useState(1)
  const [details, setDetails]   = useState<PropertyDetails>({
    reportType:     'check_in',
    addressLine1:   '',
    addressLine2:   '',
    postcode:       '',
    propertyType:   'flat',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName:  '',
  })
  const [rooms, setRooms]         = useState<Room[]>(DEFAULT_ROOMS.map(r => ({ ...r, files: [] })))
  const [analysis, setAnalysis]   = useState<RoomAnalysis[]>([])
  const [analysing, setAnalysing] = useState(false)
  const [analysisErr, setErr]     = useState('')
  const [pdfDone, setPdfDone]     = useState(false)
  const [loginUrl, setLoginUrl]   = useState('/portal/login')
  const reportId = useRef(crypto.randomUUID())

  useEffect(() => {
    if (session?.user?.name) {
      setDetails(d => ({ ...d, inspectorName: d.inspectorName || session.user!.name! }))
    }
  }, [session?.user?.name])

  useEffect(() => {
    const role = typeof window !== 'undefined' ? sessionStorage.getItem('3c_user_role') || '' : ''
    if (role) setLoginUrl(`/portal/login?role=${role}`)
  }, [])

  // ── File handlers ──

  function handleFileAdd(roomId: string, newFiles: File[]) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      const added = newFiles.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
      return { ...r, files: [...r.files, ...added] }
    }))
  }

  function handleFileRemove(roomId: string, idx: number) {
    setRooms(prev => prev.map(r => {
      if (r.id !== roomId) return r
      const next = [...r.files]
      URL.revokeObjectURL(next[idx].preview)
      next.splice(idx, 1)
      return { ...r, files: next }
    }))
  }

  function addRoom() {
    setRooms(prev => [...prev, { id: `r-${Date.now()}`, name: `Room ${prev.length + 1}`, files: [], notes: '' }])
  }

  function removeRoom(id: string) {
    setRooms(prev => {
      const r = prev.find(r => r.id === id)
      r?.files.forEach(f => URL.revokeObjectURL(f.preview))
      return prev.filter(r => r.id !== id)
    })
  }

  function updateCondition(ri: number, ii: number, condition: string) {
    setAnalysis(prev => prev.map((room, i) =>
      i !== ri ? room : { ...room, items: room.items.map((item, j) => j !== ii ? item : { ...item, condition }) }
    ))
  }

  // ── Analysis ──

  async function runAnalysis() {
    setAnalysing(true)
    setErr('')
    try {
      const roomsPayload = await Promise.all(rooms.map(async room => {
        const imageFiles = room.files.filter(f => isImageFile(f.file))
        const base64Urls = await Promise.all(imageFiles.map(f => fileToBase64(f.file)))
        return { name: room.name, mediaUrls: base64Urls, notes: room.notes ? [room.notes] : [] }
      }))

      const res = await fetch('/api/inventory/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rooms: roomsPayload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data.analysis)
      setStep(4)
    } catch (err) {
      setErr(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setAnalysing(false)
    }
  }

  async function downloadPDF() {
    await generateInventoryPDF(
      reportId.current,
      session?.user?.name ?? 'Unknown',
      details,
      analysis,
    )
    setPdfDone(true)
  }

  function startNew() {
    rooms.forEach(r => r.files.forEach(f => URL.revokeObjectURL(f.preview)))
    setStep(1)
    setDetails({ reportType: 'check_in', addressLine1: '', addressLine2: '', postcode: '', propertyType: 'flat', inspectionDate: new Date().toISOString().split('T')[0], inspectorName: session?.user?.name ?? '' })
    setRooms(DEFAULT_ROOMS.map(r => ({ ...r, files: [] })))
    setAnalysis([])
    setErr('')
    setPdfDone(false)
    reportId.current = crypto.randomUUID()
  }

  // ── Not logged in ──

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-[#D4860A]" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-14 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(212,134,10,0.12)', border: '1px solid rgba(212,134,10,0.3)' }}>
          <LogIn size={24} className="text-[#D4860A]" />
        </div>
        <h3 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Login Required</h3>
        <p className="text-[#8B3A2A] text-sm mb-6 leading-relaxed">
          You need to be logged in to build an inventory report. Your report and all media will be securely stored against your account.
        </p>
        <button
          onClick={() => router.push(loginUrl)}
          className="px-6 py-2.5 bg-[#D4860A] text-white rounded-lg font-medium text-sm hover:bg-[#F0A830] transition-colors"
        >
          Login to Continue
        </button>
      </div>
    )
  }

  const step1Valid = !!(details.addressLine1 && details.postcode && details.inspectionDate && details.inspectorName)
  const totalImages = rooms.reduce((t, r) => t + r.files.filter(f => isImageFile(f.file)).length, 0)

  return (
    <div>
      <StepIndicator step={step} />

      {/* ── Step 1: Property Details ── */}
      {step === 1 && (
        <div className="max-w-xl mx-auto space-y-4">
          {/* Report type toggle */}
          <div>
            <label className={labelCls}>Report Type *</label>
            <div className="flex gap-3">
              {[{ v: 'check_in', l: 'Check-In' }, { v: 'check_out', l: 'Check-Out' }].map(({ v, l }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDetails(d => ({ ...d, reportType: v as 'check_in' | 'check_out' }))}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    details.reportType === v
                      ? 'bg-[#D4860A] border-[#D4860A] text-white'
                      : 'bg-white/70 border-[rgba(212,134,10,0.3)] text-[#2C1F14] hover:border-[#D4860A]'
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Address Line 1 *</label>
            <input className={inputCls} value={details.addressLine1} placeholder="14 Maple Avenue"
              onChange={e => setDetails(d => ({ ...d, addressLine1: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Address Line 2</label>
            <input className={inputCls} value={details.addressLine2} placeholder="Flat 2 (optional)"
              onChange={e => setDetails(d => ({ ...d, addressLine2: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Postcode *</label>
              <input className={inputCls} value={details.postcode} placeholder="SW1A 1AA"
                onChange={e => setDetails(d => ({ ...d, postcode: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className={labelCls}>Property Type *</label>
              <select
                className={inputCls}
                value={details.propertyType}
                onChange={e => setDetails(d => ({ ...d, propertyType: e.target.value as PropertyDetails['propertyType'] }))}
              >
                <option value="flat">Flat / Apartment</option>
                <option value="house">House</option>
                <option value="hmo">HMO</option>
                <option value="student">Student Accommodation</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Inspection Date *</label>
              <input type="date" className={inputCls} value={details.inspectionDate}
                onChange={e => setDetails(d => ({ ...d, inspectionDate: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Inspector Name *</label>
              <input className={inputCls} value={details.inspectorName} placeholder="Full name"
                onChange={e => setDetails(d => ({ ...d, inspectorName: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Room Management ── */}
      {step === 2 && (
        <div className="max-w-3xl mx-auto space-y-4">
          {rooms.map(room => (
            <div key={room.id} className="rounded-xl border border-[rgba(212,134,10,0.25)] bg-white/60 p-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  className="flex-1 border-b border-[rgba(212,134,10,0.3)] bg-transparent text-sm font-semibold text-[#2C1F14] focus:outline-none focus:border-[#D4860A] pb-0.5"
                  value={room.name}
                  onChange={e => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, name: e.target.value } : r))}
                />
                {rooms.length > 1 && (
                  <button onClick={() => removeRoom(room.id)} className="text-[#8B3A2A]/50 hover:text-[#8B3A2A] transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileAdd(room.id, Array.from(e.dataTransfer.files)) }}
                className="border-2 border-dashed border-[rgba(212,134,10,0.3)] rounded-lg p-4 text-center mb-3 hover:border-[#D4860A] transition-colors"
              >
                <Upload size={18} className="text-[#D4860A] mx-auto mb-1.5" />
                <p className="text-xs text-[#8B3A2A]/70 mb-2">Drag photos here or</p>
                <div className="flex gap-2 justify-center">
                  <label htmlFor={`upload-${room.id}`} className="cursor-pointer text-xs px-3 py-1.5 rounded-md bg-[#D4860A] text-white hover:bg-[#F0A830] transition-colors flex items-center gap-1">
                    <Upload size={12} /> Browse
                  </label>
                  <input id={`upload-${room.id}`} type="file" accept="image/*,video/*" multiple className="hidden"
                    onChange={e => handleFileAdd(room.id, Array.from(e.target.files ?? []))} />

                  <label htmlFor={`camera-${room.id}`} className="cursor-pointer text-xs px-3 py-1.5 rounded-md border border-[#D4860A] text-[#D4860A] hover:bg-[rgba(212,134,10,0.1)] transition-colors flex items-center gap-1">
                    <Camera size={12} /> Camera
                  </label>
                  <input id={`camera-${room.id}`} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={e => handleFileAdd(room.id, Array.from(e.target.files ?? []))} />
                </div>
              </div>

              {/* Thumbnails */}
              {room.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {room.files.map((rf, idx) => (
                    <div key={idx} className="relative group w-16 h-16 rounded-md overflow-hidden border border-[rgba(212,134,10,0.2)]">
                      {rf.file.type.startsWith('image/') ? (
                        <img src={rf.preview} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[rgba(212,134,10,0.08)]">
                          <FileVideo size={18} className="text-[#D4860A]" />
                        </div>
                      )}
                      <button
                        onClick={() => handleFileRemove(room.id, idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              <textarea
                rows={2}
                placeholder="Room notes (optional — existing damage, access issues, etc.)"
                value={room.notes}
                onChange={e => setRooms(prev => prev.map(r => r.id === room.id ? { ...r, notes: e.target.value } : r))}
                className="w-full text-xs text-[#2C1F14] bg-white/50 rounded-lg border border-[rgba(212,134,10,0.2)] px-3 py-2 resize-none focus:outline-none focus:border-[#D4860A] transition-colors"
              />
            </div>
          ))}

          <button
            onClick={addRoom}
            className="flex items-center gap-2 text-sm text-[#D4860A] hover:text-[#F0A830] transition-colors mx-auto"
          >
            <Plus size={16} /> Add another room
          </button>
        </div>
      )}

      {/* ── Step 3: AI Analysis ── */}
      {step === 3 && (
        <div className="text-center py-12 max-w-md mx-auto">
          {analysing ? (
            <>
              <Loader2 size={48} className="text-[#D4860A] animate-spin mx-auto mb-5" />
              <h3 className="font-heading font-bold text-[#2C1F14] text-lg mb-2">Analysing Property…</h3>
              <p className="text-[#8B3A2A] text-sm leading-relaxed">
                Claude AI is reviewing your property photos and generating the inventory report. This may take up to a minute.
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(212,134,10,0.12)', border: '1px solid rgba(212,134,10,0.3)' }}>
                <Upload size={24} className="text-[#D4860A]" />
              </div>
              <h3 className="font-heading font-bold text-[#2C1F14] text-lg mb-3">Ready for AI Analysis</h3>
              <p className="text-[#8B3A2A] text-sm mb-2 leading-relaxed">
                <span className="font-semibold text-[#2C1F14]">{totalImages} image{totalImages !== 1 ? 's' : ''}</span> across{' '}
                <span className="font-semibold text-[#2C1F14]">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</span> ready for analysis.
              </p>
              {totalImages === 0 && (
                <p className="text-[#8B3A2A]/70 text-xs mb-4 bg-[rgba(139,58,42,0.06)] border border-[rgba(139,58,42,0.2)] rounded-lg px-4 py-2">
                  No images uploaded — you can still proceed but the AI will note that no images were provided.
                </p>
              )}
              {analysisErr && (
                <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{analysisErr}</p>
              )}
              <button
                onClick={runAnalysis}
                className="px-6 py-3 bg-[#D4860A] text-white rounded-lg font-semibold text-sm hover:bg-[#F0A830] transition-colors"
              >
                Run AI Analysis
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === 4 && (
        <div className="max-w-3xl mx-auto">
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {analysis.map((room, ri) => (
              <div key={ri} className="rounded-xl border border-[rgba(212,134,10,0.25)] bg-white/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-[#2C1F14] text-base">{room.room_name}</h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white uppercase"
                    style={{ background: CONDITION_COLORS[room.overall_condition] ?? '#059669' }}>
                    {room.overall_condition}
                  </span>
                </div>
                <p className="text-xs text-[#8B3A2A] mb-4 leading-relaxed">{room.room_summary}</p>

                <div className="space-y-2">
                  {(room.items ?? []).map((item, ii) => (
                    <div key={ii} className="flex items-start gap-3 p-2.5 rounded-lg bg-[rgba(212,134,10,0.04)] border border-[rgba(212,134,10,0.1)]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs font-semibold text-[#2C1F14]">{item.item_name}</p>
                          <select
                            value={item.condition}
                            onChange={e => updateCondition(ri, ii, e.target.value)}
                            className="text-[10px] rounded px-1.5 py-0.5 border border-[rgba(212,134,10,0.25)] bg-white focus:outline-none font-medium"
                            style={{ color: CONDITION_COLORS[item.condition] ?? '#059669' }}
                          >
                            {['excellent', 'good', 'fair', 'poor', 'damaged'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <p className="text-[11px] text-[#2C1F14]/70 leading-relaxed">{item.description}</p>
                        {item.concerns && (
                          <p className="text-[10px] text-[#8B3A2A] mt-1">&#9888; {item.concerns}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 5: Download ── */}
      {step === 5 && (
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(212,134,10,0.12)', border: '1px solid rgba(212,134,10,0.3)' }}>
            <Download size={24} className="text-[#D4860A]" />
          </div>
          <h3 className="font-heading font-bold text-[#2C1F14] text-xl mb-2">Report Ready</h3>
          <p className="text-[#8B3A2A] text-sm mb-4 leading-relaxed">Your AI-generated inventory report is ready to download as a PDF.</p>
          <p className="text-xs text-[#2C1F14]/50 mb-6">
            Report ID: <span className="font-mono text-[#D4860A]">{reportId.current}</span>
          </p>

          {pdfDone ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-green-600 text-sm font-semibold">PDF downloaded successfully</p>
              <button onClick={startNew} className="text-xs text-[#D4860A] underline hover:text-[#F0A830]">
                Start a new report
              </button>
            </div>
          ) : (
            <button
              onClick={downloadPDF}
              className="px-6 py-3 bg-[#D4860A] text-white rounded-lg font-semibold text-sm hover:bg-[#F0A830] transition-colors flex items-center gap-2 mx-auto"
            >
              <Download size={16} /> Download PDF Report
            </button>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-[rgba(212,134,10,0.15)] max-w-3xl mx-auto">
        {step > 1 && step < 5 && !analysing && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 text-sm text-[#8B3A2A] hover:text-[#2C1F14] transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <div className="ml-auto">
          {step === 1 && (
            <button
              onClick={() => step1Valid && setStep(2)}
              disabled={!step1Valid}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#D4860A] text-white rounded-lg text-sm font-medium hover:bg-[#F0A830] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Rooms <ChevronRight size={16} />
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#D4860A] text-white rounded-lg text-sm font-medium hover:bg-[#F0A830] transition-colors"
            >
              Next: AI Analysis <ChevronRight size={16} />
            </button>
          )}
          {step === 4 && (
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#D4860A] text-white rounded-lg text-sm font-medium hover:bg-[#F0A830] transition-colors"
            >
              Continue to Download <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#FFF8EE 0%,#FDE8B0 50%,#F5C060 100%)' }}>
      <ServicePageHeader />

      {/* Hero */}
      <div className="relative px-6 py-10 text-center overflow-hidden"
        style={{ borderBottom: '1px solid rgba(212,134,10,0.2)' }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url('/assets/images/homepage_3c.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative">
          <h1 className="font-heading font-bold text-[#2C1F14] text-3xl sm:text-4xl">
            Inventory Management
          </h1>
          <p className="mt-2 text-[#8B3A2A] text-base sm:text-lg">
            Professional property inventories — legally sound, digitally delivered
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-[rgba(255,248,238,0.95)] backdrop-blur-sm border-b border-[rgba(212,134,10,0.2)]">
        <div className="max-w-5xl mx-auto px-4 flex overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-[#D4860A] text-[#D4860A]'
                  : 'border-transparent text-[#2C1F14]/60 hover:text-[#2C1F14]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {tab === 'overview' && (
          <div className="space-y-10">
            <Section title="Why Inventories Matter">
              <p>A property inventory is a detailed record of the condition and contents of a property at a specific point in time. Under tenancy deposit protection rules, a thorough inventory is essential for making or defending deposit deductions at the end of a tenancy.</p>
              <p className="mt-3">Without a proper check-in inventory, landlords cannot legally make deposit deductions — and tenants have no documented baseline to challenge unfair claims. 3C Core provides both AI-assisted and professional agent inventory services.</p>
            </Section>

            <div className="grid sm:grid-cols-2 gap-6">
              <ServiceCard title="DIY with AI Assistance">
                <ul className="space-y-2 text-sm text-[#2C1F14]">
                  <li>• You conduct the inspection yourself</li>
                  <li>• Upload photos and notes via the Build Report tab</li>
                  <li>• AI refines your inputs into a professional, legally sound report</li>
                  <li>• Review and download as PDF</li>
                </ul>
              </ServiceCard>
              <ServiceCard title="Professional Agent Inspection">
                <ul className="space-y-2 text-sm text-[#2C1F14]">
                  <li>• A qualified inventory agent attends the property</li>
                  <li>• Full written report with timestamped photos</li>
                  <li>• Report shared digitally with all parties</li>
                  <li>• Legally defensible documentation</li>
                </ul>
              </ServiceCard>
            </div>

            <Section title="Check-In Inspection">
              <p>Conducted at the start of the tenancy, documenting the condition of every room, fixture, and fitting. Tenants can review and add comments or photos (subject to landlord approval). All parties digitally sign the final report. Reports are stored for a maximum of 2 years.</p>
            </Section>

            <Section title="Check-Out Inspection">
              <p>Conducted at the end of the tenancy and compared against the check-in report. Documents changes, damage, and missing items. Tenants can provide feedback and submit additional photos, subject to landlord approval before finalisation. All parties sign digitally.</p>
            </Section>

            <Callout title="Legal Implications">
              <ul className="space-y-1.5 text-sm">
                <li>• Failure to have a proper inventory can result in deposit disputes being lost automatically.</li>
                <li>• Without a check-in report, landlords cannot legally make deposit deductions.</li>
                <li>• Tenants: always request a copy of the inventory before signing your tenancy agreement.</li>
              </ul>
            </Callout>
          </div>
        )}

        {tab === 'build' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="font-heading font-bold text-[#2C1F14] text-xl mb-1">Build Inventory Report</h2>
              <p className="text-[#8B3A2A] text-sm">Upload photos of each room and let AI generate a professional inventory report in minutes.</p>
            </div>
            <BuildReport />
          </div>
        )}

        {tab === 'faqs' && (
          <div className="space-y-4">
            {INVENTORY_FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        )}

        {tab === 'prices' && (
          <div className="space-y-6">
            <Section title="Pricing">
              <p className="text-sm text-[#2C1F14] mb-4">Pricing will be confirmed upon booking. Contact us at <a href="mailto:contactus@3ccore.com" className="text-[#D4860A] underline">contactus@3ccore.com</a> or call <a href="tel:07852254792" className="text-[#D4860A] underline">07852254792</a> for a quote.</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: 'rgba(212,134,10,0.12)' }}>
                    <th className="text-left px-4 py-2 text-[#2C1F14] font-semibold border border-[rgba(212,134,10,0.2)]">Service</th>
                    <th className="text-left px-4 py-2 text-[#2C1F14] font-semibold border border-[rgba(212,134,10,0.2)]">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY_PRICES.map(row => (
                    <tr key={row.service}>
                      <td className="px-4 py-2 border border-[rgba(212,134,10,0.2)] text-[#2C1F14]">{row.service}</td>
                      <td className="px-4 py-2 border border-[rgba(212,134,10,0.2)] text-[#D4860A] font-medium">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-[#8B3A2A]">Subscription plans for landlords with multiple properties — coming soon.</p>
            </Section>
          </div>
        )}

        {tab === 'book' && (
          <BookingForm serviceType="Inventory Management" />
        )}
      </div>

      <ComingSoonWidget />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

// ── Helper UI components ──────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading font-semibold text-[#D4860A] text-xl mb-3">{title}</h2>
      <div className="text-[#2C1F14] leading-relaxed">{children}</div>
    </div>
  )
}

function ServiceCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(212,134,10,0.08)', border: '1px solid rgba(212,134,10,0.25)' }}>
      <h3 className="font-heading font-semibold text-[#2C1F14] text-base mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'rgba(139,58,42,0.08)', border: '1px solid rgba(139,58,42,0.25)' }}>
      <h3 className="font-heading font-semibold text-[#8B3A2A] text-base mb-3">{title}</h3>
      <div className="text-[#2C1F14]">{children}</div>
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(212,134,10,0.2)' }}>
      <p className="font-semibold text-[#2C1F14] text-sm mb-1">Q: {q}</p>
      <p className="text-[#2C1F14] text-sm leading-relaxed">A: {a}</p>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const INVENTORY_FAQS = [
  { q: 'What is a property inventory?', a: 'A detailed record of the condition and contents of a property at a specific point in time — used to protect both landlords and tenants during a tenancy.' },
  { q: 'Is an inventory a legal requirement?', a: 'While not strictly required by law, it is strongly recommended and is essential for making or disputing deposit deductions under tenancy deposit protection schemes.' },
  { q: 'Who should be present at the inventory?', a: 'Ideally both the landlord (or their agent) and the tenant. All parties must sign the final report.' },
  { q: 'Can tenants add comments to the report?', a: 'Yes. Tenants can submit feedback, amendments, or additional photos. These are reviewed by the landlord before being added to the final report.' },
  { q: 'How long is the report kept?', a: 'Reports are retained for a maximum of 2 years in line with our data retention policy.' },
  { q: 'What happens if there is a dispute about the inventory?', a: 'A signed inventory report is the key piece of evidence. See our Dispute Resolution service for how we help resolve inventory disagreements.' },
  { q: 'Can I use my own photos?', a: 'Yes. With our DIY option, you upload your own photos and notes. Our AI will produce a professional-grade written report from your inputs.' },
]

const INVENTORY_PRICES = [
  { service: 'Check-In Inventory (DIY + AI)',        price: 'Contact Us' },
  { service: 'Check-In Inventory (Professional)',    price: 'Contact Us' },
  { service: 'Check-Out Inventory (DIY + AI)',       price: 'Contact Us' },
  { service: 'Check-Out Inventory (Professional)',   price: 'Contact Us' },
  { service: 'Combined Check-In & Check-Out',        price: 'Contact Us' },
]
