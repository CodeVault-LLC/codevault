export const sandboxIntro = {
  lede: "A Rust controller validates policy, launches a disposable QEMU guest, and keeps model-issued commands away from the host shell.",
  caution:
    "This reduces risk. It does not make malware execution safe. Use the current build for benign development and controlled evaluation, not hostile workloads.",
} as const

export const sandboxPage = {
  sections: [
    { id: "boundary", label: "Boundary" },
    { id: "run", label: "One run" },
    { id: "network", label: "Network" },
    { id: "readiness", label: "Readiness" },
  ],
  boundary: {
    title: "The boundary is the project.",
    body: "A virtual machine is only the first boundary. Command text enters the guest. Policy, host state, and QEMU launch arguments do not.",
  },
  run: {
    title: "One run, with every crossing visible.",
    body: "Daybreak runs each example through the same machinery. Switch examples to see where files move, code executes, and writable state disappears.",
  },
  network: {
    title: "Deny is a working state, not a placeholder.",
    body: "The model cannot ask for a wider network and get one. Modes that lack an enforcement backend stop the launch instead of quietly becoming ordinary NAT.",
  },
  readiness: {
    title: "Two controls are implemented. Fifteen still carry caveats.",
    body: "Select a status to see the source-backed controls in each group.",
    note: "Implemented does not mean accredited, and partial does not mean nearly done. These labels describe repository evidence, not a production approval.",
  },
  roadmap: {
    title: "What must exist before hostile work.",
    body: "Hostile workloads need independent worker containment, external network enforcement, and human approval.",
  },
  sources: {
    title: "Source documents",
  },
} as const

export const sandboxFigures = [
  { label: "Guest network by default", value: "0 NICs" },
  { label: "Writable disks per run", value: "1 overlay" },
  { label: "Protocol frame ceiling", value: "8 MiB" },
] as const

export type BoundaryState = "trusted" | "controlled" | "untrusted"

export type SandboxBoundary = {
  id: string
  label: string
  state: BoundaryState
  title: string
  body: string
  keeps: readonly string[]
}

export const sandboxBoundaries: readonly SandboxBoundary[] = [
  {
    id: "model",
    label: "Request",
    state: "untrusted",
    title: "Model or operator request",
    body: "Command text is treated as untrusted data. It is never interpolated into a host-shell command.",
    keeps: ["Command text", "Requested action", "Artifact intent"],
  },
  {
    id: "controller",
    label: "Controller",
    state: "trusted",
    title: "Host-owned Rust controller",
    body: "The controller validates policy, chooses an image, constructs typed QEMU arguments, and refuses unsupported scope expansion.",
    keeps: ["Policy", "Image digest", "QEMU arguments"],
  },
  {
    id: "qemu",
    label: "Boundary",
    state: "controlled",
    title: "QEMU and immutable image",
    body: "A verified read-only base image boots with an explicit device set. Each session receives its own copy-on-write overlay.",
    keeps: ["Explicit devices", "Read-only base", "Ephemeral overlay"],
  },
  {
    id: "agent",
    label: "Channel",
    state: "controlled",
    title: "Framed virtio-serial channel",
    body: "A four-byte length and bounded JSON frames carry commands without requiring an IP connection to the guest.",
    keeps: ["8 MiB frame limit", "Bounded output", "No IP dependency"],
  },
  {
    id: "guest",
    label: "Workload",
    state: "untrusted",
    title: "Guest shell and specimen",
    body: "The real shell, guest operating system after execution, specimen, output, and exported artifacts are all treated as untrusted.",
    keeps: ["No host mounts", "No ambient secrets", "No default network"],
  },
] as const

export type RunExample = {
  id: string
  label: string
  title: string
  command: string
  note: string
  stages: readonly {
    label: string
    detail: string
    boundary: string
  }[]
}

export const sandboxRuns: readonly RunExample[] = [
  {
    id: "hash",
    label: "Inspect",
    title: "Stage and hash without execution",
    command:
      "daybreak analyze ./suspicious.bin --image daybreak-linux --hash-only",
    note: "The file is digested and staged for inspection. No guest process executes it.",
    stages: [
      {
        label: "Digest",
        detail: "Calculate the specimen hash before transfer.",
        boundary: "Host controller",
      },
      {
        label: "Verify",
        detail: "Check the selected base image against its recorded digest.",
        boundary: "Image registry",
      },
      {
        label: "Record",
        detail: "Write the operation and resulting digest to evidence.",
        boundary: "Artifact store",
      },
    ],
  },
  {
    id: "offline",
    label: "Observe",
    title: "Run a harmless behavior fixture offline",
    command:
      "daybreak analyze ./behavior-fixture.sh --image daybreak-linux --execute-command 'sh {sample}'",
    note: "Execution happens in a fresh guest with the default network-none policy. The placeholder resolves only to the fixed guest staging path.",
    stages: [
      {
        label: "Prepare",
        detail: "Create one disposable overlay over a verified base.",
        boundary: "Storage plane",
      },
      {
        label: "Transfer",
        detail: "Send one named file to the confined guest staging directory.",
        boundary: "Virtio serial",
      },
      {
        label: "Execute",
        detail: "Start the real guest shell with zero guest network devices.",
        boundary: "QEMU guest",
      },
      {
        label: "Collect",
        detail: "Bound output and export explicitly requested artifacts.",
        boundary: "Artifact store",
      },
      {
        label: "Destroy",
        detail: "Stop the session and remove its writable overlay.",
        boundary: "Host controller",
      },
    ],
  },
  {
    id: "shell",
    label: "Explore",
    title: "Open an interactive guest shell",
    command: "daybreak shell --image daybreak-linux",
    note: "The shell stays available over virtio serial even when guest networking is entirely absent.",
    stages: [
      {
        label: "Boot",
        detail:
          "Launch the selected image with an explicit minimal device set.",
        boundary: "QEMU",
      },
      {
        label: "Attach",
        detail: "Connect the terminal to the guest agent over virtio serial.",
        boundary: "Control plane",
      },
      {
        label: "Work",
        detail:
          "Run commands in the guest rather than an emulated interpreter.",
        boundary: "Guest shell",
      },
      {
        label: "Close",
        detail: "End the session and discard writable state.",
        boundary: "Storage plane",
      },
    ],
  },
] as const

