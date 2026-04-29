import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Visual variant. M3 doesn't ship a first-class "Backdrop" component
 * — the closest M3 analog is the scrim used by dialogs / modal sheets
 * (https://m3.material.io/components/dialogs/specs#a30c941d-0876-4dca-bbe4-c5fe2c823c81).
 * The MUI Backdrop API is preserved (full-viewport overlay with an
 * `open` prop + click-to-dismiss handler) and re-skinned onto the M3
 * scrim token. Variants paint the surface in four ways:
 *
 *   - filled    : scrim color (#000) at the active opacity. M3
 *                 default for dialog / modal scrims.
 *   - tonal     : surface-container-highest at the active opacity —
 *                 a softer veil for in-context backdrops.
 *   - outlined  : transparent fill + 1dp outline border, no veil.
 *                 Used as a focus-trap frame when the surface behind
 *                 should remain fully visible.
 *   - invisible : transparent fill with no veil and no border. The
 *                 backdrop still blocks pointer events. Equivalent
 *                 to MUI's `invisible` flag.
 */
export type BackdropVariant = "filled" | "tonal" | "outlined" | "invisible";

/**
 * Density / weight. Drives the scrim opacity per M3 dialog-scrim
 * guidance (https://m3.material.io/components/dialogs/specs).
 *
 *   - sm : 0.16 opacity (light veil — used behind subtle popovers)
 *   - md : 0.32 opacity (M3 default for dialog / modal scrims)
 *   - lg : 0.56 opacity (heavy veil — used for fullscreen modal flow)
 */
export type BackdropSize = "sm" | "md" | "lg";

/**
 * Corner shape. The default backdrop covers the whole viewport so
 * `none` is the natural default; the rounded options are useful when
 * the backdrop is mounted inside a contained surface (e.g. a card)
 * via `contained`.
 */
export type BackdropShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type BackdropOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "open"
  | "onClose"
  | "invisible"
  | "contained"
  | "disabled"
  | "children"
  | "closeOnEscape";

export interface BackdropProps
  extends Omit<HTMLMotionProps<"div">, "ref" | BackdropOwnKey> {
  /** Visual variant. Default `filled`. */
  variant?: BackdropVariant;
  /** Density (drives scrim opacity). Default `md`. */
  size?: BackdropSize;
  /** Corner shape token. Default `none` (full-viewport rect). */
  shape?: BackdropShape;
  /**
   * Controlled visibility. When false, the backdrop is animated out
   * via AnimatePresence (opacity fade, M3 emphasized 300ms).
   * Defaults to true.
   */
  open?: boolean;
  /**
   * Fires when the user clicks the scrim (or, when
   * `closeOnEscape` is true, presses Escape with focus inside the
   * surface). Equivalent to MUI's `onClose`.
   */
  onClose?: () => void;
  /**
   * Convenience flag — alias for `variant="invisible"`. When set,
   * forces the invisible variant and overrides `variant`.
   */
  invisible?: boolean;
  /**
   * Render the backdrop with `position: absolute` so it fills its
   * nearest positioned ancestor instead of the viewport. Defaults
   * to false (fixed full-viewport).
   */
  contained?: boolean;
  /** Disable interaction (no click handler, dimmed to 0.38). */
  disabled?: boolean;
  /**
   * Listen for the Escape key while focus is inside the backdrop and
   * fire `onClose`. Defaults to true when `onClose` is set.
   */
  closeOnEscape?: boolean;
  /** Optional centered content (typically a spinner or short label). */
  children?: ReactNode;
}
