'use client'
import { useState } from 'react'

export type ServiceTab = 'description' | 'faqs' | 'prices' | 'book'

interface Props {
  children: (activeTab: ServiceTab) => React.ReactNode
}

const TABS: { id: ServiceTab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'faqs',        label: 'FAQs' },
  { id: 'prices',      label: 'Prices' },
  { id: 'book',        label: 'Book Now' },
]

export function ServiceTabNav({ children }: Props) {
  const [active, setActive] = useState<ServiceTab>('description')

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex border-b"
        style={{
          background: 'rgba(44,31,20,0.06)',
          borderColor: 'rgba(212,134,10,0.2)',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === tab.id
                ? 'border-[#D4860A] text-[#D4860A] font-semibold'
                : 'border-transparent text-[#2C1F14] hover:text-[#D4860A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-8 px-4 sm:px-8">{children(active)}</div>
    </div>
  )
}
