import type { Config } from "tailwindcss";

/**
 * Tailwind cannot live in the same TS composite project as the app
 * source, so this config keeps a copy of the M3 token values that
 * mirror `src/tokens/*`. If you change one, change the other.
 * `tests/visual/tokens.spec.ts` asserts they stay in sync.
 */

const colorRoles = [
  "primary",
  "on-primary",
  "primary-container",
  "on-primary-container",
  "secondary",
  "on-secondary",
  "secondary-container",
  "on-secondary-container",
  "tertiary",
  "on-tertiary",
  "tertiary-container",
  "on-tertiary-container",
  "error",
  "on-error",
  "error-container",
  "on-error-container",
  "background",
  "on-background",
  "surface",
  "on-surface",
  "surface-variant",
  "on-surface-variant",
  "surface-dim",
  "surface-bright",
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
  "outline",
  "outline-variant",
  "scrim",
  "shadow",
  "inverse-surface",
  "inverse-on-surface",
  "inverse-primary",
] as const;

const colors = Object.fromEntries(
  colorRoles.map((role) => [role, `var(--md-sys-color-${role})`]),
);

const fontSize = {
  "display-l": ["57px", { lineHeight: "64px", letterSpacing: "-0.25px", fontWeight: "400" }],
  "display-m": ["45px", { lineHeight: "52px", letterSpacing: "0px", fontWeight: "400" }],
  "display-s": ["36px", { lineHeight: "44px", letterSpacing: "0px", fontWeight: "400" }],
  "headline-l": ["32px", { lineHeight: "40px", letterSpacing: "0px", fontWeight: "400" }],
  "headline-m": ["28px", { lineHeight: "36px", letterSpacing: "0px", fontWeight: "400" }],
  "headline-s": ["24px", { lineHeight: "32px", letterSpacing: "0px", fontWeight: "400" }],
  "title-l": ["22px", { lineHeight: "28px", letterSpacing: "0px", fontWeight: "500" }],
  "title-m": ["16px", { lineHeight: "24px", letterSpacing: "0.15px", fontWeight: "500" }],
  "title-s": ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" }],
  "body-l": ["16px", { lineHeight: "24px", letterSpacing: "0.5px", fontWeight: "400" }],
  "body-m": ["14px", { lineHeight: "20px", letterSpacing: "0.25px", fontWeight: "400" }],
  "body-s": ["12px", { lineHeight: "16px", letterSpacing: "0.4px", fontWeight: "400" }],
  "label-l": ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" }],
  "label-m": ["12px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" }],
  "label-s": ["11px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" }],
} as const;

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,mdx}",
    "./.storybook/**/*.{ts,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors,
      fontSize: fontSize as unknown as Record<string, [string, object]>,
      borderRadius: {
        "shape-none": "0px",
        "shape-xs": "4px",
        "shape-sm": "8px",
        "shape-md": "12px",
        "shape-lg": "16px",
        "shape-xl": "28px",
        "shape-full": "9999px",
      },
      boxShadow: {
        "elevation-0": "none",
        "elevation-1": "0px 1px 2px 0px rgb(0 0 0 / 0.30), 0px 1px 3px 1px rgb(0 0 0 / 0.15)",
        "elevation-2": "0px 1px 2px 0px rgb(0 0 0 / 0.30), 0px 2px 6px 2px rgb(0 0 0 / 0.15)",
        "elevation-3": "0px 4px 8px 3px rgb(0 0 0 / 0.15), 0px 1px 3px 0px rgb(0 0 0 / 0.30)",
        "elevation-4": "0px 6px 10px 4px rgb(0 0 0 / 0.15), 0px 2px 3px 0px rgb(0 0 0 / 0.30)",
        "elevation-5": "0px 8px 12px 6px rgb(0 0 0 / 0.15), 0px 4px 4px 0px rgb(0 0 0 / 0.30)",
      },
      transitionTimingFunction: {
        emphasized: "cubic-bezier(0.2, 0, 0, 1)",
        "emphasized-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1)",
        "emphasized-accelerate": "cubic-bezier(0.3, 0, 0.8, 0.15)",
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        "standard-decelerate": "cubic-bezier(0, 0, 0, 1)",
        "standard-accelerate": "cubic-bezier(0.3, 0, 1, 1)",
      },
      transitionDuration: {
        short1: "50ms",
        short2: "100ms",
        short3: "150ms",
        short4: "200ms",
        medium1: "250ms",
        medium2: "300ms",
        medium3: "350ms",
        medium4: "400ms",
        long1: "450ms",
        long2: "500ms",
        long3: "550ms",
        long4: "600ms",
      },
      fontFamily: {
        sans: [
          '"Roboto Flex"',
          '"Roboto"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ['"Roboto Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
