// Portal uses its own layout — no public Navbar/Footer
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
