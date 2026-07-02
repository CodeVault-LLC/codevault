import { Container } from "@/components/layout/container"
import { LogoMark } from "@/components/brand/logo-mark"
import { footerNav, site } from "@/core/config/site"

type SocialIcon = (props: { className?: string }) => React.ReactNode

const socials: { label: string; href: string; icon: SocialIcon }[] = [
  {
    label: "GitHub",
    href: "#github",
    icon: (p) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={p.className}
      >
        <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.08 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-2.16c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.18c0 .31.21.68.8.56C20.22 21.4 23.5 17.1 23.5 12.02 23.5 5.66 18.35.5 12 .5Z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#twitter",
    icon: (p) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={p.className}
      >
        <path d="M18.244 2H21l-6.52 7.45L22 22h-6.79l-4.74-6.2L4.96 22H2.2l6.97-7.96L2 2h6.93l4.3 5.69L18.24 2Zm-1.19 18h1.84L7.04 4H5.1l11.95 16Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#linkedin",
    icon: (p) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={p.className}
      >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#youtube",
    icon: (p) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className={p.className}
      >
        <path d="M23.5 6.51a3.02 3.02 0 0 0-2.13-2.14C19.49 3.85 12 3.85 12 3.85s-7.49 0-9.37.52A3.02 3.02 0 0 0 .5 6.51 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.49 3.02 3.02 0 0 0 2.13 2.14c1.88.52 9.37.52 9.37.52s7.49 0 9.37-.52a3.02 3.02 0 0 0 2.13-2.14c.34-1.8.5-3.63.5-5.49a31.6 31.6 0 0 0-.5-5.49ZM9.6 15.6V8.4l6.24 3.6L9.6 15.6Z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer
      aria-labelledby="footer-title"
      className="bg-[#1f1e1d] text-[#faf9f5]"
    >
      <h2 id="footer-title" className="sr-only">
        Footer
      </h2>
      <Container className="pt-20 pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <LogoMark />
            <p className="mt-5 max-w-xs text-paragraph-s text-pretty text-[#faf9f5]/70">
              {site.tagline}
            </p>
            <ul className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-[#faf9f5]/10"
                  >
                    {s.icon({ className: "size-4" })}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title} className="md:col-span-2">
              <h3 className="text-detail-xs font-medium text-[#faf9f5]/60 uppercase">
                {title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#faf9f5]/80 transition-colors hover:text-[#faf9f5]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[#faf9f5]/10 pt-6 text-xs text-[#faf9f5]/50 md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} {site.name}, Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#status" className="hover:text-[#faf9f5]">
              All systems normal
            </a>
            <a href="#sitemap" className="hover:text-[#faf9f5]">
              Sitemap
            </a>
            <a href="#cookies" className="hover:text-[#faf9f5]">
              Cookie preferences
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
