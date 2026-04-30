import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Snackbar variants per
 * https://m3.material.io/components/snackbar/specs.
 *
 *   - filled    : `inverse-surface` host with `inverse-on-surface`
 *                 label + `inverse-primary` action — the M3 default.
 *   - tonal     : `surface-container-highest` host + `on-surface`
 *                 label — used when the surrounding shell is already
 *                 dark / inverse and a non-inverse swatch reads better.
 *   - outlined  : transparent host + 1dp `outline` border + on-surface
 *                 label; lower-emphasis treatment.
 *   - elevated  : `surface-container-high` host + level-3 shadow,
 *                 the floating-card snackbar treatment.
 */
export type SnackbarVariant = "filled" | "tonal" | "outlined" | "elevated";

/**
 * Density. Mirrors the M3 docs: single-line snackbars are 48dp tall
 * with 16dp horizontal padding; the two-line treatment grows to 68dp.
 *
 *   sm : 40dp shell / body-s label / 18dp icon — compact mobile sheets
 *   md : 48dp shell / body-m label / 20dp icon — M3 default
 *   lg : 56dp shell / body-l label / 24dp icon — comfortable density
 */
export type SnackbarSize = "sm" | "md" | "lg";

/**
 * Corner shape token. Default is `xs` (4dp) per the M3 snackbar spec.
 * Floating treatments accept `sm` or `md` so the bar reads as a card.
 */
export type SnackbarShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Anchor positions for the snackbar host. The component does not
 * portal itself, but supplies the positional helpers a portal would
 * use so consumers can drop it into a fixed shell.
 */
export type SnackbarOrigin =
  | "bottom-center"
  | "bottom-start"
  | "bottom-end"
  | "top-center"
  | "top-start"
  | "top-end";

type SnackbarOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "origin"
  | "open"
  | "onClose"
  | "autoHideDuration"
  | "message"
  | "action"
  | "icon"
  | "showClose"
  | "closeLabel"
  | "disabled"
  | "children";

export interface SnackbarProps
  extends Omit<HTMLMotionProps<"div">, "ref" | SnackbarOwnKey> {
  /** Visual variant. Default `filled` per the M3 default scheme. */
  variant?: SnackbarVariant;
  /** Density. Default `md` (48dp shell). */
  size?: SnackbarSize;
  /** Corner shape token. Default `xs` (4dp) per the M3 snackbar spec. */
  shape?: SnackbarShape;
  /**
   * Anchor origin. Drives the entry / exit translate axis (snackbars
   * slide in along the y-axis from the anchor edge).
   */
  origin?: SnackbarOrigin;
  /**
   * Controlled visibility. When false the snackbar is animated out
   * via AnimatePresence (translateY + opacity, M3 emphasized 300ms).
   */
  open?: boolean;
  /**
   * Fires when the snackbar is dismissed — either by the close
   * affordance, an Escape keypress, or the auto-hide timer.
   */
  onClose?: (reason: SnackbarCloseReason) => void;
  /**
   * Auto-hide timeout in ms. M3 recommends 4000–10000 ms. Pass
   * `null` (default) to disable auto-hide entirely.
   */
  autoHideDuration?: number | null;
  /** Message body — typeset body-m on inverse-on-surface. */
  message?: ReactNode;
  /**
   * Trailing action slot — typically a single text-style button
   * painted in `inverse-primary`. M3 limits to one action label.
   */
  action?: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Renders a trailing close icon button. Defaults to `false`. */
  showClose?: boolean;
  /** aria-label for the close icon button. Defaults to "Close". */
  closeLabel?: string;
  /** Dim + disable the snackbar (opacity 0.38, no pointer events). */
  disabled?: boolean;
  /**
   * Body fallback. Use `message` for the canonical text slot; this
   * mirrors MUI's `children` API for drop-in compatibility.
   */
  children?: ReactNode;
}

/**
 * Reasons the snackbar reported a close event. Mirrors the MUI
 * Snackbar API so consumers can distinguish auto-hide from explicit
 * dismissals (close button, Escape keypress, action click).
 */
export type SnackbarCloseReason =
  | "timeout"
  | "clickaway"
  | "escapeKeyDown"
  | "closeClick"
  | "action";
