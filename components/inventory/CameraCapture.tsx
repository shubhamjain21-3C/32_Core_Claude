'use client'
import { useEffect, useRef, useState } from 'react'
import { Camera, X, RotateCcw, Check, AlertTriangle, Upload } from 'lucide-react'

interface Props {
  open:    boolean
  onClose: () => void
  /** Called with one or more captured files; component handles its own close after capture. */
  onCapture: (files: File[]) => void
}

// In-page live camera capture using getUserMedia + canvas. On mobile devices
// where camera access fails, the user falls back to the inline file input
// (with capture="environment"), so we never block them.
export function CameraCapture({ open, onClose, onCapture }: Props) {
  const videoRef  = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [permState, setPermState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [errMsg, setErrMsg] = useState('')

  // Start / stop stream when modal opens or facing changes
  useEffect(() => {
    if (!open) return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermState('unavailable')
      return
    }
    let cancelled = false

    async function start() {
      setPermState('requesting')
      setErrMsg('')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setPermState('granted')
      } catch (err) {
        const name = err instanceof DOMException ? err.name : ''
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          setPermState('denied')
          setErrMsg('Camera access was blocked. You can still upload photos from your device below.')
        } else if (name === 'NotFoundError') {
          setPermState('unavailable')
          setErrMsg('No camera found on this device. Use the file upload option instead.')
        } else {
          setPermState('unavailable')
          setErrMsg('Could not access camera. Use the file upload option instead.')
        }
      }
    }
    start()

    return () => {
      cancelled = true
      stopStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing])

  // Stop the stream when the modal closes
  useEffect(() => {
    if (!open) stopStream()
  }, [open])

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  function takePhoto() {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.85))
  }

  function retake() {
    setPreviewUrl(null)
  }

  async function confirmPhoto() {
    if (!previewUrl || !canvasRef.current) return
    await new Promise<void>(resolve => {
      canvasRef.current!.toBlob(
        blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
            onCapture([file])
          }
          resolve()
        },
        'image/jpeg',
        0.85,
      )
    })
    setPreviewUrl(null)
    onClose()
  }

  function handleFallbackFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    onCapture(Array.from(files))
    onClose()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-4"
      style={{ background: 'rgba(20,10,2,0.85)' }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#1a1208', border: '1.5px solid rgba(212,134,10,0.35)' }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(212,134,10,0.25)' }}>
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-[#F0A830]" />
            <span className="text-sm font-semibold text-white">Capture from Camera</span>
          </div>
          <button
            type="button"
            onClick={() => { stopStream(); onClose() }}
            className="text-white/70 hover:text-white"
            aria-label="Close camera"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="relative bg-black">
          {permState === 'requesting' && (
            <div className="aspect-video flex items-center justify-center text-white/80 text-sm">
              Requesting camera permission…
            </div>
          )}

          {(permState === 'denied' || permState === 'unavailable') && (
            <div className="aspect-video flex flex-col items-center justify-center px-6 text-center gap-3 text-white">
              <AlertTriangle size={28} className="text-[#F0A830]" />
              <p className="text-sm leading-relaxed max-w-md">{errMsg}</p>
              <label
                htmlFor="camera-fallback-input"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                style={{ background: '#D4860A', color: 'white' }}
              >
                <Upload size={14} /> Choose photos from device
              </label>
              <input
                id="camera-fallback-input"
                type="file"
                accept="image/*,video/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={e => handleFallbackFiles(e.target.files)}
              />
            </div>
          )}

          {permState === 'granted' && !previewUrl && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full max-h-[70vh] object-contain bg-black"
            />
          )}

          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Captured preview" className="w-full max-h-[70vh] object-contain bg-black" />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        {permState === 'granted' && (
          <div className="flex items-center justify-between gap-3 px-4 py-3" style={{ background: '#0f0904' }}>
            <button
              type="button"
              onClick={() => setFacing(f => f === 'environment' ? 'user' : 'environment')}
              className="text-xs text-white/70 hover:text-[#F0A830] inline-flex items-center gap-1.5"
              title="Switch camera"
            >
              <RotateCcw size={13} />
              Switch camera
            </button>

            {previewUrl ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={retake}
                  className="px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: 'rgba(212,134,10,0.4)', color: '#F0A830' }}
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={confirmPhoto}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: '#D4860A' }}
                >
                  <Check size={14} /> Use Photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={takePhoto}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: '#D4860A' }}
              >
                <Camera size={14} /> Capture
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
