import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { footerNav, navigation } from "@/core/config/site"
import { operatorLabel } from "@/core/config/legal"
import { cn } from "@/lib/utils"

export function Footer({ light = false }: { light?: boolean }) {
  return (
    <footer
      aria-label={navigation.footer}
      className={cn("bg-slate-dark text-ivory-light", light && "home-footer")}
    >
      <Container className="pt-12 pb-7 md:pt-16">
        <div className="grid gap-10 md:grid-cols-[1fr_2.5fr] md:gap-16">
          <a
            href="/"
            aria-label={navigation.home}
            className="focus-ring w-fit self-start"
          >
            <LogoMark />
          </a>
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {Object.entries(footerNav).map(([title, links]) => (
              <div key={title}>
                <h2 className="text-caption font-medium text-ivory-light/55">
                  {title}
                </h2>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="focus-ring inline-block min-h-6 py-0.5 text-caption text-ivory-light/85 underline-offset-4 hover:text-ivory-light hover:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-ivory-light/20 pt-5 text-caption text-ivory-light/60">
          <p>
            © {new Date().getFullYear()} {operatorLabel()}.{" "}
            {navigation.copyright}
          </p>
          <a href="/sitemap.xml" className="focus-ring hover:text-ivory-light">
            {navigation.sitemap}
          </a>
        </div>
      </Container>
    </footer>
  )
}
