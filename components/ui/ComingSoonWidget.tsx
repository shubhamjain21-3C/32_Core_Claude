'use client'

export function ComingSoonWidget() {
  return (
    <div
      className="fixed bottom-7 right-7 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl cursor-default select-none"
      style={{ background: 'rgba(212,134,10,0.92)' }}
    >
      <span className="text-base">🤖</span>
      <div className="leading-tight">
        <p className="text-white text-xs font-semibold">3C Core Assistant</p>
        <p className="text-[#FDE8B0] text-[10px]">Coming Soon — Stay Tuned</p>
      </div>
    </div>
  )
}
