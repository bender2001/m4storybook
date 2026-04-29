import type {
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";

/**
 * M3 Bottom Navigation (a.k.a. M3 Navigation Bar) variants per
 * https://m3.material.io/components/navigation-bar/specs.
 *
 *   - filled    : `surface-container` host (M3 default).
 *   - tonal     : `secondary-container` host — used inside tonal
 *                 surfaces so the bar reads as part of the same
 *                 tonal step.
 *   - outlined  : transparent host with a top `outline-variant`
 *                 1dp divider; used when the bar floats over media.
 *   - elevated  : `surface-container-low` host + elevation-2 shadow,
 *                 the M3 docked / floating treatment.
 */
export type BottomNavigationVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Mirrors the M3 docs: the spec calls out a 80dp container
 * with a 64×32 active indicator at the default density. We expose
 * three densities so the bar fits compact (mobile) and comfortable
 * (tablet) shells.
 *
 *   sm : 64dp container / 56×24 indicator / label-s typography
 *   md : 80dp container / 64×32 indicator / label-m typography (default)
 *   lg : 96dp container / 72×40 indicator / label-l typography
 */
export type BottomNavigationSize = "sm" | "md" | "lg";

/**
 * Corner shape scale. Default is `none` (full-bleed); the docked /
 * floating treatments accept `lg` or `xl` so the bar reads as a
 * floating surface inside the layout shell.
 */
export type BottomNavigationShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * A single destination. Mirrors MUI's BottomNavigationAction contract
 * but adds a `badge` slot so per-destination notifications follow the
 * M3 navigation badge guidance.
 */
export interface BottomNavigationItem {
  /** Stable identity. Drives `value` change + key. */
  id: string;
  /** label-m typography, painted on-surface (selected) / on-surface-variant. */
  label: ReactNode;
  /** 24dp icon glyph. Required for M3 nav bars. */
  icon: ReactNode;
  /**
   * Optional selected-state icon. Falls back to `icon`. M3 Expressive
   * encourages a filled selected glyph (e.g. material-symbols `fill 1`).
   */
  selectedIcon?: ReactNode;
  /** Badge slot — overlays the icon per M3 badge guidance. */
  badge?: ReactNode;
  /** Disables interaction + dims the item to opacity 0.38. */
  disabled?: boolean;
  /** Optional aria-label override (defaults to `label`). */
  "aria-label"?: string;
}

type BottomNavigationOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "items"
  | "value"
  | "defaultValue"
  | "onChange"
  | "showLabels"
  | "elevated"
  | "disabled";

export interface BottomNavigationProps
  extends Omit<HTMLAttributes<HTMLElement>, BottomNavigationOwnKey | "onChange"> {
  variant?: BottomNavigationVariant;
  size?: BottomNavigationSize;
  shape?: BottomNavigationShape;
  /** Destination matrix. M3 spec recommends 3-5 destinations. */
  items: BottomNavigationItem[];
  /** Controlled active destination id. */
  value?: string;
  /** Uncontrolled initial active id (defaults to the first enabled item). */
  defaultValue?: string;
  /** Fires whenever the active destination changes (id + event). */
  onChange?: (value: string, event: BottomNavigationChangeEvent) => void;
  /**
   * Whether labels appear under the icon. Defaults to `true`. M3 allows
   * labels-on-active-only ("show on selection") via `"selected"`.
   */
  showLabels?: boolean | "selected";
  /** Adds the elevation-2 shadow (also implied by `variant="elevated"`). */
  elevated?: boolean;
  /** Disables every destination + dims the bar to opacity 0.38. */
  disabled?: boolean;
}

export type BottomNavigationChangeEvent =
  | React.MouseEvent<HTMLButtonElement>
  | KeyboardEvent<HTMLButtonElement>;
