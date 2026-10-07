import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge only knows Tailwind's own scale, so our `text-*` steps
// (globals.css) look to it like colors — and it would drop `text-caption`
// when a `text-faint` landed in the same `cn()` call, since it assumes two
// classes in one group can't both apply. Registering the scale as font sizes
// keeps size and color in separate groups, where they belong.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xxl",
            "display-xl",
            "display-l",
            "display-m",
            "display-s",
            "display-xs",
            "paragraph-l",
            "paragraph-m",
            "paragraph-s",
            "ui",
            "caption",
            "label",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
