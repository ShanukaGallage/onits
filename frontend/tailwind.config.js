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

        // ── New theme from User Manage HTML ─────────────────────────────────────
        "on-tertiary-fixed": "#191c1e",
        "on-primary-fixed-variant": "#003ea8",
        "on-error": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "outline": "#737686",
        "on-secondary": "#ffffff",
        "tertiary": "#525657",
        "on-background": "#131b2e",
        "primary-fixed-dim": "#b4c5ff",
        "error": "#ba1a1a",
        "secondary": "#505f76",
        "on-tertiary": "#ffffff",
        "on-error-container": "#93000a",
        "surface-container-low": "#f2f3ff",
        "surface-container-highest": "#dae2fd",
        "on-tertiary-container": "#eff1f3",
        "surface": "#faf8ff",
        "tertiary-fixed-dim": "#c4c7c9",
        "surface-bright": "#faf8ff",
        "on-primary-container": "#eeefff",
        "on-secondary-container": "#54647a",
        "on-tertiary-fixed-variant": "#444749",
        "primary-container": "#2563eb",
        "surface-container": "#eaedff",
        "outline-variant": "#c3c6d7",
        "inverse-on-surface": "#eef0ff",
        "surface-dim": "#d2d9f4",
        "primary-fixed": "#dbe1ff",
        "on-secondary-fixed-variant": "#38485d",
        "surface-tint": "#0053db",
        "on-surface-variant": "#434655",
        "surface-variant": "#dae2fd",
        "on-surface": "#131b2e",
        "secondary-fixed-dim": "#b7c8e1",
        "tertiary-container": "#6b6e70",
        "inverse-surface": "#283044",
        "tertiary-fixed": "#e0e3e5",
        "on-primary": "#ffffff",
        "surface-container-high": "#e2e7ff",
        "secondary-fixed": "#d3e4fe"
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
        // HTML new
        "xl": "0.75rem",
        "full": "9999px"
      },

      spacing: {
        "lg": "1.5rem",
        "card-gap": "1rem",
        "sm": "0.5rem",
        "container-padding": "1.5rem",
        "md": "1rem",
        "xs": "0.25rem",
        "xl": "2rem",
        "base": "0.25rem"
      },

      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
        // HTML new
        "body-sm": ["Hanken Grotesk"],
        "body-md": ["Hanken Grotesk"],
        "label-code": ["JetBrains Mono"],
        "label-caps": ["Hanken Grotesk"],
        "headline-md": ["Hanken Grotesk"],
        "headline-lg": ["Hanken Grotesk"],
        "body-lg": ["Hanken Grotesk"],
        "display": ["Hanken Grotesk"]
      },

      fontSize: {
        "ip-headline-lg": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "ip-headline-md": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
        "ip-body-lg":     ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "ip-body-md":     ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "ip-label-md":    ["0.75rem", { lineHeight: "1rem", fontWeight: "500" }],
        // HTML new
        "body-sm": ["0.8125rem", {"lineHeight": "1.125rem", "fontWeight": "400"}],
        "body-md": ["0.875rem", {"lineHeight": "1.25rem", "fontWeight": "400"}],
        "label-code": ["0.75rem", {"lineHeight": "1rem", "letterSpacing": "0.05em", "fontWeight": "500"}],
        "label-caps": ["0.6875rem", {"lineHeight": "1rem", "letterSpacing": "0.08em", "fontWeight": "700"}],
        "headline-md": ["1.25rem", {"lineHeight": "1.75rem", "fontWeight": "600"}],
        "headline-lg": ["1.5rem", {"lineHeight": "2rem", "fontWeight": "600"}],
        "body-lg": ["1rem", {"lineHeight": "1.5rem", "fontWeight": "400"}],
        "display": ["2.25rem", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
      },
    },
  },
  plugins: [],
};