import { useId } from "react"
import { cn } from "@/lib/utils"

// A small, deterministic isometric drawing system. Geometry is rendered on the
// server; the client animates only the camera, signal dots, and scanning plane.
type Point = readonly [number, number, number]
const project = ([x, y, z]: Point) => [
  600 + (x - y) * 0.88,
  290 + (x + y) * 0.4 - z,
]
const point = (p: Point) => project(p).join(",")
const line = (points: Point[], close = false) =>
  `${points.map((p, i) => `${i ? "L" : "M"}${point(p)}`).join(" ")}${close ? "Z" : ""}`

function Block({
  x,
  y,
  z = 0,
  width,
  depth,
  height,
  tone = "paper",
}: {
  x: number
  y: number
  z?: number
  width: number
  depth: number
  height: number
  tone?: "paper" | "olive" | "ink"
}) {
  return (
    <g
      className={cn("world-block", `world-block-${tone}`)}
      strokeLinejoin="round"
    >
      <path
        className="world-face-left"
        d={line(
          [
            [x, y, z],
            [x + width, y, z],
            [x + width, y, z + height],
            [x, y, z + height],
          ],
          true
        )}
      />
      <path
        className="world-face-right"
        d={line(
          [
            [x + width, y, z],
            [x + width, y + depth, z],
            [x + width, y + depth, z + height],
            [x + width, y, z + height],
          ],
          true
        )}
      />
      <path
        className="world-face-top"
        d={line(
          [
            [x, y, z + height],
            [x + width, y, z + height],
            [x + width, y + depth, z + height],
            [x, y + depth, z + height],
          ],
          true
        )}
      />
      <path
        className="world-face-left"
        d={line(
          [
            [x, y + depth, z],
            [x + width, y + depth, z],
            [x + width, y + depth, z + height],
            [x, y + depth, z + height],
          ],
          true
        )}
      />
    </g>
  )
}

function Plinth({
  x,
  y,
  width,
  depth,
}: {
  x: number
  y: number
  width: number
  depth: number
}) {
  return (
    <g>
      <path
        d={line(
          [
            [x + 9, y + 9, -12],
            [x + width + 16, y + 9, -12],
            [x + width + 16, y + depth + 16, -12],
            [x + 9, y + depth + 16, -12],
          ],
          true
        )}
        className="world-shadow"
      />
      <Block x={x} y={y} width={width} depth={depth} height={9} z={-9} />
      {Array.from({ length: Math.floor(width / 20) }, (_, i) => (
        <path
          key={i}
          d={line([
            [x + 10 + i * 20, y, 0.5],
            [x + 10 + i * 20, y + depth, 0.5],
          ])}
          className="world-grid"
        />
      ))}
      {Array.from({ length: Math.floor(depth / 20) }, (_, i) => (
        <path
          key={i}
          d={line([
            [x, y + 10 + i * 20, 0.5],
            [x + width, y + 10 + i * 20, 0.5],
          ])}
          className="world-grid"
        />
      ))}
    </g>
  )
}

function Server({
  x,
  y,
  height = 82,
}: {
  x: number
  y: number
  height?: number
}) {
  return (
    <g>
      <Block x={x} y={y} width={28} depth={32} height={height} />
      {Array.from({ length: Math.floor(height / 12) - 1 }, (_, i) => (
        <g key={i}>
          <path
            d={line([
              [x + 4, y + 32, height - 10 - i * 12],
              [x + 24, y + 32, height - 10 - i * 12],
            ])}
            className="world-ink-line"
          />
          <circle
            cx={project([x + 6, y + 32, height - 14 - i * 12])[0]}
            cy={project([x + 6, y + 32, height - 14 - i * 12])[1]}
            r="1.5"
            className="world-status"
          />
        </g>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <path
          key={i}
          d={line([
            [x + 28, y + 4 + i * 3, 8],
            [x + 28, y + 4 + i * 3, height - 6],
          ])}
          className="world-hatching"
        />
      ))}
    </g>
  )
}

