// Photographs used around the site. They're generated images, made for this
// site, not photos of anyone's project: daylight, buildings under
// construction, conduit and the services it has to keep clear of. No people,
// no text, no logos. Each is in `public/images/` at 960 and 1536 wide (WebP).
//
// They set the scene. Never caption one as work done with CodeVault
// Electrical or as a customer's building.

export type Image = {
  /** The file name in `public/images/`, without the width and extension. */
  name: string
  alt: string
  width: number
  height: number
}

const image = (name: string, alt: string): Image => ({
  name,
  alt,
  width: 1536,
  height: 1024,
})

export const images = {
  conduitCeiling: image(
    "conduit-ceiling",
    "An open floor in a building under construction, with runs of galvanized conduit and a cable tray along the concrete ceiling."
  ),
  conduitBends: image(
    "conduit-bends",
    "Four galvanized conduits bending together through a right angle under a concrete slab."
  ),
  studWall: image(
    "stud-wall",
    "A row of junction boxes on metal studs, each fed by conduit dropping from the ceiling."
  ),
  ceilingVoid: image(
    "ceiling-void",
    "Ductwork, sprinkler pipe, insulated pipes and conduit routed around a concrete beam in an open ceiling."
  ),
  electricalRoom: image(
    "electrical-room",
    "A switchboard in an electrical room, with a row of conduits entering from above."
  ),
  exterior: image(
    "exterior",
    "An office building under construction on a clear morning."
  ),
  /** The Electrical page's hero, one scene in three lights. */
  heroMorning: image(
    "hero-morning",
    "A long, open floor in a building under construction at sunrise, with runs of conduit and a cable tray along the ceiling."
  ),
  heroNoon: image(
    "hero-noon",
    "A long, open floor in a building under construction at midday, with runs of conduit and a cable tray along the ceiling."
  ),
  heroEvening: image(
    "hero-evening",
    "A long, open floor in a building under construction at dusk, lit by work lights hung along the cable tray."
  ),
} as const
