# Architecture — 3C Core Website

## System Diagram

```
Visitor
  │
  ▼
GoDaddy DNS (A record → 76.76.21.21)
  │
  ▼
Vercel CDN (Edge Network — SSL termination)
  │
  ▼
Next.js 14 App Router (Node.js runtime)
  ├── Static pages (SSG)   → / /about /services /portfolio
  ├── Dynamic pages (SSR)  → /services/[slug] /portfolio/[slug]
  ├── Protected pages      → /portal/dashboard (middleware)
  └── API Routes
        ├── /api/contact        → Resend email
        └── /api/auth/[...]     → NextAuth.js JWT
```

## App Router Page Tree

```
app/
├── layout.tsx                    # Root layout (Navbar + Footer + fonts)
├── page.tsx                      # / Home
├── about/page.tsx                # /about
├── services/
│   ├── page.tsx                  # /services
│   └── [slug]/page.tsx           # /services/:slug  (static params)
├── portfolio/
│   ├── page.tsx                  # /portfolio
│   └── [slug]/page.tsx           # /portfolio/:slug (static params)
├── contact/page.tsx              # /contact
├── portal/
│   ├── login/page.tsx            # /portal/login
│   └── dashboard/page.tsx        # /portal/dashboard (server session check)
└── api/
    ├── contact/route.ts          # POST — contact form → Resend
    └── auth/[...nextauth]/route.ts
```

## Component Hierarchy

```
RootLayout
├── Navbar
│   └── Image (logo SVG)
├── Page content (slot)
│   ├── HeroSection
│   │   ├── CircuitDecor ×4
│   │   └── HeroPropertyIcon (inline SVG)
│   ├── ServicesPreview → ServiceCard[]
│   ├── WhyUs
│   ├── StatsSection (animated counters)
│   ├── Testimonials (carousel)
│   └── CTABanner
└── Footer
```

## Auth Flow

```
User visits /portal/dashboard
  → middleware.ts (next-auth/middleware)
  → No session → redirect /portal/login
  → LoginForm → signIn('credentials')
  → NextAuth → lib/auth.ts authorize()
  → Validate against env vars
  → JWT session created
  → Redirect → /portal/dashboard
  → getServerSession() → render dashboard
```

## Data Flow

```
Static .ts data files (data/)
  ├── services.ts     → ServicesPreview, ServiceCard, ServiceDetail
  ├── caseStudies.ts  → PortfolioPage, CaseStudyDetail
  ├── team.ts         → TeamGrid
  └── testimonials.ts → Testimonials carousel

Server Components (RSC) fetch data at build time.
Client Components ('use client') handle interactivity.
```

## Contact Form Flow

```
ContactForm (client)
  → POST /api/contact
  → Zod validation
  → Resend.emails.send()
  → contactus@3ccore.com
  → Toast feedback to user
```
