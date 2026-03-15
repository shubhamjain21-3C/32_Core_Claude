import type { Metadata } from 'next'
import { AddPropertyForm } from '@/components/portal/AddPropertyForm'

export const metadata: Metadata = { title: 'Add Property | 3C Core Portal' }

export default function NewPropertyPage() {
  return (
    <div className="p-8">
      <p className="text-[10px] tracking-[3px] text-[#4a90c4] uppercase mb-1">Client Portal</p>
      <h1 className="text-2xl font-bold font-heading text-white mb-8">Add a Property</h1>
      <div className="max-w-2xl">
        <div className="bg-[#0d1f3c] border border-[#1e3a5f] rounded-2xl p-8">
          <AddPropertyForm />
        </div>
      </div>
    </div>
  )
}
