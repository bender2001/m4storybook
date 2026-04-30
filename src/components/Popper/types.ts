import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Visual variant. Popper is the unstyled MUI primitive
 * (https://mui.com/material-ui/react-popper/) that powers Tooltip /
 * Autocomplete listbox / Menu positioning. M3 has no first-class
 * popper component, so the slice re-skins the surface onto the M3
 * tooltip / menu surface tokens. Variants paint the popper surface
 * five ways:
 *
 *   - standard : surface-container-high + elevation 2 + shape-sm.
 *                M3 default popper surface (matches the M3 rich
 *                tooltip / menu container at
 *                https://m3.material.io/components/tooltips/specs).
 *   - tonal    : secondary-container + elevation 1.
 *   - outlined : transparent surface + 1dp outline-variant border +
 *                elevation 0.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis
 *                popper that lifts above other surfaces).
 */
export type PopperVariant =
  | "standard"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Density preset. Popper is a lightweight positioning primitive so
 * the band is tighter than Popover (Popper hosts inline copy / lists
 * / hint text rather than full pickers).
 *
 *   - sm : 96px min  / 224px max  (tooltip / hint band, M3 default)
 *   - md : 144px min / 320px max  (rich tooltip / single-column menu)
 *   - lg : 200px min / 400px max  (multi-line description / autocomplete)
 */
export type PopperSize = "sm" | "md" | "lg";

/**
 * Corner shape token. Default = `sm` (8dp) per the M3 tooltip surface
 * spec; full shape scale is exposed for token bending.
 */
export type PopperShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Placement of the popper relative to its positioned host. The MUI
 * popper modifier system supports start / end suffixes — same model
 * is preserved here so the popper anchors to the matching edge.
 *
 *   - top-start | top | top-end          (above the host)
 *   - bottom-start | bottom | bottom-end (below the host, M3 default)
 *   - left-start | left | left-end       (start side)
 *   - right-start | right | right-end    (end side)
 *   - center                             (over the host)
 */
export type PopperPlacement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end"
  | "right-start"
  | "right"
  | "right-end"
  | "center";

/** Activation source for `onDismiss`. */
export type PopperDismissSource = "escape" | "click-away";

type PopperOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "placement"
  | "open"
  | "offset"
  | "arrow"
  | "arrowSize"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "flip"
  | "keepInViewport"
  | "contained"
  | "disabled"
  | "selected"
  | "error"
  | "dismissOnEscape"
  | "dismissOnClickAway"
  | "onClose"
  | "onDismiss"
  | "ariaLabel"
  | "ariaLabelledBy"
  | "ariaDescribedBy"
  | "role"
  | "children";

export interface PopperProps
  extends Omit<HTMLMotionProps<"div">, "ref" | PopperOwnKey> {
  /** Visual variant. Default `standard` (M3 popper surface). */
  variant?: PopperVariant;
  /** Density / max-width preset. Default `sm` (M3 tooltip band). */
  size?: PopperSize;
  /** Corner shape token. Default `sm` (8dp per M3 tooltip surface). */
  shape?: PopperShape;
  /** Anchor-relative placement. Default `bottom`. */
  placement?: PopperPlacement;
  /**
   * Pixel gap between the popper edge and the host edge along the
   * primary placement axis. Default 12 (M3 tooltip vertical spacing).
   */
  offset?: number;
  /**
   * Render the canonical popper arrow caret pointing back at the
   * anchor edge. Default false (matches MUI's opt-in arrow modifier).
   * Center placement suppresses the arrow.
   */
  arrow?: boolean;
  /** Arrow side length in pixels. Default 8. */
  arrowSize?: number;
  /** Leading icon slot — rendered to the start of the body row. */
  leadingIcon?: ReactNode;
  /** Trailing icon slot — rendered to the end of the body row. */
  trailingIcon?: ReactNode;
  /**
   * Optional label rendered as a typeset label-l above the body
   * text. When omitted, the body row hosts only `children`.
   */
  label?: ReactNode;
  /**
   * Controlled visibility. When false, the popper is animated out
   * via AnimatePresence (opacity + scale, M3 standard tween).
   */
  open?: boolean;
  /**
   * Mirrors the popper.js `flip` modifier — popper flips placement
   * when overflowing. We do not actually run popper.js, but the
   * value is reflected via `data-flip` so consumers / tests can
   * observe the modifier choice. Default true.
   */
  flip?: boolean;
  /**
   * Mirrors the popper.js `preventOverflow` modifier — popper
   * shifts along the cross-axis to stay inside the boundary.
   * Reflected via `data-keep-in-viewport`. Default true.
   */
  keepInViewport?: boolean;
  /**
   * Render the popper with `position: absolute` inside the nearest
   * positioned ancestor. Default true so poppers in stories stay
   * scoped. Set false to anchor on the viewport via `position:
   * fixed`. Mirrors MUI's `disablePortal` (when contained the
   * popper does not portal).
   */
  contained?: boolean;
  /** Disable interaction (no click handler, dimmed to 0.38 opacity). */
  disabled?: boolean;
  /** Marks the popper as selected (M3 secondary-container fill + aria). */
  selected?: boolean;
  /** Error treatment: paints the surface in error-container. */
  error?: boolean;
  /** Skip the Escape-to-close keybind. Default true. */
  dismissOnEscape?: boolean;
  /** Skip click-outside-to-close. Default false (matches MUI Popper). */
  dismissOnClickAway?: boolean;
  /**
   * Fires when the user dismisses the popper. Mirrors MUI's
   * `onClose`. When omitted the popper stays open under
   * Escape / click-away.
   */
  onClose?: () => void;
  /**
   * Fires alongside `onClose` and disambiguates the dismissal source.
   */
  onDismiss?: (source: PopperDismissSource) => void;
  /** Aliased `aria-label`. */
  ariaLabel?: string;
  /** Aliased `aria-labelledby`. */
  ariaLabelledBy?: string;
  /** Aliased `aria-describedby`. Falls back to the auto-generated body id. */
  ariaDescribedBy?: string;
  /**
   * ARIA role override. Defaults to `tooltip`, matching MUI Popper's
   * primary use case (tooltip / hint surface). Pass `region` /
   * `dialog` / `menu` for richer surfaces.
   */
  role?: string;
  /**
   * Body content. Renders below the optional label slot.
   */
  children?: ReactNode;
}
