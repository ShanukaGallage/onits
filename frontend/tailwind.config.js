/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // ── shadcn/ui CSS-variable aliases (kept for existing components) ───────
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Indigo Pulse design system ─────────────────────────────────────
        ip: {
          surface:                    "#fbf8ff",
          "surface-dim":              "#d8d9ea",
          "surface-bright":           "#fbf8ff",
          "surface-container-lowest": "#ffffff",
          "surface-container-low":    "#f3f2ff",
          "surface-container":        "#ecedfe",
          "surface-container-high":   "#e6e7f8",
          "surface-container-highest":"#e1e1f2",
          "on-surface":               "#191b27",
          "on-surface-variant":       "#464554",
          "inverse-surface":          "#2d303c",
          "inverse-on-surface":       "#efefff",
          outline:                    "#767586",
          "outline-variant":          "#c7c4d7",
          "surface-tint":             "#494bd6",

          primary:                    "#4648d4",
          "on-primary":               "#ffffff",
          "primary-container":        "#6063ee",
          "on-primary-container":     "#fffbff",
          "inverse-primary":          "#c0c1ff",
          "primary-fixed":            "#e1e0ff",
          "primary-fixed-dim":        "#c0c1ff",
          "on-primary-fixed":         "#07006c",
          "on-primary-fixed-variant": "#2f2ebe",

          secondary:                  "#5b5d6d",
          "on-secondary":             "#ffffff",
          "secondary-container":      "#e0e1f4",
          "on-secondary-container":   "#616373",
          "secondary-fixed":          "#e0e1f4",
          "secondary-fixed-dim":      "#c4c5d7",
          "on-secondary-fixed":       "#181b28",
          "on-secondary-fixed-variant":"#444655",

          tertiary:                   "#712ae2",
          "on-tertiary":              "#ffffff",
          "tertiary-container":       "#8a4cfc",
          "on-tertiary-container":    "#fffbff",
          "tertiary-fixed":           "#eaddff",
          "tertiary-fixed-dim":       "#d2bbff",
          "on-tertiary-fixed":        "#25005a",
          "on-tertiary-fixed-variant":"#5a00c6",

          error:                      "#ba1a1a",
          "on-error":                 "#ffffff",
          "error-container":          "#ffdad6",
          "on-error-container":       "#93000a",

          background:                 "#fbf8ff",
          "on-background":            "#191b27",
          "surface-variant":          "#e1e1f2",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Indigo Pulse shape scale
        "ip-sm":   "0.25rem",
        "ip-base": "0.5rem",
        "ip-md":   "0.75rem",
        "ip-lg":   "1rem",
        "ip-xl":   "1.5rem",
      },

      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
      },

      fontSize: {
        "ip-headline-lg": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "ip-headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "ip-body-lg":     ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "ip-body-md":     ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "ip-label-md":    ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};