function Terminal({ x, y, z = 0 }: { x: number; y: number; z?: number }) {
  return (
    <g>
      <Block x={x - 5} y={y - 2} z={z} width={58} depth={36} height={4} />
      <Block
        x={x}
        y={y}
        z={z + 4}
        width={47}
        depth={4}
        height={34}
        tone="ink"
      />
      <path
        d={line([
          [x + 6, y + 4, z + 29],
          [x + 11, y + 4, z + 24],
          [x + 6, y + 4, z + 20],
        ])}
        className="world-screen-line"
      />
      <path
        d={line([
          [x + 17, y + 4, z + 20],
          [x + 31, y + 4, z + 20],
        ])}
        className="world-screen-line"
      />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={line([
            [x + 3, y + 13 + i * 5, z + 4.5],
            [x + 42, y + 13 + i * 5, z + 4.5],
          ])}
          className="world-hatching"
        />
      ))}
    </g>
  )
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const [px, py] = project([x, y, 0])
  return (
    <g transform={`translate(${px} ${py}) scale(${scale})`}>
      <ellipse cy="1" rx="15" ry="5" className="world-shadow" />
      <path d="M0 0V-45" className="world-ink-line" />
      <path
        d="M0-57C-18-45-21-25-10-21C-25-12-11-4 0-12C14-5 24-18 12-25C22-34 12-48 0-57Z"
        className="world-tree"
      />
      <path
        d="M0-49V-12M0-35L-9-41M0-27L9-36M0-19L-10-26"
        className="world-tree-vein"
      />
    </g>
  )
}

const routes = [
  [
    [-240, -155, 1],
    [-130, -155, 1],
    [-130, -35, 1],
    [-65, -35, 1],
  ],
  [
    [150, -165, 1],
    [92, -165, 1],
    [92, -40, 1],
    [65, -40, 1],
  ],
  [
    [245, 15, 1],
    [170, 15, 1],
    [170, 70, 1],
    [65, 70, 1],
  ],
  [
    [45, 245, 1],
    [45, 175, 1],
    [-10, 175, 1],
    [-10, 90, 1],
  ],
  [
    [-235, 130, 1],
    [-155, 130, 1],
    [-155, 45, 1],
    [-65, 45, 1],
  ],
  [
    [-240, -155, 1],
    [-290, -155, 1],
    [-290, 130, 1],
    [-235, 130, 1],
  ],
  [
    [150, -165, 1],
    [245, -165, 1],
    [245, 15, 1],
  ],
  [
    [245, 15, 1],
    [290, 15, 1],
    [290, 245, 1],
    [45, 245, 1],
  ],
  [
    [-235, 130, 1],
    [-235, 245, 1],
    [45, 245, 1],
  ],
] satisfies Point[][]

