import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Click-Away Listener has no dedicated M3 component spec — it is a
 * MUI behaviour primitive. We re-skin it as a *dismissable surface*:
 * a token-aware panel that closes when the user clicks/taps outside
 * its bounds.
 *
 *   - text     : transparent host, on-surface label (pure behaviour
 *                wrapper — useful when the host paints its own surface)
 *   - filled   : `surface-container-highest` panel + on-surface label
 *   - tonal    : `secondary-container` panel + on-secondary-container label
 *   - outlined : transparent panel + 1dp `outline-variant` border
 *   - elevated : `surface-container-low` panel + elevation-2 shadow
 *                (M3 popover/menu surface elevation)
 */
export type ClickAwayVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Mirrors the M3 dialog/menu density scale so a dismissable
 * panel slots into the same hosts.
 *
 *   sm : 12dp pad, 8dp gap, 56dp min-height (compact menus)
 *   md : 16dp pad, 12dp gap, 72dp min-height (M3 default)
 *   lg : 24dp pad, 16dp gap, 96dp min-height (sheets / dialogs)
 */
export type ClickAwaySize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `lg` (M3 menu/popover radius). */
export type ClickAwayShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Activation source for the dismissal event. */
export type ClickAwayDismissSource = "pointer" | "escape";

type ClickAwayOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "open"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "onClickAway"
  | "onDismiss"
  | "dismissOnEscape"
  | "mouseEvent"
  | "touchEvent";

/** Mouse event used as the click-away trigger (matches MUI prop). */
export type ClickAwayMouseEvent =
  | "onClick"
  | "onMouseDown"
  | "onMouseUp"
  | "onPointerDown"
  | "onPointerUp"
  | false;

/** Touch event used as the click-away trigger (matches MUI prop). */
export type ClickAwayTouchEvent =
  | "onTouchStart"
  | "onTouchEnd"
  | false;

export interface ClickAwayProps
  extends Omit<HTMLMotionProps<"div">, ClickAwayOwnKey> {
  variant?: ClickAwayVariant;
  size?: ClickAwaySize;
  shape?: ClickAwayShape;
  /** Controlled open flag — when `false`, the panel collapses + unmounts. */
  open?: boolean;
  /** Marks the panel as selected (M3 secondary-container fill + aria). */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container + on-error-container. */
  error?: boolean;
  /** Optional leading icon rendered alongside the header label. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the header label. */
  trailingIcon?: ReactNode;
  /** Optional header label slot. */
  label?: ReactNode;
  /** Mouse event used to detect click-away. Defaults to `onPointerDown`. */
  mouseEvent?: ClickAwayMouseEvent;
  /** Touch event used to detect click-away. Defaults to `onTouchStart`. */
  touchEvent?: ClickAwayTouchEvent;
  /** Whether pressing Escape should dismiss the panel. Defaults to `true`. */
  dismissOnEscape?: boolean;
  /**
   * Fires when the user clicks/taps anywhere outside the panel. Mirrors
   * MUI's `onClickAway` API for drop-in compatibility.
   */
  onClickAway?: (event: MouseEvent | TouchEvent) => void;
  /**
   * Fires when the panel is dismissed by either a click-away or by the
   * Escape key (if `dismissOnEscape` is enabled). The `source` argument
   * disambiguates the two paths so consumers can react differently.
   */
  onDismiss?: (source: ClickAwayDismissSource) => void;
  children?: ReactNode;
}
