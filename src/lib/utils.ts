import { clsx } from "clsx"
import type { ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge only knows Tailwind's own scale, so our `text-*` steps
// (globals.css) look to it like colors — and it would drop `text-detail-xs`
// when a `text-faded` landed in the same `cn()` call, since it assumes two
// classes in one group can't both apply. Registering the scale as font sizes
// keeps size and color in separate groups, where they belong.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xs",
            "display-s",
            "display-m",
            "display-l",
            "display-xl",
            "display-xxl",
            "paragraph-s",
            "paragraph-m",
            "paragraph-l",
            "detail-xs",
            "ui-xs",
            "ui-sm",
            "ui-base",
            "ui-lg",
            "ui-xl",
            "ui-2xl",
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
