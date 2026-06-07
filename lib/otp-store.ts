// In-memory OTP store — prototype only.
// Key format: "email:<addr>" or "phone:<number>"
// TTL: 10 minutes. Rate-limit: 60 s between sends.

interface OtpEntry {
  code:      string
  expiresAt: number
  sentAt:    number
}

const store = new Map<string, OtpEntry>()

export function generateOtp(key: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  store.set(key, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    sentAt:    Date.now(),
  })
  return code
}

export function canResend(key: string): boolean {
  const entry = store.get(key)
  if (!entry) return true
  return Date.now() - entry.sentAt > 60 * 1000
}

export function verifyOtp(key: string, code: string): boolean {
  const entry = store.get(key)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) { store.delete(key); return false }
  if (entry.code !== code) return false
  store.delete(key)
  return true
}
