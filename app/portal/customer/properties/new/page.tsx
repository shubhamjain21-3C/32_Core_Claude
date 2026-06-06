import type { Metadata } from 'next'
import { AddPropertyForm } from '@/components/portal/AddPropertyForm'

export const metadata: Metadata = { title: 'Add Property | 3C Core Portal' }

export default function NewPropertyPage() {
  return (
    <div className="p-8">
      <p className="text-[10px] tracking-[3px] text-[#D4860A] uppercase mb-1 font-medium">Client Portal</p>
      <h1 className="text-2xl font-bold font-heading text-[#2C1F14] mb-8">Add a Property</h1>
      <div className="max-w-2xl">
        <div className="rounded-2xl p-8" style={{ background: 'white', border: '1px solid rgba(212,134,10,0.2)', boxShadow: '0 1px 4px rgba(44,31,20,0.06)' }}>
          <AddPropertyForm />
        </div>
      </div>
    </div>
  )
}
