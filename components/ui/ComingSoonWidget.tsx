'use client'
import { useState } from 'react'
import { Bot, Send } from 'lucide-react'

export function ComingSoonWidget() {
  const [expanded, setExpanded] = useState(false)
  const [showNotify, setShowNotify] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleNotify(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'AI Waitlist Signup',
        email,
        service: 'AI Assistant Waitlist',
        message: 'Notification request for 3C Core AI Assistant launch.',
        company: '',
        phone: '',
      }),
    }).catch(() => {})
    setSubmitted(true)
  }

  return (
    <>
      {showNotify && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.65)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNotify(false) }}
        >
          <div
            className="rounded-xl p-6 w-full max-w-sm shadow-2xl"
            style={{ background: 'rgba(44,31,20,0.98)', border: '1px solid rgba(212,134,10,0.4)' }}
          >
            <h3 className="font-heading font-bold text-white text-lg mb-2">Get Notified</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Be the first to know when the 3C Core AI Assistant goes live.
            </p>
            {submitted ? (
              <p className="text-sm font-medium" style={{ color: '#F0A830' }}>
                You are on the list. We will notify you at launch.
              </p>
            ) : (
              <form onSubmit={handleNotify} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#F0A830', color: '#2C1F14' }}
                >
                  Notify Me When Live
                </button>
              </form>
            )}
            <button
              onClick={() => setShowNotify(false)}
              className="mt-3 text-xs transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)')}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div
          className="fixed bottom-20 right-7 z-[9999] shadow-2xl"
          style={{
            width: 280,
            borderRadius: 12,
            border: '1px solid rgba(212,134,10,0.4)',
            background: 'rgba(44,31,20,0.96)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="px-4 py-3">
            <p className="text-white text-xs font-semibold mb-2">3C Core AI Assistant</p>
            <div className="flex gap-2 items-start">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: 'rgba(212,134,10,0.2)' }}
              >
                <Bot size={12} style={{ color: '#F0A830' }} />
              </div>
              <div
                className="rounded-lg px-3 py-2 text-xs leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
              >
                Hi! I can help with inventory reports, maintenance issues, and property questions.
              </div>
            </div>
          </div>

          <div className="px-3 pb-2">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <input
                disabled
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-xs outline-none cursor-not-allowed"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              />
              <Send size={13} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>

          <div className="px-4 pb-3 text-center">
            <button
              onClick={() => setShowNotify(true)}
              className="text-[10px] transition-colors"
              style={{ color: '#F0A830' }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.textDecoration = 'none')}
            >
              Notify Me When Live
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(v => !v)}
        className="fixed bottom-7 right-7 z-[9999] shadow-2xl flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: '1px solid rgba(212,134,10,0.5)',
          background: 'rgba(44,31,20,0.96)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#F0A830'; e.currentTarget.style.transform = 'scale(1.05)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,134,10,0.5)'; e.currentTarget.style.transform = 'scale(1)' }}
        aria-label="AI Assistant"
      >
        <div className="relative">
          <Bot size={20} style={{ color: '#F0A830' }} />
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{ background: '#F0A830', animation: 'aiPulse 2s infinite' }}
          />
        </div>
      </button>

      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }
      `}</style>
    </>
  )
}
