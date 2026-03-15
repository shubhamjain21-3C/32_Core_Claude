# 3C Core — Property Management Website

**Connected · Consistent · Confident**

Production-ready website for 3C Core Ltd, a professional property management and lettings consultancy.
Live at: [3ccore.com](https://3ccore.com)

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS (brand tokens)       |
| Forms       | React Hook Form + Zod             |
| Email       | Resend API                        |
| Auth        | NextAuth.js (credentials)         |
| Animations  | Framer Motion                     |
| Icons       | Lucide React                      |
| Fonts       | Montserrat + Inter (next/font)    |
| Deployment  | Vercel                            |

---

## Prerequisites

- Node.js 18+
- npm 9+
- A [Resend](https://resend.com) account for contact form email
- A [Vercel](https://vercel.com) account for deployment

---

## Local Development

```bash
git clone https://github.com/shubhamjain21-3C/3C_Core.git
cd 3C_Core
npm install
cp .env.local.example .env.local
# Edit .env.local with your real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
├── app/                 # Next.js App Router pages & API routes
├── components/          # Reusable React components
│   ├── layout/          # Navbar, Footer
│   ├── home/            # Hero, Services preview, Stats, etc.
│   ├── about/           # Mission, Team, Timeline
│   ├── services/        # Service cards & detail
│   ├── portfolio/       # Case study cards & detail
│   ├── contact/         # Contact form
│   ├── portal/          # Login, Dashboard widgets
│   └── ui/              # Shared UI primitives
├── data/                # Static data (services, team, testimonials, etc.)
├── lib/                 # Utilities, auth config, email, constants
├── public/              # Static assets
│   └── logo/            # SVG logos
├── styles/              # Global CSS
└── types/               # TypeScript types
```

---

## Logo Usage

| Context       | File                                  | Size   |
|---------------|---------------------------------------|--------|
| Navbar        | `public/logo/3CCore_Logo_Compact_Header.svg` | h=48px |
| Footer        | same                                  | h=40px |
| Portal login  | same                                  | h=40px |
| Favicon       | `public/logo/3CCore_Icon_Only.svg`    | 32px   |

**Do not** stretch, recolour, or crop the logo.

---

## Branches

| Branch | Purpose            |
|--------|--------------------|
| `main` | Production (Vercel)|
| `dev`  | Development / PRs  |

All PRs target `dev`. Only `dev → main` merges trigger a production deployment.

---

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) — System diagram & component hierarchy
- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel + GoDaddy DNS setup
- [CONTRIBUTING.md](CONTRIBUTING.md) — Branch naming & PR workflow
