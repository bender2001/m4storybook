/**
 * M3 color role tokens. Values are exposed as CSS variables on
 * `:root` (light) and `[data-theme=dark]`. Tailwind reads them via
 * `var(--md-sys-color-*)` so all component code stays token-driven.
 */
export type ColorRole =
  | "primary"
  | "on-primary"
  | "primary-container"
  | "on-primary-container"
  | "secondary"
  | "on-secondary"
  | "secondary-container"
  | "on-secondary-container"
  | "tertiary"
  | "on-tertiary"
  | "tertiary-container"
  | "on-tertiary-container"
  | "error"
  | "on-error"
  | "error-container"
  | "on-error-container"
  | "background"
  | "on-background"
  | "surface"
  | "on-surface"
  | "surface-variant"
  | "on-surface-variant"
  | "surface-dim"
  | "surface-bright"
  | "surface-container-lowest"
  | "surface-container-low"
  | "surface-container"
  | "surface-container-high"
  | "surface-container-highest"
  | "outline"
  | "outline-variant"
  | "scrim"
  | "shadow"
  | "inverse-surface"
  | "inverse-on-surface"
  | "inverse-primary";

export const lightColors: Record<ColorRole, string> = {
  primary: "#6750A4",
  "on-primary": "#FFFFFF",
  "primary-container": "#EADDFF",
  "on-primary-container": "#21005D",
  secondary: "#625B71",
  "on-secondary": "#FFFFFF",
  "secondary-container": "#E8DEF8",
  "on-secondary-container": "#1D192B",
  tertiary: "#7D5260",
  "on-tertiary": "#FFFFFF",
  "tertiary-container": "#FFD8E4",
  "on-tertiary-container": "#31111D",
  error: "#B3261E",
  "on-error": "#FFFFFF",
  "error-container": "#F9DEDC",
  "on-error-container": "#410E0B",
  background: "#FEF7FF",
  "on-background": "#1D1B20",
  surface: "#FEF7FF",
  "on-surface": "#1D1B20",
  "surface-variant": "#E7E0EC",
  "on-surface-variant": "#49454F",
  "surface-dim": "#DED8E1",
  "surface-bright": "#FEF7FF",
  "surface-container-lowest": "#FFFFFF",
  "surface-container-low": "#F7F2FA",
  "surface-container": "#F3EDF7",
  "surface-container-high": "#ECE6F0",
  "surface-container-highest": "#E6E0E9",
  outline: "#79747E",
  "outline-variant": "#CAC4D0",
  scrim: "#000000",
  shadow: "#000000",
  "inverse-surface": "#322F35",
  "inverse-on-surface": "#F5EFF7",
  "inverse-primary": "#D0BCFF",
};

export const darkColors: Record<ColorRole, string> = {
  primary: "#D0BCFF",
  "on-primary": "#381E72",
  "primary-container": "#4F378B",
  "on-primary-container": "#EADDFF",
  secondary: "#CCC2DC",
  "on-secondary": "#332D41",
  "secondary-container": "#4A4458",
  "on-secondary-container": "#E8DEF8",
  tertiary: "#EFB8C8",
  "on-tertiary": "#492532",
  "tertiary-container": "#633B48",
  "on-tertiary-container": "#FFD8E4",
  error: "#F2B8B5",
  "on-error": "#601410",
  "error-container": "#8C1D18",
  "on-error-container": "#F9DEDC",
  background: "#141218",
  "on-background": "#E6E0E9",
  surface: "#141218",
  "on-surface": "#E6E0E9",
  "surface-variant": "#49454F",
  "on-surface-variant": "#CAC4D0",
  "surface-dim": "#141218",
  "surface-bright": "#3B383E",
  "surface-container-lowest": "#0F0D13",
  "surface-container-low": "#1D1B20",
  "surface-container": "#211F26",
  "surface-container-high": "#2B2930",
  "surface-container-highest": "#36343B",
  outline: "#938F99",
  "outline-variant": "#49454F",
  scrim: "#000000",
  shadow: "#000000",
  "inverse-surface": "#E6E0E9",
  "inverse-on-surface": "#322F35",
  "inverse-primary": "#6750A4",
};

export const colorVarMap: Record<ColorRole, string> = Object.fromEntries(
  (Object.keys(lightColors) as ColorRole[]).map((role) => [
    role,
    `var(--md-sys-color-${role})`,
  ]),
) as Record<ColorRole, string>;
