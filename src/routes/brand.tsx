import { createFileRoute } from "@tanstack/react-router"

import { brand } from "@/core/config/brand"
import { seo } from "@/core/lib/seo"
import { cn } from "@/lib/utils"
import { LogoGlyph } from "@/components/brand/logo-glyph"
import { LogoMark } from "@/components/brand/logo-mark"
import { Orbit, orbitEdge } from "@/components/brand/orbit"
import { Container } from "@/components/layout/container"
import { PageShell } from "@/components/layout/page-shell"
import { HeadlineWords } from "@/components/ui/headline-words"
import { Reveal, RevealItem } from "@/components/ui/reveal"

export const Route = createFileRoute("/brand")({
  head: () =>
    seo({
      title: brand.title,
      description: brand.description,
      path: "/brand",
    }),
  component: BrandPage,
})

type Swatch = (typeof brand.color.swatches)[number]["token"]

const swatchClass: Record<Swatch, string> = {
  persimmon: "bg-persimmon",
  "persimmon-strong": "bg-persimmon-strong",
  slate: "bg-slate",
  ivory: "bg-ivory ring-1 ring-border ring-inset",
  "ivory-medium": "bg-ivory-medium",
  oat: "bg-oat",
  sky: "bg-sky",
  olive: "bg-olive",
  cactus: "bg-cactus",
  heather: "bg-heather",
}

const faceClass = {
  sans: "font-sans text-display-m font-semibold",
  serif: "font-serif text-display-m",
  mono: "font-mono text-display-xs uppercase",
} as const

// Orbit's drawings are 144px square in the input scenes; the field starts
// 104px down, and the drawing is shifted so the input's edge lands on it.
const SCENE_SIZE = 144
const FIELD_TOP = 104
const sceneTop = (edge: number) => FIELD_TOP - (SCENE_SIZE * edge) / 120

