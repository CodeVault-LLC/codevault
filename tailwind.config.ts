import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-theme": {
          DEFAULT: 'hsl(240 10% 3.9%)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
