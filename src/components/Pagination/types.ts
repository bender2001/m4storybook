import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Pagination.
 *
 * MUI's `<Pagination />` has no Material 3 spec, so the surface is
 * re-skinned onto M3 tokens: page entries paint as M3 squircle
 * icon-buttons (shape-full rest -> shape-md selected, per the
 * Expressive shape-morph behaviour shared with `<IconButton>` /
 * navigation rails). State-layer opacities follow M3:
 *
 *   - hover    : 0.08 of the current foreground role
 *   - focus    : 0.10
 *   - pressed  : 0.10
 *   - dragged  : 0.16  (unused here)
 *
 * Selected page paints `secondary-container` + `on-secondary-container`
 * (the same role pair M3 uses for selected nav items / chips) and
 * lifts the squircle morph; navigation arrows ride the foreground role
 * of the current variant.
 */

/**
 * Surface variants. Default is `text`: transparent host, page items
 * pick up `surface-container-highest` only when selected. The other
 * variants give the host a paintable surface so it can sit on top of
 * dark/colored content without losing contrast.
 *
 *   - text     : transparent host, surface-container-highest selection
 *   - filled   : `surface-container-highest` host
 *   - tonal    : `secondary-container` host
 *   - outlined : transparent host + 1dp `outline-variant` border
 *   - elevated : `surface-container` host + elevation-1 shadow
 */
export type PaginationVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Page entries follow the M3 icon-button heights:
 *
 *   sm : 32dp item / label-m type / 4dp gap
 *   md : 40dp item / label-l type / 6dp gap   (M3 default)
 *   lg : 56dp item / label-l type / 8dp gap
 */
export type PaginationSize = "sm" | "md" | "lg";

/** M3 corner shape token applied to the host. */
export type PaginationShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Page entry in the rendered list. */
export interface PaginationItem {
  /** Render type. `page` is a numbered button; controls navigate. */
  kind:
    | "page"
    | "previous"
    | "next"
    | "first"
    | "last"
    | "start-ellipsis"
    | "end-ellipsis";
  /** 1-based page index for `page` items, omitted for ellipses. */
  page: number | null;
  /** True when the page equals the current selection. */
  selected: boolean;
  /** True when the entry is disabled (paged out / disabled prop). */
  disabled: boolean;
  /** Stable React key. */
  key: string;
}

type PaginationOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "count"
  | "page"
  | "defaultPage"
  | "siblingCount"
  | "boundaryCount"
  | "showFirstButton"
  | "showLastButton"
  | "hidePrevButton"
  | "hideNextButton"
  | "disabled"
  | "error"
  | "renderItem"
  | "getItemAriaLabel"
  | "onChange"
  | "previousIcon"
  | "nextIcon"
  | "firstIcon"
  | "lastIcon"
  | "ellipsisIcon";

export interface PaginationProps
  extends Omit<HTMLMotionProps<"nav">, PaginationOwnKey> {
  variant?: PaginationVariant;
  size?: PaginationSize;
  shape?: PaginationShape;
  /** Total number of pages. */
  count: number;
  /** Controlled current page (1-based). */
  page?: number;
  /** Initial page when uncontrolled. Defaults to 1. */
  defaultPage?: number;
  /** Pages displayed each side of the current page. Defaults to 1. */
  siblingCount?: number;
  /** Pages always pinned at start + end. Defaults to 1. */
  boundaryCount?: number;
  /** Render an explicit "first" jump button. */
  showFirstButton?: boolean;
  /** Render an explicit "last" jump button. */
  showLastButton?: boolean;
  /** Hide the "previous" arrow. */
  hidePrevButton?: boolean;
  /** Hide the "next" arrow. */
  hideNextButton?: boolean;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container. */
  error?: boolean;
  /** Slot: previous-arrow icon. */
  previousIcon?: ReactNode;
  /** Slot: next-arrow icon. */
  nextIcon?: ReactNode;
  /** Slot: first-page icon. */
  firstIcon?: ReactNode;
  /** Slot: last-page icon. */
  lastIcon?: ReactNode;
  /** Slot: ellipsis icon (defaults to "…"). */
  ellipsisIcon?: ReactNode;
  /** Render-prop hook for total customization of an item. */
  renderItem?: (item: PaginationItem) => ReactNode;
  /** ARIA label factory. */
  getItemAriaLabel?: (item: PaginationItem) => string;
  /** Fires when a page is picked (click / Enter / Space / arrow). */
  onChange?: (event: unknown, page: number) => void;
}