function BrandPage() {
  const { logo, mascot, color, type } = brand

  return (
    <PageShell>
      <Container className="pt-14 pb-10 sm:pt-20 lg:pt-24">
        <h1 className="mb-5 font-sans text-display-l font-semibold">
          <HeadlineWords text={brand.heading} />
        </h1>
        <p
          className="fade-rise max-w-[36ch] text-paragraph-l"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {brand.intro}
        </p>
      </Container>

      <Container>
        <div
          className="fade-rise grid place-items-center overflow-hidden rounded-3xl bg-persimmon py-10 sm:py-14"
          style={{ "--d": "200ms" } as React.CSSProperties}
        >
          <Orbit
            tone="ivory"
            label="Orbit, waving"
            className="w-[min(60%,18rem)]"
          />
        </div>
      </Container>

      {/* Logo */}
      <Container className="grid gap-8 py-20 lg:grid-cols-12 lg:py-28">
        <Reveal className="lg:col-span-4">
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {logo.heading}
          </h2>
          <p className="max-w-[40ch] text-paragraph-s text-foreground/85">
            {logo.body}
          </p>
        </Reveal>
        <Reveal stagger className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
          <RevealItem>
            <LogoTile label={logo.variants[0]} className="bg-surface">
              <LogoGlyph className="size-16" />
            </LogoTile>
          </RevealItem>
          <RevealItem>
            <LogoTile
              label={logo.variants[1]}
              className="bg-inverse text-inverse-foreground"
            >
              <LogoMark className="[&_span]:text-display-s [&_svg]:size-8" />
            </LogoTile>
          </RevealItem>
          <RevealItem>
            <LogoTile label={logo.variants[2]} className="bg-surface">
              <LogoGlyph variant="badge" className="size-16" />
            </LogoTile>
          </RevealItem>
        </Reveal>
      </Container>

      {/* Mascot */}
      <Container className="grid gap-8 border-t border-border pt-20 pb-20 lg:grid-cols-12 lg:pt-28 lg:pb-28">
        <Reveal className="lg:col-span-4">
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {mascot.heading}
          </h2>
          <p className="max-w-[40ch] text-paragraph-s text-foreground/85">
            {mascot.body}
          </p>
        </Reveal>

        <div className="grid gap-12 lg:col-span-8">
          <Reveal>
            <h3 className="mb-4 font-sans text-display-xs font-semibold">
              {mascot.inputHeading}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {mascot.inputs.map(({ pose, label }) => (
                <ArtTile key={pose} label={label}>
                  <div
                    className="relative pb-1"
                    style={{ paddingTop: FIELD_TOP }}
                  >
                    <div
                      className={cn(
                        "absolute size-36",
                        pose === "peek"
                          ? "left-1/2 -translate-x-1/2"
                          : "right-[14%] z-20"
                      )}
                      style={{ top: sceneTop(orbitEdge[pose]) }}
                    >
                      <Orbit
                        pose={pose}
                        layer={pose === "peek" ? "back" : "all"}
                        className="size-full"
                      />
                    </div>
                    <div className="relative z-10 flex h-14 items-center justify-between gap-3 rounded-xl bg-white pr-2 pl-4 font-sans text-ui text-cloud shadow-[0_1px_2px_rgb(20_20_19/0.06)] ring-1 ring-slate/10">
                      <span className="truncate">{mascot.placeholder}</span>
                      <span
                        aria-hidden
                        className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate text-ivory"
                      >
                        ↑
                      </span>
                    </div>
                    {pose === "peek" && (
                      <div
                        className="absolute left-1/2 z-20 size-36 -translate-x-1/2"
                        style={{ top: sceneTop(orbitEdge.peek) }}
                      >
                        <Orbit
                          pose="peek"
                          layer="front"
                          className="size-full"
                        />
                      </div>
                    )}
                  </div>
                </ArtTile>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <h3 className="mb-4 font-sans text-display-xs font-semibold">
              {mascot.posesHeading}
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {mascot.poses.map(({ pose, label }) => (
                <ArtTile key={pose} label={label}>
                  <div className="grid place-items-center pt-2 pb-1">
                    <Orbit
                      pose={pose}
                      label={`Orbit, ${label.toLowerCase()}`}
                      className="w-[min(100%,10rem)]"
                    />
                  </div>
                </ArtTile>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <h3 className="mb-4 font-sans text-display-xs font-semibold">
              {mascot.iconsHeading}
            </h3>
            <div className="flex items-end gap-5">
              {mascot.iconSizes.map((size) => (
                <div key={size} className="grid justify-items-center gap-2">
                  <div
                    className="grid place-items-center overflow-hidden bg-persimmon"
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size / 5,
                    }}
                  >
                    <Orbit pose="icon" tone="ivory" className="size-full" />
                  </div>
                  <span className="font-mono text-label text-muted-foreground">
                    {size}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Colour */}
      <Container className="grid gap-8 border-t border-border pt-20 pb-20 lg:grid-cols-12 lg:pt-28 lg:pb-28">
        <Reveal className="lg:col-span-4">
          <h2 className="mb-4 font-sans text-display-s font-semibold">
            {color.heading}
          </h2>
          <p className="max-w-[40ch] text-paragraph-s text-foreground/85">
            {color.body}
          </p>
        </Reveal>
        <Reveal
          stagger
          className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-5 lg:col-span-8"
        >
          {color.swatches.map((swatch) => (
            <RevealItem key={swatch.token}>
              <div
                className={cn(
                  "mb-3 aspect-square rounded-2xl",
                  swatchClass[swatch.token]
                )}
              />
              <p className="font-sans text-caption font-semibold">
                {swatch.name}
              </p>
              <p className="font-mono text-label text-muted-foreground uppercase">
                {swatch.hex}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>

      {/* Type */}
      <Container className="grid gap-8 border-t border-border pt-20 pb-24 lg:grid-cols-12 lg:pt-28 lg:pb-32">
        <Reveal className="lg:col-span-4">
          <h2 className="font-sans text-display-s font-semibold">
            {type.heading}
          </h2>
        </Reveal>
        <Reveal className="lg:col-span-8">
          <ul>
            {type.faces.map((face) => (
              <li
                key={face.name}
                className="grid gap-3 border-t border-border py-6 sm:grid-cols-3 sm:gap-6"
              >
                <div>
                  <p className="font-sans text-caption font-semibold">
                    {face.name}
                  </p>
                  <p className="font-sans text-caption text-muted-foreground">
                    {face.role}
                  </p>
                </div>
                <p className={cn("sm:col-span-2", faceClass[face.font])}>
                  {face.sample}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </PageShell>
  )
}

function LogoTile({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <figure
      className={cn(
        "flex aspect-[2/1] flex-col justify-between rounded-2xl p-4 font-sans sm:aspect-[4/3]",
        className
      )}
    >
      <div className="grid flex-1 place-items-center">{children}</div>
      <figcaption className="font-mono text-label uppercase opacity-70">
        {label}
      </figcaption>
    </figure>
  )
}

/** A light tile for Orbit. Like post art, it stays the same in dark mode. */
function ArtTile({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <figure className="flex flex-col justify-between gap-3 rounded-2xl bg-ivory-medium p-4 text-slate">
      <figcaption className="font-mono text-label text-slate-medium uppercase">
        {label}
      </figcaption>
      {children}
    </figure>
  )
}
