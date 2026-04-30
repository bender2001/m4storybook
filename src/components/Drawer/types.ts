import type { HTMLMotionProps } from "motion/react";
import type {
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

/**
 * M3 Navigation Drawer variants per
 * https://m3.material.io/components/navigation-drawer/specs.
 *
 *   - standard : `surface-container-low` host, persistent / inline
 *                drawer pinned to the layout edge (no scrim).
 *   - modal    : same surface as standard but rendered with a scrim
 *                + AnimatePresence slide-in. Used for compact /
 *                phone shells where the drawer overlays content.
 *   - tonal    : `secondary-container` host. Used inside tonal
 *                surfaces so the drawer reads as part of the same
 *                tonal step.
 *   - outlined : transparent host with a 1dp `outline-variant`
 *                trailing border (no fill). Low-emphasis treatment.
 *   - elevated : `surface-container-low` host + elevation-1 shadow,
 *                the M3 floating treatment for docked / sliding
 *                drawers.
 */
export type DrawerVariant =
  | "standard"
  | "modal"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. The M3 spec defines a 360dp container. We expose three
 * densities so the drawer fits compact (mobile rail-adjacent) and
 * comfortable (tablet) shells.
 *
 *   sm : 288dp container / 48dp item / label-l (compact)
 *   md : 360dp container / 56dp item / label-l (M3 default)
 *   lg : 400dp container / 64dp item / title-m (comfortable)
 */
export type DrawerSize = "sm" | "md" | "lg";

/**
 * Corner shape scale. The M3 modal drawer rounds the trailing edge
 * to `lg` (16dp). Standard drawers use `none`. The full token scale
 * is exposed for floating treatments that need a full-pill shape.
 */
export type DrawerShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Anchor edge. M3 leaves anchor up to the layout direction, but we
 * expose explicit `start` / `end` anchors so the drawer can dock to
 * either side. `start` (LTR = left) is the M3 default.
 */
export type DrawerAnchor = "start" | "end";

/**
 * A single navigation destination inside the drawer.
 *
 * Mirrors MUI's `ListItemButton`/`ListItemIcon`/`ListItemText` set
 * but keeps the contract narrow: a single icon, a single label, and
 * an optional badge slot rendered at the trailing edge.
 */
export interface DrawerItem {
  /** Stable identity. Drives `value` change + key. */
  id: string;
  /** label-l typography, painted on-surface-variant (rest) / on-secondary-container (selected). */
  label: ReactNode;
  /** Optional 24dp leading icon. */
  icon?: ReactNode;
  /** Optional selected-icon override (e.g. filled glyph). Falls back to `icon`. */
  selectedIcon?: ReactNode;
  /** Optional trailing slot — typically a badge / count. */
  badge?: ReactNode;
  /** Optional group key — items sharing a key cluster under the same headline. */
  group?: string;
  /** Disables interaction + dims the row to opacity 0.38. */
  disabled?: boolean;
  /** Optional aria-label override (defaults to `label`). */
  "aria-label"?: string;
}

/**
 * Optional headline / divider section between item groups.
 */
export interface DrawerSection {
  /** Stable identity. */
  id: string;
  /** Section headline — typeset title-s on-surface-variant. */
  headline?: ReactNode;
  /** Items inside this section. */
  items: DrawerItem[];
  /**
   * If true, render a 1dp divider above this section (`outline-variant`).
   * Defaults to true for any section beyond the first.
   */
  divider?: boolean;
}

type DrawerOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "anchor"
  | "open"
  | "onClose"
  | "items"
  | "sections"
  | "value"
  | "defaultValue"
  | "onChange"
  | "header"
  | "footer"
  | "headline"
  | "scrim"
  | "scrimVariant"
  | "contained"
  | "disableEscapeClose"
  | "disableScrimClose"
  | "disabled"
  | "ariaLabel";

export type DrawerChangeEvent =
  | MouseEvent<HTMLButtonElement>
  | KeyboardEvent<HTMLButtonElement>;

export interface DrawerProps
  extends Omit<HTMLMotionProps<"nav">, "ref" | DrawerOwnKey | "onChange"> {
  /** Visual variant. Default `standard`. */
  variant?: DrawerVariant;
  /** Density / width preset. Default `md` (M3 360dp). */
  size?: DrawerSize;
  /** Corner shape token. Default `lg` for modal, `none` for standard. */
  shape?: DrawerShape;
  /** Edge to dock against. Default `start` (LTR = left). */
  anchor?: DrawerAnchor;
  /**
   * Controlled visibility. Modal drawers animate in/out; standard
   * drawers slide their trailing edge but remain in flow. Defaults
   * to `true` so the component renders without state in stories.
   */
  open?: boolean;
  /** Fires when the user dismisses the drawer (scrim / Escape). */
  onClose?: () => void;
  /** Flat item list (no grouping). Mutually exclusive with `sections`. */
  items?: DrawerItem[];
  /** Grouped sections — each may have its own headline + divider. */
  sections?: DrawerSection[];
  /** Controlled active destination id. */
  value?: string;
  /** Uncontrolled initial active id. */
  defaultValue?: string;
  /** Fires whenever the active destination changes. */
  onChange?: (value: string, event: DrawerChangeEvent) => void;
  /** Optional header slot (rendered above the first section). */
  header?: ReactNode;
  /** Optional footer slot (rendered after the last section). */
  footer?: ReactNode;
  /** Optional top-level headline (typeset title-s on-surface-variant). */
  headline?: ReactNode;
  /** Render the scrim under modal drawers. Defaults to true. */
  scrim?: boolean;
  /** Override scrim variant. Forwarded to the internal Backdrop. */
  scrimVariant?: "filled" | "tonal" | "outlined" | "invisible";
  /**
   * Render the modal drawer with `position: absolute` so it fills
   * its nearest positioned ancestor (used in stories so the drawer
   * doesn't eat the entire Storybook iframe).
   */
  contained?: boolean;
  /** Skip the Escape-to-close keybind. Default false. */
  disableEscapeClose?: boolean;
  /** Skip click-on-scrim-to-close. Default false. */
  disableScrimClose?: boolean;
  /** Disables every destination + dims the drawer to opacity 0.38. */
  disabled?: boolean;
  /** Aria label for the surrounding <nav>. Defaults to "Navigation drawer". */
  ariaLabel?: string;
}
