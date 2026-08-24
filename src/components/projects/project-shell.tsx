import { Footer } from "@/components/layout/footer"
import { Navbar } from "@/components/layout/navbar"
import { cn } from "@/lib/utils"

// The same page frame the homepage uses, so project pages sit in one system.
// Each style sets its own `main` background via className.
export function ProjectShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar />
      <main className={cn("flex-1", className)}>{children}</main>
      <Footer />
    </div>
  )
}
