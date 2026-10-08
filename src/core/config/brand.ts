// The Brand page: logo, mascot, colour and type. Swatch values must match
// `src/styles/globals.css`.

import type { OrbitPose } from "@/components/brand/orbit"

export const brand = {
  title: "Brand — CodeVault",
  description:
    "The CodeVault logo, our mascot Orbit, and our colours and type.",
  heading: "Brand",
  intro: "Our logo, our mascot, and the colours and type we use.",

  logo: {
    heading: "Logo",
    body: "The aperture: four blades turning around an open middle. Use it alone, with the wordmark, or as a badge where it needs to hold its own shape.",
    variants: ["Mark", "Lockup", "Badge"],
  },

  mascot: {
    heading: "Orbit",
    body: "A small world with a ring around it. Its hands and feet float free like moons, so it can hold anything and sit anywhere. Orbit belongs to every CodeVault project.",
    inputHeading: "On an input",
    placeholder: "Ask Kilo about this module…",
    inputs: [
      { pose: "sit", label: "Sitting on the edge" },
      { pose: "peek", label: "Peeking over" },
    ] satisfies { pose: "sit" | "peek"; label: string }[],
    posesHeading: "At work and in season",
    poses: [
      { pose: "design", label: "Designing" },
      { pose: "code", label: "Coding" },
      { pose: "write", label: "Writing" },
      { pose: "summer", label: "Summer" },
      { pose: "pumpkin", label: "Halloween" },
      { pose: "witch", label: "Halloween, witch" },
    ] satisfies { pose: OrbitPose; label: string }[],
    iconsHeading: "As an icon",
    iconSizes: [64, 32, 16],
  },

  color: {
    heading: "Colour",
    body: "Warm neutrals and one accent. Persimmon is for Orbit, Kilo and the moments that matter.",
    swatches: [
      { name: "Persimmon", token: "persimmon", hex: "#e85d3c" },
      { name: "Persimmon strong", token: "persimmon-strong", hex: "#b03a1e" },
      { name: "Slate", token: "slate", hex: "#141413" },
      { name: "Ivory", token: "ivory", hex: "#faf9f5" },
      { name: "Ivory medium", token: "ivory-medium", hex: "#f0eee6" },
      { name: "Oat", token: "oat", hex: "#e3dacc" },
      { name: "Sky", token: "sky", hex: "#6a9bcc" },
      { name: "Olive", token: "olive", hex: "#788c5d" },
      { name: "Cactus", token: "cactus", hex: "#bcd1ca" },
      { name: "Heather", token: "heather", hex: "#cbcadb" },
    ],
  },

  type: {
    heading: "Type",
    faces: [
      {
        name: "Inter",
        role: "Headlines and interface",
        font: "sans",
        sample: "We build projects across tech.",
      },
      {
        name: "Lora",
        role: "Reading text",
        font: "serif",
        sample: "Some of it ships, some of it doesn't.",
      },
      {
        name: "JetBrains Mono",
        role: "Labels and details",
        font: "mono",
        sample: "A CODEVAULT PROJECT",
      },
    ],
  },
} as const
