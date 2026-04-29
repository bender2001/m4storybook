import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  sizeClasses,
  stickyHeaderClasses,
  variantClasses,
} from "./anatomy";
import type {
  SortDirection,
  TableCellProps,
  TableColumn,
  TableProps,
  TableRowProps,
  TableSectionProps,
  TableSize,
  TableVariant,
} from "./types";

export type {
  SortDirection,
  TableCellProps,
  TableColumn,
  TableProps,
  TableRowProps,
  TableSectionProps,
  TableSize,
  TableVariant,
} from "./types";

interface TableContextValue {
  variant: TableVariant;
  size: TableSize;
  stickyHeader: boolean;
}

const TableContext = createContext<TableContextValue>({
  variant: "standard",
  size: "md",
  stickyHeader: false,
});

type Section = "head" | "body" | "foot";

const TableSectionContext = createContext<Section>("body");

interface RowStateValue {
  interactive: boolean;
  selected: boolean;
  disabled: boolean;
  stateLayer: number;
}

const RowStateContext = createContext<RowStateValue>({
  interactive: false,
  selected: false,
  disabled: false,
  stateLayer: 0,
});

/**
 * `<Table>` — M3 expressive data table. M3 has no formal Table spec;
 * this re-skins the MUI/HTML data-table pattern with M3 tokens.
 *
 * Two API modes:
 *  1. Controlled data — pass `columns` + `rows` and the table renders
 *     a thead + tbody for you. Sortable headers + selected-row
 *     highlight come for free.
 *  2. Composition — pass `<TableHead>` / `<TableBody>` / `<TableRow>` /
 *     `<TableCell>` as children for fully-custom layouts.
 */
