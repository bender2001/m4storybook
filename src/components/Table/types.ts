import type { ReactNode } from "react";

/**
 * M3 Table variants. M3 has no formal Table spec, so we build the
 * MUI-shaped Table re-skinned with M3 tokens (per the spec rule for
 * MUI-only components). Variants control container fill + outline:
 *  - standard : transparent surface (the default), header underlined
 *               with outline-variant.
 *  - filled   : surface-container fill behind the entire table.
 *  - outlined : 1dp outline-variant border around the table with
 *               shape-sm rounding. Mirrors the List outlined variant.
 *  - elevated : surface-container-low fill + elevation-1 shadow.
 */
export type TableVariant = "standard" | "filled" | "outlined" | "elevated";

/**
 * Per-row density. M3 list-row densities scale to: sm = 40dp comfortable
 * data-table row, md = 52dp default M3 list row, lg = 72dp two-line.
 */
export type TableSize = "sm" | "md" | "lg";

/**
 * Sort direction for sortable column headers.
 */
export type SortDirection = "asc" | "desc" | "none";

/**
 * Column descriptor for the controlled `<Table>` data API. Consumers
 * may also compose `<TableHead>` / `<TableRow>` / `<TableCell>` by
 * hand for fully-custom layouts.
 */
export interface TableColumn<T> {
  /** Unique key — also used as the React list key for the column. */
  key: string;
  /** Header label — string or arbitrary node. */
  label: ReactNode;
  /** Right-align numeric columns per the M3 expressive table layout. */
  numeric?: boolean;
  /** Render the cell content. Defaults to (row) => row[key]. */
  render?: (row: T, index: number) => ReactNode;
  /** Mark column as sortable. Header gets a sort affordance + role. */
  sortable?: boolean;
  /** Optional explicit width override (CSS length). */
  width?: string;
}

type TableOwnKey = "variant" | "size" | "children" | "columns" | "rows";

export interface TableProps<T = Record<string, unknown>>
  extends Omit<React.HTMLAttributes<HTMLTableElement>, TableOwnKey> {
  variant?: TableVariant;
  size?: TableSize;
  /** Stick the header to the top of a scrollable viewport. */
  stickyHeader?: boolean;
  /** Column descriptors for the controlled data API. */
  columns?: ReadonlyArray<TableColumn<T>>;
  /** Row data for the controlled data API. */
  rows?: ReadonlyArray<T>;
  /** Caption rendered as a `<caption>` element above the table. */
  caption?: ReactNode;
  /** Currently sorted column key + direction (controlled). */
  sortKey?: string;
  /** Sort direction for the active column. */
  sortDirection?: SortDirection;
  /** Fired when a sortable header is activated. */
  onSortChange?: (key: string, next: SortDirection) => void;
  /** Optional row key extractor — defaults to the row's index. */
  rowKey?: (row: T, index: number) => string;
  /** Set of row keys flagged as selected (highlighted). */
  selectedRowKeys?: ReadonlyArray<string>;
  children?: ReactNode;
}

type TableCellOwnKey =
  | "variant"
  | "size"
  | "header"
  | "numeric"
  | "sortable"
  | "sortDirection"
  | "onSortToggle";

export interface TableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, TableCellOwnKey> {
  /** Per-cell size override; defaults to the parent Table's size. */
  size?: TableSize;
  /** Render as a `<th>` instead of a `<td>`. */
  header?: boolean;
  /** Right-align numeric cells. */
  numeric?: boolean;
  /** Mark a header cell as sortable; adds a button + sort caret. */
  sortable?: boolean;
  /** Active sort direction for sortable headers. */
  sortDirection?: SortDirection;
  /** Toggle handler when the sort button is activated. */
  onSortToggle?: (next: SortDirection) => void;
  children?: ReactNode;
}

export interface TableRowProps
  extends Omit<React.HTMLAttributes<HTMLTableRowElement>, "children"> {
  size?: TableSize;
  /** Selected state — paints secondary-container fill across the row. */
  selected?: boolean;
  /** Disabled state — opacity 0.38, pointer-events disabled. */
  disabled?: boolean;
  /** Hoverable interactive row. Adds the M3 state layer transitions. */
  interactive?: boolean;
  children?: ReactNode;
}

export type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement>;
