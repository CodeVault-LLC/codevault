import { SiteFooter } from "./site-footer"
import { SiteHeader } from "./site-header"

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
