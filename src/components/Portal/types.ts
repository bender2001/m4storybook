import type { HTMLMotionProps } from "motion/react";
import type { ReactNode, RefObject } from "react";

/**
 * Visual variant. Portal is the unstyled MUI primitive
 * (https://mui.com/material-ui/react-portal/) that teleports its
 * children into a target container (defaults to `document.body`).
 * M3 has no first-class portal component, so the slice re-skins the
 * teleported surface onto the M3 modal / surface tokens. Variants
 * paint the portal surface five ways:
 *
 *   - standard : surface-container-highest + elevation 1 + shape-md.
 *                Portal default — sits a step above the page surface
 *                so it visually reads as "lifted out of flow".
 *   - tonal    : secondary-container + elevation 1.
 *   - outlined : transparent surface + 1dp outline-variant border +
 *                elevation 0.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis
 *                portal that lifts above other surfaces).
 */
export type PortalVariant =
  | "standard"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Density preset. Portal hosts general-purpose teleported content
 * (modal panels / hovercards / inline overlays) so the band is wider
 * than Popper / Popover.
 *
 *   - sm : 160px min  / 320px max
 *   - md : 240px min  / 480px max  (default — matches the M3 modal
 *          surface band)
 *   - lg : 320px min  / 640px max
 */
export type PortalSize = "sm" | "md" | "lg";

/**
 * Corner shape token. Default = `md` (12dp) — sits between Popover
 * (xs / 4dp) and the larger M3 dialog surfaces (xl / 28dp). Full
 * shape scale is exposed for token bending.
 */
export type PortalShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Activation source for `onDismiss`. */
export type PortalDismissSource = "escape" | "click-away";

/**
 * Container resolution. Mirrors MUI Portal's `container` prop:
 *   - `HTMLElement`                  — teleport into the node directly
 *   - `RefObject<HTMLElement>`       — teleport into `ref.current`
 *   - `() => HTMLElement | null`     — teleport into the callback's
 *                                      return value (re-evaluated on
 *                                      mount + updates)
 *   - `null` / `undefined`           — defaults to `document.body`
 */
export type PortalContainer =
  | HTMLElement
  | RefObject<HTMLElement | null>
  | (() => HTMLElement | null)
  | null;

type PortalOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "open"
  | "container"
  | "disablePortal"
  | "surface"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
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

export interface PortalProps
  extends Omit<HTMLMotionProps<"div">, "ref" | PortalOwnKey> {
  /** Visual variant. Default `standard` (M3 portal surface). */
  variant?: PortalVariant;
  /** Density / max-width preset. Default `md` (M3 modal band). */
  size?: PortalSize;
  /** Corner shape token. Default `md` (12dp per M3 dialog/portal surface). */
  shape?: PortalShape;
  /**
   * Target container for the portal. Defaults to `document.body` when
   * undefined or null. Mirrors MUI Portal's `container` prop.
   */
  container?: PortalContainer;
  /**
   * Skip the portal teleport and render the surface inline at the
   * mount point (matches MUI Portal's `disablePortal`). Default false.
   */
  disablePortal?: boolean;
  /**
   * Render the M3 surface wrapper. When false, the children are
   * teleported raw — this collapses Portal back to the unstyled MUI
   * primitive. Default true so the M3 reskin is opt-out.
   */
  surface?: boolean;
  /**
   * Controlled visibility. When false, the portal is animated out
   * via AnimatePresence (opacity + scale on the M3 standard tween).
   */
  open?: boolean;
  /** Leading icon slot — rendered to the start of the body row. */
  leadingIcon?: ReactNode;
  /** Trailing icon slot — rendered to the end of the body row. */
  trailingIcon?: ReactNode;
  /**
   * Optional label rendered as a typeset label-l above the body
   * content. When omitted, the body row hosts only `children`.
   */
  label?: ReactNode;
  /** Disable interaction (no click handler, dimmed to 0.38 opacity). */
  disabled?: boolean;
  /** Marks the portal surface as selected (M3 secondary-container fill + aria). */
  selected?: boolean;
  /** Error treatment: paints the surface in error-container. */
  error?: boolean;
  /** Skip the Escape-to-close keybind. Default true. */
  dismissOnEscape?: boolean;
  /** Skip click-outside-to-close. Default false (matches MUI Portal). */
  dismissOnClickAway?: boolean;
  /**
   * Fires when the user dismisses the portal. Mirrors MUI's
   * `onClose`. When omitted the portal stays open under
   * Escape / click-away.
   */
  onClose?: () => void;
  /**
   * Fires alongside `onClose` and disambiguates the dismissal source.
   */
  onDismiss?: (source: PortalDismissSource) => void;
  /** Aliased `aria-label`. */
  ariaLabel?: string;
  /** Aliased `aria-labelledby`. */
  ariaLabelledBy?: string;
  /** Aliased `aria-describedby`. Falls back to the auto-generated body id. */
  ariaDescribedBy?: string;
  /**
   * ARIA role override. Defaults to `presentation` — Portal is a
   * structural utility, not an interactive surface. Pass `dialog` /
   * `region` / `tooltip` for richer roles.
   */
  role?: string;
  /**
   * Body content. Renders below the optional label slot.
   */
  children?: ReactNode;
}
