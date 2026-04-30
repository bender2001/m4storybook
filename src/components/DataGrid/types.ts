import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized DataGrid.
 *
 * Re-skins MUI X's `<DataGrid />` (https://mui.com/x/react-data-grid/)
 * onto M3 tokens — Material 3 has no formal Data Grid spec, so this
 * follows the "MUI fallback" rule from the project spec.
 *
 * The selection cursor (a 3dp leading bar painted in `bg-primary` on
 * the focused row) morphs from `shape-xs` to the selected `shape`
 * token via a shared `layoutId` motion span — the same M3 Expressive
 * selection morph used by Tabs / Stepper / Pagination / Navigation
 * Rail. Selected rows additionally paint `bg-secondary-container`
 * across all cells.
 *
 * State-layer opacities follow M3:
 *
 *   - hover    : 0.08 of the current foreground role
 *   - focus    : 0.10
 *   - pressed  : 0.10
 *   - dragged  : 0.16  (unused here)
 *
 * Motion tokens (from src/tokens/motion.ts):
 *
 *   - Selection cursor slide / shape morph : `springs.springy`
 *   - Sort caret rotation                  : `short4` (200ms) / `standard`
 *   - Row state-layer opacity              : `short4` / `standard`
 */

/**
 * DataGrid paint variant. Drives the host wrapper surface, the column
 * header divider color, and the selection cursor paint.
 *
 *   - filled   : transparent host, primary cursor (default)
 *   - tonal    : `surface-container` host with secondary-container cursor
 *   - outlined : 1dp outline-variant border on the wrapper
 *   - text     : transparent host, no border, primary cursor
 *   - elevated : `surface-container-low` host w/ elevation-1
 */
export type DataGridVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Row density.
 *
 *   - sm : 36dp row / body-s
 *   - md : 52dp row / body-m   (M3 default)
 *   - lg : 72dp row / body-m + larger cell padding
 */
export type DataGridSize = "sm" | "md" | "lg";

/**
 * Wrapper corner shape. The selection cursor (the 3dp leading bar
 * painted on the focused row) morphs from `shape-xs` to this shape.
 */
export type DataGridShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Sort direction tristate. */
export type DataGridSortDirection = "asc" | "desc" | "none";

/** Selection mode. Mirrors MUI X's `rowSelection` prop. */
export type DataGridSelectionMode = "none" | "single" | "multiple";

/**
 * Single column descriptor.
 *
 *   - `key`       : stable column id and React key
 *   - `label`     : header cell content
 *   - `width`     : optional CSS width (string or px number)
 *   - `numeric`   : right-align cell + use tabular-nums
 *   - `sortable`  : render the sort caret affordance in the header
 *   - `render`    : optional cell renderer; defaults to `row[key]`
 *   - `headerIcon`: optional leading icon glyph in the column header
 */
export interface DataGridColumn<T = Record<string, unknown>> {
  key: string;
  label: ReactNode;
  width?: number | string;
  numeric?: boolean;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  headerIcon?: ReactNode;
}

/** Resolved per-row state used for paint + state-layer opacity. */
export type DataGridRowState =
  | "default"
  | "hover"
  | "focus"
  | "pressed"
  | "selected"
  | "disabled"
  | "error";

type DataGridOwnKey =
  | "columns"
  | "rows"
  | "variant"
  | "size"
  | "shape"
  | "ariaLabel"
  | "rowKey"
  | "selectedRowKeys"
  | "defaultSelectedRowKeys"
  | "onSelectionChange"
  | "selectionMode"
  | "sortKey"
  | "sortDirection"
  | "onSortChange"
  | "disabledRowKeys"
  | "errorRowKeys"
  | "disabled"
  | "stickyHeader"
  | "showCheckboxes";

export interface DataGridProps<T = Record<string, unknown>>
  extends Omit<HTMLMotionProps<"div">, DataGridOwnKey> {
  /** Column descriptors in render order. */
  columns: DataGridColumn<T>[];
  /** Row data records. */
  rows: T[];
  /** Paint variant. Defaults to `filled`. */
  variant?: DataGridVariant;
  /** Row density. Defaults to `md`. */
  size?: DataGridSize;
  /** Wrapper + selection cursor shape. Defaults to `md` (M3 squircle). */
  shape?: DataGridShape;
  /** Accessible name for the `role="grid"` host. */
  ariaLabel?: string;
  /**
   * Stable row key extractor. Falls back to the row's index when
   * omitted; explicit keys are required for selection wiring.
   */
  rowKey?: (row: T, index: number) => string;
  /** Controlled selected row keys. */
  selectedRowKeys?: string[];
  /** Initial selected row keys when uncontrolled. */
  defaultSelectedRowKeys?: string[];
  /**
   * Fires whenever the selection changes. The argument is the new
   * full set of selected row keys.
   */
  onSelectionChange?: (next: string[]) => void;
  /** Selection mode. Defaults to `single`. */
  selectionMode?: DataGridSelectionMode;
  /** Active sort column key. */
  sortKey?: string;
  /** Active sort direction. Defaults to `none`. */
  sortDirection?: DataGridSortDirection;
  /**
   * Fires when a sortable header is activated. Returns the next sort
   * direction (always asc/desc — never none).
   */
  onSortChange?: (key: string, dir: DataGridSortDirection) => void;
  /** Row keys rendered in the disabled wash. */
  disabledRowKeys?: string[];
  /** Row keys painted with the M3 error role pair. */
  errorRowKeys?: string[];
  /** Disables the entire grid. */
  disabled?: boolean;
  /** Sticky header row. Header stays anchored when the body scrolls. */
  stickyHeader?: boolean;
  /** Show a leading checkbox affordance per row in `multiple` mode. */
  showCheckboxes?: boolean;
}
