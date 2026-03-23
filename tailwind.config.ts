import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Base system colors */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        /* Cards and Popovers */
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        /* Semantic colors */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        /* Charts */
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },

        /* KINETIC Material Design 3 Extended Palette */
        "on-secondary": "#233144",
        "on-primary-container": "#009365",
        "tertiary-container": "#390003",
        "on-error-container": "#ffdad6",
        "outline-variant": "#45464d",
        "primary-fixed": "#6ffbbe",
        "tertiary": "#ffb3ad",
        "on-tertiary-fixed": "#410004",
        "on-tertiary": "#68000a",
        "surface-container-high": "#23293c",
        "on-background": "#dce1fb",
        "surface-container-low": "#151b2d",
        "on-primary-fixed": "#002113",
        "error": "#ffb4ab",
        "primary-container": "#001c10",
        "on-secondary-container": "#abb9d2",
        "on-surface-variant": "#c6c6cd",
        "surface-bright": "#33394c",
        "on-error": "#690005",
        "surface-container-highest": "#2e3447",
        "surface-variant": "#2e3447",
        "surface-dim": "#0c1324",
        "inverse-on-surface": "#2a3043",
        "on-primary": "#003824",
        "on-tertiary-container": "#eb4141",
        "secondary-container": "#3c4a5e",
        "on-tertiary-fixed-variant": "#930013",
        "on-surface": "#dce1fb",
        "secondary-fixed": "#d5e3fd",
        "error-container": "#93000a",
        "surface-tint": "#4edea3",
        "surface": "#0c1324",
        "on-secondary-fixed": "#0d1c2f",
        "surface-container": "#191f31",
        "primary-fixed-dim": "#4edea3",
        "tertiary-fixed": "#ffdad7",
        "on-primary-fixed-variant": "#005236",
        "inverse-primary": "#006c49",
        "on-secondary-fixed-variant": "#3a485c",
        "surface-container-lowest": "#070d1f",
        "inverse-surface": "#dce1fb",
        "outline": "#909097",

        /* Crypto palette */
        "crypto-dark-blue": "hsl(var(--color-dark-blue))",
        "crypto-light-grey": "hsl(var(--color-light-grey))",
        "crypto-green": "hsl(var(--color-green))",
        "crypto-pink": "hsl(var(--color-pink))",
        "crypto-orange": "hsl(var(--color-orange))",

        /* Badges */
        "badge-bg": "hsl(var(--color-orange))",
        "badge-text": "hsl(var(--color-light-grey))",
        "badge-border": "hsl(var(--color-dark-blue))",

        /* Arounda-inspired background */
        "site-bg": "hsl(var(--color-site-bg))",
        "contrast-text": "hsl(0, 0%, 98%)",
      },

      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },

      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        geist: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        robotto: ["var(--font-robotto-sans)", "sans-serif"],
        primary: ["var(--font-primary)"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
      },

      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      animation: {
        marquee: "marquee 30s linear infinite",
        fadeIn: "fadeIn 300ms ease-out",
        slideUp: "slideUp 400ms ease-out",
        slideDown: "slideDown 400ms ease-out",
        scaleIn: "scaleIn 300ms ease-out",
      },

      transitionDelay: {
        0: "0ms",
        50: "50ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        300: "300ms",
      },

      transitionDuration: {
        150: "150ms",
        300: "300ms",
        400: "400ms",
        500: "500ms",
      },

      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },

      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
