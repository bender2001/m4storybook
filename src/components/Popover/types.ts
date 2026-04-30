import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * Visual variant. M3 doesn't ship a first-class "Popover" component —
 * Popover is the primitive that powers Menu / Tooltip-rich / Date
 * picker dropdown. The MUI `Popover` API (open prop + anchor +
 * placement + onClose) is preserved and re-skinned onto M3 surface
 * tokens. Variants paint the popover surface five ways:
 *
 *   - standard : surface-container + elevation 2 + shape-xs.
 *                M3 default popover surface (matches the M3 menu spec
 *                at https://m3.material.io/components/menus/specs).
 *   - tonal    : secondary-container + elevation 1.
 *   - outlined : transparent surface + 1dp outline-variant border +
 *                elevation 0.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis
 *                popover that lifts above other surfaces).
 */
export type PopoverVariant =
  | "standard"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Density / max-width preset. Mirrors the M3 menu/popover width band.
 *
 *   - sm : 160px min / 280px max  (compact descriptors / inline pickers)
 *   - md : 200px min / 360px max  (M3 default)
 *   - lg : 280px min / 480px max  (form / list / choice popover)
 */
export type PopoverSize = "sm" | "md" | "lg";

/**
 * Corner shape token. Default = `xs` (4dp) per the M3 menu surface
 * spec; full shape scale is exposed for token bending.
 */
export type PopoverShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Placement of the popover relative to its positioned host. The M3
 * spec describes anchor-aligned popovers — start/end suffixes pin the
 * cross-axis edge to the matching edge of the host so the popover
 * tracks an anchor regardless of viewport.
 *
 *   - top-start | top | top-end          (above the host)
 *   - bottom-start | bottom | bottom-end (below the host, M3 default)
 *   - left-start | left | left-end       (start side)
 *   - right-start | right | right-end    (end side)
 *   - center                             (over the host, dialog-style)
 */
export type PopoverPlacement =
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
export type PopoverDismissSource = "escape" | "scrim" | "click-away";

type PopoverOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "placement"
  | "open"
  | "offset"
  | "title"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "actions"
  | "scrim"
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
  | "children";

export interface PopoverProps
  extends Omit<HTMLMotionProps<"div">, "ref" | PopoverOwnKey> {
  /** Visual variant. Default `standard` (M3 menu/popover surface). */
  variant?: PopoverVariant;
  /** Density / max-width preset. Default `md`. */
  size?: PopoverSize;
  /** Corner shape token. Default `xs` (4dp per M3 menu surface). */
  shape?: PopoverShape;
  /** Anchor-relative placement. Default `bottom-start`. */
  placement?: PopoverPlacement;
  /**
   * Pixel gap between the popover edge and the host edge along the
   * primary placement axis. Default 8 (M3 menu vertical spacing token).
   */
  offset?: number;
  /**
   * Controlled visibility. When false, the popover is animated out via
   * AnimatePresence (opacity + scale, M3 emphasized tween). Defaults
   * to true so the component is renderable without state in stories.
   */
  open?: boolean;
  /**
   * Optional headline. Renders typeset title-m in the popover header
   * row above the body slot.
   */
  title?: ReactNode;
  /**
   * Optional label slot rendered alongside the leading/trailing icons
   * in the header row when no title is supplied.
   */
  label?: ReactNode;
  /** Leading icon slot — rendered to the start of the header row. */
  leadingIcon?: ReactNode;
  /** Trailing icon slot — rendered to the end of the header row. */
  trailingIcon?: ReactNode;
  /** Trailing action row — typically a row of buttons. */
  actions?: ReactNode;
  /**
   * Render the scrim under the popover. Defaults to false (popovers
   * are non-modal). Set true for modal popover flows (e.g. mobile
   * full-screen menu surface).
   */
  scrim?: boolean;
  /**
   * Render the popover with `position: absolute` so it fills its
   * nearest positioned ancestor. Default true so popovers in stories
   * stay scoped to the story canvas. Set false to anchor on the
   * viewport via `position: fixed`.
   */
  contained?: boolean;
  /** Disable interaction (no click handler, dimmed to 0.38 opacity). */
  disabled?: boolean;
  /** Marks the popover as selected (M3 secondary-container fill + aria). */
  selected?: boolean;
  /** Error treatment: paints the host in error-container. */
  error?: boolean;
  /** Skip the Escape-to-close keybind. Default false. */
  dismissOnEscape?: boolean;
  /** Skip click-outside-to-close. Default true (matches MUI). */
  dismissOnClickAway?: boolean;
  /**
   * Fires when the user dismisses the popover. Mirrors MUI's
   * `onClose`. When omitted the popover stays open under
   * Escape / click-away.
   */
  onClose?: () => void;
  /**
   * Fires alongside `onClose` and disambiguates the dismissal source.
   */
  onDismiss?: (source: PopoverDismissSource) => void;
  /** Aliased `aria-label` for the popover surface. */
  ariaLabel?: string;
  /** Aliased `aria-labelledby`. Falls back to the auto-generated title id. */
  ariaLabelledBy?: string;
  /** Aliased `aria-describedby`. */
  ariaDescribedBy?: string;
  /**
   * Body content. Renders below the optional header row and above the
   * trailing actions row.
   */
  children?: ReactNode;
}
