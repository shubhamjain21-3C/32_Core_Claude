export const SITE_NAME = '3C Core'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://3ccore.com'
export const COMPANY_EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contactus@3ccore.com'
export const COMPANY_PHONE = '+44 (0)20 0000 0000'
export const COMPANY_ADDRESS = '3C Core Ltd, London, United Kingdom'

export const NAV_LINKS = [
  { href: '/',          label: 'Home'      },
  { href: '/about',     label: 'About'     },
  { href: '/services',  label: 'Services'  },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/contact',   label: 'Contact'   },
]

export const SERVICES_LIST = [
  'Property Management',
  'Lettings Consultancy',
  'Investment Advisory',
  'Maintenance & Facilities',
  'Tenant Relations',
  'Compliance & Legal',
]

export const STATS = [
  { label: 'Properties Managed', value: 250, suffix: '+' },
  { label: 'Years Experience',   value: 15,  suffix: '+'  },
  { label: 'Happy Landlords',    value: 180, suffix: '+'  },
  { label: 'Tenant Satisfaction',value: 96,  suffix: '%'  },
]
