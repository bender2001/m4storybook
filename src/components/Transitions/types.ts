import type { HTMLMotionProps } from "motion/react";
import type { ReactNode, Ref } from "react";

/**
 * Transitions variant. MUI ships five enter/exit transition wrappers
 * (https://mui.com/material-ui/transitions/) — `Fade`, `Grow`, `Slide`,
 * `Zoom`, and `Collapse`. The Transitions component re-skins all five
 * onto a single motion/react surface that drives the animation through
 * the M3 motion tokens (emphasized / standard / decelerate / accelerate
 * easings on the M3 short / medium / long duration scale).
 *
 *   - fade     : opacity 0 -> 1 (M3 standard easing, medium2)
 *   - grow     : scale 0 -> 1 + opacity 0 -> 1 (emphasized, medium2)
 *   - slide    : translate from `direction` -> 0 (emphasized, medium2)
 *   - zoom     : scale 0.6 -> 1 + opacity 0 -> 1 (emphasized, medium2)
 *   - collapse : height/width 0 -> auto (emphasized-decelerate, medium2)
 *
 * Each variant is an M3 motion token application of the same
 * AnimatePresence wrapper — only the motion variants differ.
 */
export type TransitionsVariant =
  | "fade"
  | "grow"
  | "slide"
  | "zoom"
  | "collapse";

/**
 * Density. Drives the M3 motion duration token used for both enter and
 * exit so the transition matches the host surface's emphasis.
 *
 *   - sm : short4 (200ms) — compact transitions for dense surfaces
 *   - md : medium2 (300ms) — M3 default for standard motion
 *   - lg : long1 (450ms) — large surfaces (sheets, expressive panels)
 */
export type TransitionsSize = "sm" | "md" | "lg";

/** Slide / collapse axis. Slide uses up / down / left / right; collapse
 *  uses vertical (height) or horizontal (width). The shared scale lets
 *  callers pass a single `direction` prop regardless of variant. */
export type TransitionsDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "vertical"
  | "horizontal";

/** M3 corner shape token applied to the transition wrapper. */
export type TransitionsShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type TransitionsOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "direction"
  | "in"
  | "appear"
  | "unmountOnExit"
  | "mountOnEnter"
  | "timeout"
  | "easing"
  | "disabled"
  | "selected"
  | "error"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "fallback"
  | "children"
  | "onEntered"
  | "onExited"
  | "ref";

export interface TransitionsProps
  extends Omit<HTMLMotionProps<"div">, TransitionsOwnKey> {
  /** Transition variant. Defaults to `fade`. */
  variant?: TransitionsVariant;
  /** Density (drives motion duration token). Defaults to `md`. */
  size?: TransitionsSize;
  /** Corner shape token. Defaults to `md`. */
  shape?: TransitionsShape;
  /**
   * Direction for `slide` / `collapse`. Defaults to `up` for slide
   * (children translate in from below) and `vertical` for collapse.
   * Ignored by other variants.
   */
  direction?: TransitionsDirection;
  /**
   * Controlled visibility flag (parity with MUI `Transition` API). When
   * true, the children mount / fade in; when false they animate out via
   * AnimatePresence. Defaults to `true`.
   */
  in?: boolean;
  /**
   * Whether to play the enter transition on first mount. Mirrors MUI's
   * `appear` prop. Defaults to `true`.
   */
  appear?: boolean;
  /**
   * If true, the children are removed from the DOM once the exit
   * animation completes. Mirrors MUI's `unmountOnExit`. Defaults to
   * `true` so closed transitions don't pollute screen-reader trees.
   */
  unmountOnExit?: boolean;
  /**
   * If true, the children are not mounted until `in` becomes truthy.
   * Mirrors MUI's `mountOnEnter`. Defaults to `false`.
   */
  mountOnEnter?: boolean;
  /**
   * Optional override for the M3 motion duration in milliseconds. When
   * omitted, the duration is derived from `size`.
   */
  timeout?: number;
  /**
   * Optional override for the M3 motion easing token. When omitted,
   * the easing is derived from `variant` (fade -> standard, others ->
   * emphasized).
   */
  easing?:
    | "standard"
    | "emphasized"
    | "emphasized-decelerate"
    | "emphasized-accelerate";
  /** Disabled wash + aria-disabled. */
  disabled?: boolean;
  /** Selected fill (M3 secondary-container). */
  selected?: boolean;
  /** Error treatment (error-container fill + aria-invalid). */
  error?: boolean;
  /** Optional label slot — renders inline above the children. */
  label?: ReactNode;
  /** Optional leading icon rendered alongside the label slot. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the label slot. */
  trailingIcon?: ReactNode;
  /** Optional fallback rendered while `in` is false (and content is
   *  unmounted). */
  fallback?: ReactNode;
  /** Body content the transition wraps. */
  children?: ReactNode;
  /** Fires once the enter animation completes. */
  onEntered?: () => void;
  /** Fires once the exit animation completes. */
  onExited?: () => void;
  /** Forwarded ref. */
  ref?: Ref<HTMLDivElement>;
}