export type NetworkMode = {
  id: string
  label: string
  status: "enforced" | "partial" | "blocked"
  reach: number
  summary: string
  detail: string
}

export const sandboxNetworkModes: readonly NetworkMode[] = [
  {
    id: "none",
    label: "None",
    status: "enforced",
    reach: 0,
    summary: "No guest network device.",
    detail:
      "QEMU receives -nic none. Guest shell control still works because management traffic uses virtio serial, not IP.",
  },
  {
    id: "simulated",
    label: "Simulated",
    status: "partial",
    reach: 28,
    summary: "Loopback sinks exist; guest wiring remains incomplete.",
    detail:
      "Bounded DNS, HTTP, and TCP sinks are implemented, but the CLI does not yet connect them to the guest. This mode is not treated as complete.",
  },
  {
    id: "scoped",
    label: "Scoped",
    status: "blocked",
    reach: 58,
    summary: "Policy parses targets; QEMU refuses to start.",
    detail:
      "IP, CIDR, hostname, and port matching exists. Until a platform packet-filter backend can enforce it, the launcher returns an error instead of falling back to NAT.",
  },
  {
    id: "internet",
    label: "Internet",
    status: "blocked",
    reach: 100,
    summary: "Reserved and deliberately unavailable.",
    detail:
      "Every policy and QEMU path rejects controlled-internet. A model request cannot turn it on.",
  },
] as const

export type ReadinessStatus = "Implemented" | "Partial" | "Missing"

export const sandboxReadiness = [
  {
    status: "Implemented",
    count: 2,
    summary: "Inner controls with source and test evidence",
    controls: ["Typed QEMU arguments", "Default network denial"],
  },
  {
    status: "Partial",
    count: 9,
    summary: "Useful foundations with known enforcement or evidence gaps",
    controls: [
      "Simulated network",
      "Disposable storage",
      "Guest resources",
      "Command audit",
      "Terminal safety",
      "Session cleanup",
      "Image integrity",
      "Supply chain",
      "Platform coverage",
    ],
  },
  {
    status: "Missing",
    count: 6,
    summary: "Release gates that must be supplied or built",
    controls: [
      "Outer QEMU containment",
      "Scoped network enforcement",
      "Enterprise identity",
      "API credential governance",
      "Abuse response",
      "Certification evidence",
    ],
  },
] as const satisfies readonly {
  status: ReadinessStatus
  count: number
  summary: string
  controls: readonly string[]
}[]

export const sandboxRoadmap = [
  {
    gate: "Now",
    title: "Benign development",
    body: "Use network=none, keep sensitive host data away, and work with synthetic or non-hostile samples.",
  },
  {
    gate: "Next",
    title: "Controlled evaluation",
    body: "Finish the inner boundary: network sinks, quotas, terminal sanitization, audit coverage, and lifecycle tests.",
  },
  {
    gate: "Before hostile work",
    title: "Independent outer containment",
    body: "Move QEMU onto disposable workers with host-native resource controls, external egress enforcement, and an operator kill path.",
  },
  {
    gate: "Before autonomous testing",
    title: "Identity and human review",
    body: "Add signed job scope, explicit approval for expansion, centralized monitoring, revocation, and incident response.",
  },
] as const

export const sandboxSources = [
  {
    label: "Security model",
    href: "https://github.com/CodeVault-LLC/sandbox/blob/main/docs/security-model.md",
  },
  {
    label: "Architecture",
    href: "https://github.com/CodeVault-LLC/sandbox/blob/main/docs/architecture.md",
  },
  {
    label: "Network modes",
    href: "https://github.com/CodeVault-LLC/sandbox/blob/main/docs/networking.md",
  },
  {
    label: "Readiness roadmap",
    href: "https://github.com/CodeVault-LLC/sandbox/blob/main/docs/daybreak-readiness-roadmap.md",
  },
] as const
