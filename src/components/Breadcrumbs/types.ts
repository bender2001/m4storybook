import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

/**
 * Breadcrumbs is a MUI navigation component without an M3-Expressive
 * spec, so it is re-skinned with M3 tokens — surface roles for the
 * crumb pill, primary for link affordance, secondary-container for the
 * current page, M3 type scale for the labels, and emphasized motion
 * tokens for hover/focus state-layers.
 *
 * Variants control the *crumb host* treatment (the link / pill that
 * paints the underlying state layer):
 *
 *   - text      : transparent host. Resting paints `primary` (links)
 *                 or `on-surface` (current). MUI default.
 *   - filled    : `surface-container-highest` host with `on-surface`.
 *   - tonal     : `secondary-container` host.
 *   - outlined  : transparent host with a 1dp `outline-variant` border.
 *   - elevated  : `surface-container-low` host + elevation-1.
 */
export type BreadcrumbsVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. The MUI default reads as `md`; we expose three densities so
 * Breadcrumbs can sit inside compact toolbars (`sm`) or hero shells
 * (`lg`). Heights and label typography step in lockstep with the M3
 * type scale (label-l / label-m / title-s).
 */
export type BreadcrumbsSize = "sm" | "md" | "lg";

/**
 * Corner shape scale. Resting default is `full` (pill) so the host
 * reads as an M3 surface chip; layout shells that prefer a rectangular
 * crumb can fall back through the rest of the M3 shape scale.
 */
export type BreadcrumbsShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** A single breadcrumb item. Mirrors MUI's anchor contract. */
export interface BreadcrumbsItem {
  /** Stable identity. Used as the React key + click event payload. */
  id: string;
  /** Crumb body. Typically a string but may include inline ReactNodes. */
  label: ReactNode;
  /** Optional href. Omit (or set to `undefined`) on the current page. */
  href?: string;
  /** Optional anchor target — passed through to the underlying `<a>`. */
  target?: string;
  /** Optional rel — passed through. Defaults to `noopener` for `_blank`. */
  rel?: string;
  /** Disables the crumb (no pointer events, dimmed to opacity 0.38). */
  disabled?: boolean;
  /** Optional 18dp leading icon glyph. */
  icon?: ReactNode;
  /** Optional 18dp trailing icon glyph. */
  trailingIcon?: ReactNode;
  /** Aria-label override (defaults to label string). */
  "aria-label"?: string;
}

/** Mouse + keyboard activation events surfaced to consumers. */
export type BreadcrumbsItemEvent =
  | MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  | KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>;

type BreadcrumbsOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "items"
  | "separator"
  | "maxItems"
  | "itemsBeforeCollapse"
  | "itemsAfterCollapse"
  | "expandText"
  | "onItemClick"
  | "currentId"
  | "error"
  | "disabled";

export interface BreadcrumbsProps
  extends Omit<HTMLAttributes<HTMLElement>, BreadcrumbsOwnKey> {
  variant?: BreadcrumbsVariant;
  size?: BreadcrumbsSize;
  shape?: BreadcrumbsShape;
  /** Trail of crumbs, ordered root → current. Required. */
  items: BreadcrumbsItem[];
  /**
   * Visual separator between crumbs. Accepts a string ("/", "›") or a
   * ReactNode (icon). Defaults to a 16dp chevron glyph painted in
   * `on-surface-variant`.
   */
  separator?: ReactNode;
  /**
   * Collapse the trail when it exceeds this many crumbs. Mirrors MUI's
   * `maxItems` prop. Set to `Infinity` (or a large number) to disable.
   */
  maxItems?: number;
  /** Crumbs visible before the ellipsis when collapsed. Default 1. */
  itemsBeforeCollapse?: number;
  /** Crumbs visible after the ellipsis when collapsed. Default 1. */
  itemsAfterCollapse?: number;
  /** Aria-label for the expand button. Defaults to "Show path". */
  expandText?: string;
  /** Force-mark a crumb as the current page (defaults to last item). */
  currentId?: string;
  /** Paints every crumb in the M3 error-container surface. */
  error?: boolean;
  /** Disables the entire trail (dims to opacity 0.38). */
  disabled?: boolean;
  /** Fires when an interactive crumb is activated. */
  onItemClick?: (item: BreadcrumbsItem, event: BreadcrumbsItemEvent) => void;
}
