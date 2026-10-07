import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export const researchLink = "editorial-link"
export const researchButton = "editorial-button"

export function ResearchShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="research-surface flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
