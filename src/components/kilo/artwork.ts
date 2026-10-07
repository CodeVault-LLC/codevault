// Kilo's vectors, copied from the Kilo repository (src/components/brand/artwork.ts).
// Keep them identical: the mascot's open arch and offset crown are its identity.
export const kiloMarkPath = "M8 8H18V56H8Z M24 29L44 8H58L35 33L58 56H44L24 36Z"
export const kiloWordmarkPath =
  "M0 2H10V38L29 20H43L21 40L45 64H31L10 43V64H0Z " +
  "M55 20H65V64H55Z M55 2H65V12H55Z M79 2H89V64H79Z " +
  "M124 18C139 18 148 28 148 42S139 66 124 66S100 56 100 42S109 18 124 18Z " +
  "M124 28C115 28 110 34 110 42S115 56 124 56S138 50 138 42S133 28 124 28Z"
export const kiloBodyPath =
  "M11 39C8 22 19 9 34 9C49 9 57 23 52 39L48 52Q47 55 43 55H40Q36 55 37 51L40 40Q41 35 36 34H29Q24 34 25 40L27 51Q28 55 24 55H20Q16 55 15 51Z"

export const kiloEyes = [25, 36] as const
export const kiloEyeY = 23
export const kiloEyeWidth = 3.5
export const kiloEyeHeight = 7
/** Where the mascot's feet meet the ground, in its 64-unit grid. */
export const kiloFoot = { x: 32, y: 55 } as const
