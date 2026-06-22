---
name: 3C Core Website Project
description: Production-ready Next.js 14 property management website for 3C Core Ltd
type: project
---

3C Core Ltd website built and pushed to GitHub repo https://github.com/shubhamjain21-3C/3C_Core_Main

**Why:** Client's property management business website built from spec at `3CCore_Master_Prompt_v3_CompactHeader.md`

**How to apply:** When working on this project, reference the repo above. Production branch is `main`, development is `dev`. Local files at `d:/3C-Core_Claude/3C_Core_Website`.

## Key Details

- **Tech stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, React Hook Form + Zod, Resend, NextAuth.js, Lucide React
- **Logo:** Circuit-building icon (NOT a heart) — `public/logo/3CCore_Logo_Compact_Header.svg`
- **Pages:** Home, About, Services (6 + detail), Portfolio (3 case studies + detail), Contact, Portal Login, Dashboard
- **Domain:** 3ccore.com (GoDaddy) → to be connected to Vercel
- **Color palette:** `#050d1a` bg, `#2a7fd4` brand blue, `#00ccff` cyan accent, `#6ab4e8` cyan-light
- **Content:** Property management, lettings consultancy, investment advisory, maintenance, tenant relations, compliance

## Known Config Notes

- `package.json` name is `"3c-core"` (npm rejects capital letters in package names)
- Config file is `next.config.mjs` not `.ts` (Next.js 14.2.x doesn't support `.ts`)
- Resend client: `new Resend(process.env.RESEND_API_KEY || 'placeholder')` — fallback needed for build-time static analysis
- `.claude/settings.local.json` is gitignored (machine-specific permission grants)

## Before Going Live

1. Copy `.env.local.example` → `.env.local`, fill in real values
2. Connect repo to Vercel, add env vars
3. Point GoDaddy DNS → A record `@` → `76.76.21.21`
4. Replace placeholder content (team photos, address, phone, Google Maps URL)