export function SecurityWorldArt() {
  const id = useId().replace(/:/g, "")
  return (
    <svg
      viewBox="0 0 1200 570"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="security-world-art"
    >
      <defs>
        <pattern
          id={`${id}-grain`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="2" r="0.45" fill="currentColor" opacity="0.09" />
          <circle cx="5" cy="6" r="0.35" fill="currentColor" opacity="0.06" />
        </pattern>
        <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--olive)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--olive)" stopOpacity="0.015" />
        </linearGradient>
      </defs>
      <rect width="1200" height="570" fill={`url(#${id}-grain)`} />
      <g data-world-camera>
        <g className="world-focus">
          {/* Engraved topography places the systems in a shared landscape. */}
          <g className="world-terrain">
            {Array.from({ length: 17 }, (_, i) => (
              <path
                key={i}
                d={`M${12 - i * 8} ${318 + i * 10}C${170 - i * 2} ${240 + i * 5} ${195 + i * 3} ${469 + i * 5} ${442 + i * 4} ${402 + i * 7}S${762 + i * 4} ${468 + i * 4} ${1200 + i * 8} ${322 + i * 13}`}
              />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <path
                key={i}
                d={`M${90 + i * 10} ${109 - i * 12}C${300 + i * 6} ${13 + i * 10} ${529 + i * 8} ${189 - i * 8} ${765 + i * 14} ${115 - i * 8}S1100 ${137 - i * 10} 1200 ${90 - i * 8}`}
              />
            ))}
          </g>
          <ellipse
            cx="600"
            cy="332"
            rx="440"
            ry="179"
            className="world-orbit"
          />
          <ellipse
            cx="600"
            cy="332"
            rx="468"
            ry="193"
            className="world-orbit world-orbit-outer"
          />
          <g className="world-connections">
            {routes.map((points, i) => (
              <g key={i}>
                <path d={line(points)} className="world-route-bed" />
                <path
                  d={line(points)}
                  data-signal-route
                  className="world-route"
                />
                {[0, 1].map((n) => (
                  <circle
                    key={n}
                    data-signal-dot
                    data-route={i}
                    data-offset={n / 2}
                    cx={project(points[0])[0]}
                    cy={project(points[0])[1]}
                    r={n ? 2.2 : 3.2}
                    className="world-signal"
                  />
                ))}
              </g>
            ))}
          </g>
          {/* Rear-left: a physical device and its radio connection. */}
          <g className="world-devices">
            <Plinth x={-290} y={-210} width={130} depth={100} />
            <Block x={-272} y={-185} width={46} depth={39} height={48} />
            <Block
              x={-269}
              y={-182}
              z={48}
              width={40}
              depth={33}
              height={5}
              tone="olive"
            />
            <path
              d={line([
                [-249, -162, 53],
                [-249, -162, 100],
              ])}
              className="world-ink-line"
            />
            <g
              data-world-beacon
              transform={`translate(${point([-249, -162, 100])})`}
            >
              <circle r="4" className="world-signal" />
              <circle r="14" className="world-beacon-ring" />
              <circle r="24" className="world-beacon-ring" opacity="0.45" />
            </g>
            <Block x={-205} y={-184} width={23} depth={30} height={16} />
            <path
              d={line([
                [-203, -170, 16],
                [-186, -170, 16],
              ])}
              className="world-ink-line"
            />
            <Tree x={-283} y={-117} scale={0.7} />
            <Tree x={-178} y={-203} scale={0.9} />
          </g>
          {/* Rear-right: a bank of independently bounded machines. */}
          <g className="world-devices">
            <Plinth x={100} y={-237} width={145} depth={115} />
            <Server x={117} y={-214} height={93} />
            <Server x={155} y={-214} height={93} />
            <Server x={193} y={-214} height={93} />
            <Block
              x={120}
              y={-156}
              width={93}
              depth={13}
              height={7}
              tone="olive"
            />
            <Tree x={239} y={-128} scale={0.8} />
          </g>
          {/* The central system is built in visible, separate layers. */}
          <g className="world-core">
            <Plinth x={-91} y={-88} width={182} depth={182} />
            <Block x={-67} y={-64} width={134} depth={134} height={13} />
            <Block
              x={-53}
              y={-50}
              z={13}
              width={106}
              depth={106}
              height={18}
              tone="olive"
            />
            <Block x={-40} y={-37} z={31} width={80} depth={80} height={90} />
            {Array.from({ length: 17 }, (_, i) => (
              <path
                key={i}
                d={line([
                  [-37 + i * 4.5, 43, 36],
                  [-37 + i * 4.5, 43, 116],
                ])}
                className="world-core-flute"
              />
            ))}
            {Array.from({ length: 17 }, (_, i) => (
              <path
                key={i}
                d={line([
                  [40, -34 + i * 4.5, 36],
                  [40, -34 + i * 4.5, 116],
                ])}
                className="world-core-flute"
              />
            ))}
            <g className="world-core-crown">
              <Block x={-48} y={-45} z={121} width={96} depth={96} height={9} />
              <Block
                x={-36}
                y={-33}
                z={130}
                width={72}
                depth={72}
                height={8}
                tone="olive"
              />
              <Block
                x={-27}
                y={-24}
                z={138}
                width={54}
                depth={54}
                height={35}
              />
              <Block x={-31} y={-28} z={173} width={62} depth={62} height={5} />
              <path
                d={line([
                  [-18, -11, 178],
                  [-18, 17, 178],
                  [18, 17, 178],
                  [18, -11, 178],
                  [-18, -11, 178],
                ])}
                className="world-ink-line"
              />
              <path
                d={line([
                  [-11, -4, 179],
                  [-11, 10, 179],
                  [11, 10, 179],
                  [11, -4, 179],
                  [-11, -4, 179],
                ])}
                className="world-ink-line"
              />
            </g>
            {[0, 1, 2, 3, 4].map((i) => (
              <Block
                key={i}
                x={-28}
                y={74 + i * 8}
                z={-i * 2}
                width={56}
                depth={8}
                height={10}
              />
            ))}
          </g>
          {/* A transparent architectural enclosure, not a flat shield icon. */}
          <g className="world-boundary">
            <path
              d="M432 323C432 34 768 34 768 323C740 421 461 421 432 323Z"
              fill={`url(#${id}-dome)`}
            />
            <ellipse
              cx="600"
              cy="323"
              rx="168"
              ry="71"
              className="world-boundary-line"
            />
            <path
              d="M432 323C432 34 768 34 768 323M478 371C397 67 669 30 733 360M467 360C531 30 803 67 722 371M600 394V106"
              className="world-boundary-line"
            />
            <path
              d="M445 249C479 309 721 309 755 249M477 174C531 210 669 210 723 174"
              className="world-boundary-latitude"
            />
            <ellipse
              data-world-scan
              cx="600"
              cy="290"
              rx="165"
              ry="58"
              className="world-scan"
            />
            <circle cx="600" cy="106" r="4" className="world-signal" />
          </g>
          {/* Right foreground: an open research workstation. */}
          <g className="world-lab">
            <Plinth x={190} y={-26} width={157} depth={125} />
            <Block x={215} y={-2} width={98} depth={48} height={5} z={29} />
            <Block x={217} y={2} width={5} depth={37} height={29} />
            <Block x={303} y={2} width={5} depth={37} height={29} />
            <Terminal x={230} y={5} z={34} />
            <Block
              x={240}
              y={65}
              width={27}
              depth={25}
              height={20}
              tone="olive"
            />
            <Tree x={330} y={2} scale={1.05} />
            <Tree x={334} y={75} scale={0.7} />
          </g>
          {/* Left foreground: everyday connected hardware. */}
          <g className="world-devices">
            <Plinth x={-292} y={71} width={139} depth={128} />
            <Block x={-272} y={101} width={67} depth={61} height={18} />
            <Block
              x={-266}
              y={107}
              z={18}
              width={55}
              depth={49}
              height={4}
              tone="olive"
            />
            <Block x={-251} y={117} z={22} width={25} depth={23} height={13} />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <path
                  d={line([
                    [-264 + i * 7, 104, 22],
                    [-264 + i * 7, 96, 22],
                  ])}
                  className="world-ink-line"
                />
                <path
                  d={line([
                    [-264 + i * 7, 159, 22],
                    [-264 + i * 7, 167, 22],
                  ])}
                  className="world-ink-line"
                />
              </g>
            ))}
            <Block
              x={-185}
              y={100}
              width={14}
              depth={31}
              height={44}
              tone="ink"
            />
            <Tree x={-276} y={184} scale={0.8} />
            <Tree x={-170} y={173} scale={0.65} />
          </g>
          {/* Front: the record of the work, represented as an open folio. */}
          <g className="world-record">
            <Plinth x={-29} y={201} width={147} depth={101} />
            <Block x={-5} y={224} width={99} depth={58} height={9} />
            <path
              d={line(
                [
                  [0, 224, 11],
                  [42, 225, 17],
                  [42, 280, 17],
                  [0, 279, 11],
                ],
                true
              )}
              className="world-paper"
            />
            <path
              d={line(
                [
                  [42, 225, 17],
                  [87, 221, 12],
                  [87, 276, 12],
                  [42, 280, 17],
                ],
                true
              )}
              className="world-paper"
            />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i}>
                <path
                  d={line([
                    [8, 232 + i * 6, 13],
                    [34, 233 + i * 6, 16],
                  ])}
                  className="world-hatching"
                />
                <path
                  d={line([
                    [51, 232 + i * 6, 16],
                    [79, 229 + i * 6, 13],
                  ])}
                  className="world-hatching"
                />
              </g>
            ))}
            <Tree x={104} y={218} scale={0.75} />
          </g>
          <g className="world-coordinate" strokeLinecap="square">
            {[
              [117, 310],
              [1060, 292],
              [587, 507],
              [586, 50],
            ].map(([x, y]) => (
              <path key={x} d={`M${x - 5} ${y}h10M${x} ${y - 5}v10`} />
            ))}
          </g>
        </g>
      </g>
    </svg>
  )
}
