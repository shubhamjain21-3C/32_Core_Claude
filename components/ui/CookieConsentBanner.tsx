'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('3c_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('3c_cookie_consent', 'all')
    setVisible(false)
  }

  function rejectNonEssential() {
    localStorage.setItem('3c_cookie_consent', 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10002] bg-[rgba(44,31,20,0.97)] border-t border-[rgba(212,134,10,0.3)] px-4 py-4 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-[#FDE8B0] text-sm flex-1 leading-relaxed">
          We use cookies to improve your experience.{' '}
          <Link href="/legal/cookies" className="underline text-[#F0A830] hover:text-white">
            Manage Preferences
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={rejectNonEssential}
            className="px-4 py-2 text-xs border border-[rgba(212,134,10,0.5)] text-[#F0A830] rounded hover:bg-[rgba(212,134,10,0.1)] transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-xs bg-[#D4860A] text-white rounded hover:bg-[#F0A830] transition-colors font-medium"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}
