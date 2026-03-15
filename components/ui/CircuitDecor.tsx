export function CircuitDecor({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transforms = {
    tl: '',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180',
  }
  return (
    <div className={`absolute ${position.includes('t') ? 'top-0' : 'bottom-0'} ${position.includes('l') ? 'left-0' : 'right-0'} w-32 h-32 opacity-30 pointer-events-none`}>
      <svg viewBox="0 0 120 120" className={`w-full h-full ${transforms[position]}`} fill="none">
        <line x1="0"  y1="40" x2="40" y2="40" stroke="#1a4a7a" strokeWidth="0.6"/>
        <line x1="40" y1="40" x2="40" y2="0"  stroke="#1a4a7a" strokeWidth="0.6"/>
        <circle cx="40" cy="40" r="2.5" fill="#00ccff" opacity="0.6"/>
        <line x1="0"  y1="70" x2="60" y2="70" stroke="#1a4a7a" strokeWidth="0.6"/>
        <line x1="60" y1="70" x2="60" y2="20" stroke="#1a4a7a" strokeWidth="0.6"/>
        <circle cx="60" cy="20" r="1.8" fill="#00ccff" opacity="0.5"/>
        <line x1="0"  y1="90" x2="20" y2="90" stroke="#1a4a7a" strokeWidth="0.6"/>
        <line x1="20" y1="90" x2="20" y2="50" stroke="#1a4a7a" strokeWidth="0.6"/>
        <circle cx="20" cy="50" r="1.4" fill="#00ccff" opacity="0.4"/>
        <circle cx="40" cy="40" r="6" fill="none" stroke="#00ccff" strokeWidth="0.4" opacity="0.3"/>
      </svg>
    </div>
  )
}