function TableInner<T extends Record<string, unknown>>(
  props: TableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>,
) {
  const {
    variant = "standard",
    size = "md",
    stickyHeader = false,
    columns,
    rows,
    caption,
    sortKey,
    sortDirection = "none",
    onSortChange,
    rowKey,
    selectedRowKeys,
    className,
    children,
    ...rest
  } = props;

  const ctx: TableContextValue = { variant, size, stickyHeader };
  const wrapperClass = cn(anatomy.wrapper, variantClasses[variant].wrapper);

  const computeSelected = useCallback(
    (key: string) =>
      Array.isArray(selectedRowKeys) ? selectedRowKeys.includes(key) : false,
    [selectedRowKeys],
  );

  const handleSort = useCallback(
    (key: string) => {
      if (!onSortChange) return;
      const next: SortDirection =
        sortKey === key && sortDirection === "asc" ? "desc" : "asc";
      onSortChange(key, next);
    },
    [onSortChange, sortDirection, sortKey],
  );

  const dataMode = Array.isArray(columns) && Array.isArray(rows);

  const renderedBody = dataMode ? (
    <>
      <TableHead>
        <TableRow>
          {columns!.map((column) => {
            const isActive = sortKey === column.key;
            const dir: SortDirection = isActive ? sortDirection : "none";
            return (
              <TableCell
                key={column.key}
                header
                numeric={column.numeric}
                sortable={column.sortable}
                sortDirection={dir}
                onSortToggle={() => handleSort(column.key)}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </TableCell>
            );
          })}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows!.map((row, index) => {
          const key = rowKey ? rowKey(row, index) : String(index);
          const selected = computeSelected(key);
          return (
            <TableRow key={key} selected={selected}>
              {columns!.map((column) => (
                <TableCell key={column.key} numeric={column.numeric}>
                  {renderColumnCell(column, row, index)}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </>
  ) : (
    children
  );

  return (
    <TableContext.Provider value={ctx}>
      <div
        className={wrapperClass}
        data-component="table-wrapper"
        data-variant={variant}
        data-size={size}
        data-sticky-header={stickyHeader || undefined}
      >
        <table
          ref={ref}
          data-component="table"
          data-variant={variant}
          data-size={size}
          className={cn(anatomy.root, className)}
          {...rest}
        >
          {caption ? <caption className={anatomy.caption}>{caption}</caption> : null}
          {renderedBody}
        </table>
      </div>
    </TableContext.Provider>
  );
}

function renderColumnCell<T>(
  column: TableColumn<T>,
  row: T,
  index: number,
): ReactNode {
  if (column.render) return column.render(row, index);
  const value = (row as Record<string, unknown>)[column.key];
  if (value == null) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return value as ReactNode;
}

export const Table = forwardRef(TableInner) as <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  props: TableProps<T> & { ref?: React.Ref<HTMLTableElement> },
) => ReturnType<typeof TableInner>;

export const TableHead = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableHead({ className, children, ...rest }, ref) {
    return (
      <TableSectionContext.Provider value="head">
        <thead
          ref={ref}
          data-component="table-head"
          className={cn(anatomy.thead, className)}
          {...rest}
        >
          {children}
        </thead>
      </TableSectionContext.Provider>
    );
  },
);

export const TableBody = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableBody({ className, children, ...rest }, ref) {
    return (
      <TableSectionContext.Provider value="body">
        <tbody
          ref={ref}
          data-component="table-body"
          className={cn(anatomy.tbody, className)}
          {...rest}
        >
          {children}
        </tbody>
      </TableSectionContext.Provider>
    );
  },
);

export const TableFooter = forwardRef<HTMLTableSectionElement, TableSectionProps>(
  function TableFooter({ className, children, ...rest }, ref) {
    return (
      <TableSectionContext.Provider value="foot">
        <tfoot
          ref={ref}
          data-component="table-foot"
          className={cn(anatomy.tfoot, className)}
          {...rest}
        >
          {children}
        </tfoot>
      </TableSectionContext.Provider>
    );
  },
);

/**
 * `<TableRow>` — single row. Renders as `<tr>`. Selected rows paint
 * the M3 secondary-container fill across all cells. Interactive rows
 * propagate their hover/focus/pressed state to child `<TableCell>`s
 * through context — each cell renders an absolutely-positioned
 * state-layer overlay so the row appears blanketed by the M3
 * state-layer opacity (0.08 hover / 0.10 focus / 0.10 pressed) without
 * inserting non-`<td>` children inside the `<tr>`.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow(
    {
      size: sizeProp,
      selected = false,
      disabled = false,
      interactive = false,
      className,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onFocus,
      onBlur,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useContext(TableContext);
    const section = useContext(TableSectionContext);
    const size = sizeProp ?? ctx.size;
    const sizes = sizeClasses[size];

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const stateLayer =
      !interactive || disabled
        ? 0
        : pressed
          ? stateLayerOpacity.pressed
          : focused
            ? stateLayerOpacity.focus
            : hovered
              ? stateLayerOpacity.hover
              : 0;

    const rowState = useMemo<RowStateValue>(
      () => ({ interactive, selected, disabled, stateLayer }),
      [interactive, selected, disabled, stateLayer],
    );

    const rowBg = selected ? anatomy.rowSelectedBg : "";
    const rowText = selected ? anatomy.rowSelectedText : anatomy.rowDefaultText;

    const rowClass = cn(
      anatomy.row,
      sizes.rowMinHeight,
      rowBg,
      rowText,
      section === "body" && anatomy.rowBodyDivider,
      interactive && anatomy.rowInteractive,
      disabled && anatomy.rowDisabled,
      className,
    );

    return (
      <RowStateContext.Provider value={rowState}>
        <tr
          ref={ref}
          data-component="table-row"
          data-section={section}
          data-size={size}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          data-interactive={interactive || undefined}
          data-state-layer-opacity={stateLayer}
          aria-selected={interactive && selected ? true : undefined}
          aria-disabled={disabled || undefined}
          tabIndex={interactive && !disabled ? 0 : undefined}
          className={rowClass}
          onPointerEnter={(e) => {
            setHovered(true);
            onPointerEnter?.(e);
          }}
          onPointerLeave={(e) => {
            setHovered(false);
            setPressed(false);
            onPointerLeave?.(e);
          }}
          onPointerDown={(e) => {
            if (interactive) setPressed(true);
            onPointerDown?.(e);
          }}
          onPointerUp={(e) => {
            setPressed(false);
            onPointerUp?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setPressed(false);
            onBlur?.(e);
          }}
          {...rest}
        >
          {children}
        </tr>
      </RowStateContext.Provider>
    );
  },
);

/**
 * `<TableCell>` — single cell. Renders as `<th>` when `header` is set
 * or when nested inside `<TableHead>`, else `<td>`. Numeric cells
 * right-align. Sortable headers render an inline button + sort caret
 * affordance and toggle direction on click.
 *
 * Each interactive-row cell paints its own state-layer overlay so the
 * row visually paints at the M3 state-layer opacity tokens.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell(
    {
      size: sizeProp,
      header = false,
      numeric = false,
      sortable = false,
      sortDirection = "none",
      onSortToggle,
      className,
      onClick,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useContext(TableContext);
    const section = useContext(TableSectionContext);
    const rowState = useContext(RowStateContext);
    const size = sizeProp ?? ctx.size;
    const sizes = sizeClasses[size];
    const isHeaderCell = header || section === "head";

    const handleSortClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (!sortable || !onSortToggle) return;
        const next: SortDirection =
          sortDirection === "asc" ? "desc" : "asc";
        onSortToggle(next);
        event.stopPropagation();
      },
      [onSortToggle, sortDirection, sortable],
    );

    const handleSortKey = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!sortable || !onSortToggle) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        const next: SortDirection =
          sortDirection === "asc" ? "desc" : "asc";
        onSortToggle(next);
      },
      [onSortToggle, sortDirection, sortable],
    );

    const cellClass = cn(
      anatomy.cell,
      isHeaderCell ? sizes.headerCellPadding : sizes.cellPadding,
      isHeaderCell ? anatomy.cellHeader : anatomy.cellBody,
      numeric && anatomy.cellNumeric,
      isHeaderCell && ctx.stickyHeader && stickyHeaderClasses,
      className,
    );

    const ariaSort: "ascending" | "descending" | "none" | undefined = sortable
      ? sortDirection === "asc"
        ? "ascending"
        : sortDirection === "desc"
          ? "descending"
          : "none"
      : undefined;

    const sortAffordance = sortable ? (
      <button
        type="button"
        data-slot="sort-button"
        data-sort-direction={sortDirection}
        aria-label={
          sortDirection === "asc"
            ? "Sorted ascending. Activate to sort descending."
            : sortDirection === "desc"
              ? "Sorted descending. Activate to sort ascending."
              : "Activate to sort ascending."
        }
        onClick={handleSortClick}
        onKeyDown={handleSortKey}
        className={anatomy.sortButton}
      >
        <span data-slot="sort-label">{children}</span>
        <SortCaret direction={sortDirection} />
      </button>
    ) : null;

    const stateLayerEl = rowState.interactive ? (
      <span
        aria-hidden
        data-state-layer
        className={anatomy.stateLayer}
        style={{ opacity: rowState.stateLayer }}
      />
    ) : null;

    if (isHeaderCell) {
      const thProps = rest as React.ThHTMLAttributes<HTMLTableCellElement>;
      return (
        <th
          ref={ref}
          scope={thProps.scope ?? "col"}
          aria-sort={ariaSort}
          data-component="table-cell"
          data-header=""
          data-numeric={numeric || undefined}
          data-sortable={sortable || undefined}
          data-sort-direction={sortable ? sortDirection : undefined}
          data-size={size}
          className={cellClass}
          onClick={onClick}
          {...thProps}
        >
          {stateLayerEl}
          <span data-slot="cell-content" className="relative z-[1]">
            {sortable ? sortAffordance : children}
          </span>
        </th>
      );
    }

    const tdProps = rest as React.TdHTMLAttributes<HTMLTableCellElement>;
    return (
      <td
        ref={ref}
        data-component="table-cell"
        data-numeric={numeric || undefined}
        data-size={size}
        className={cellClass}
        onClick={onClick}
        {...tdProps}
      >
        {stateLayerEl}
        <span data-slot="cell-content" className="relative z-[1]">
          {children}
        </span>
      </td>
    );
  },
);

interface SortCaretProps {
  direction: SortDirection;
}

/**
 * Sort caret SVG. Rotates 180° when direction flips ascending →
 * descending, fades when no sort is applied.
 */
function SortCaret({ direction }: SortCaretProps) {
  const opacity = direction === "none" ? 0.38 : 1;
  const rotate = direction === "desc" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <span
      aria-hidden
      data-slot="sort-caret"
      className={anatomy.sortIcon}
      style={{
        opacity,
        transform: rotate,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={16}
        height={16}
        fill="currentColor"
        focusable="false"
      >
        <path d="M7 14l5-5 5 5z" />
      </svg>
    </span>
  );
}

export { TableContext };
