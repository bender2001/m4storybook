import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  stickyHeaderClasses,
  variantClasses,
} from "./anatomy";
import type {
  DataGridColumn,
  DataGridProps,
  DataGridRowState,
  DataGridShape,
  DataGridSize,
  DataGridSortDirection,
  DataGridVariant,
} from "./types";

export type {
  DataGridColumn,
  DataGridProps,
  DataGridRowState,
  DataGridSelectionMode,
  DataGridShape,
  DataGridSize,
  DataGridSortDirection,
  DataGridVariant,
} from "./types";

/**
 * M3-tokenized DataGrid.
 *
 * Re-skins MUI X's `<DataGrid />` (https://mui.com/x/react-data-grid/)
 * onto M3 tokens — Material 3 has no formal Data Grid spec, so this
 * follows the "MUI fallback" rule from the project spec.
 *
 *   - 5 variants     : filled / tonal / outlined / text / elevated
 *   - 3 sizes        : 36 / 52 / 72 dp row heights (M3 density scale)
 *   - 7 shapes       : full M3 corner scale on the wrapper + cursor
 *   - WAI-ARIA       : `role="grid"` + `role="row"` +
 *                      `role="columnheader"` + `role="gridcell"` +
 *                      `aria-sort` on sortable headers + `aria-selected`
 *                      on selected rows + `aria-rowcount` /
 *                      `aria-colcount` on the host
 *   - Motion         : selection cursor slides between rows via shared
 *                      `layoutId` + springs.springy; sort caret rotates
 *                      via standard easing; collapses under reduced motion
 *   - Keyboard       : ArrowUp/Down move row focus; Home/End jump to
 *                      first/last row; Enter/Space toggle selection on
 *                      the focused row
 */
function DataGridInner<T extends Record<string, unknown>>(
  {
    columns,
    rows,
    variant = "filled",
    size = "md",
    shape = "md",
    ariaLabel,
    rowKey,
    selectedRowKeys,
    defaultSelectedRowKeys,
    onSelectionChange,
    selectionMode = "single",
    sortKey,
    sortDirection = "none",
    onSortChange,
    disabledRowKeys,
    errorRowKeys,
    disabled = false,
    stickyHeader = false,
    showCheckboxes = false,
    className,
    ...rest
  }: DataGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const reduced = useReducedMotion();
  const reactId = useId();
  const gridId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");

  const isControlled = selectedRowKeys !== undefined;
  const [uncontrolledKeys, setUncontrolledKeys] = useState<string[]>(
    () => defaultSelectedRowKeys ?? [],
  );
  const selected = isControlled
    ? (selectedRowKeys as string[])
    : uncontrolledKeys;

  const variantStyles = variantClasses[variant];

  const resolveKey = useCallback(
    (row: T, index: number): string =>
      rowKey ? rowKey(row, index) : String(index),
    [rowKey],
  );

  const indexedRows = useMemo(
    () => rows.map((row, index) => ({ row, index, key: resolveKey(row, index) })),
    [rows, resolveKey],
  );

  const disabledSet = useMemo(
    () => new Set(disabledRowKeys ?? []),
    [disabledRowKeys],
  );
  const errorSet = useMemo(
    () => new Set(errorRowKeys ?? []),
    [errorRowKeys],
  );

  const reachable = useMemo(
    () =>
      indexedRows
        .filter(({ key }) => !disabledSet.has(key))
        .map(({ key }) => key),
    [indexedRows, disabledSet],
  );

  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  useEffect(() => {
    if (focusedKey == null && reachable.length > 0) {
      const fromSelection = selected.find((k) => reachable.includes(k));
      setFocusedKey(fromSelection ?? reachable[0]);
    } else if (focusedKey != null && !reachable.includes(focusedKey)) {
      setFocusedKey(reachable[0] ?? null);
    }
  }, [focusedKey, reachable, selected]);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setRowRef = useCallback(
    (key: string, node: HTMLDivElement | null) => {
      rowRefs.current[key] = node;
    },
    [],
  );

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      if (reachable.length === 0) return;
      const current = focusedKey ?? reachable[0];
      const idx = reachable.indexOf(current);
      const nextIdx = (idx + delta + reachable.length) % reachable.length;
      const nextKey = reachable[nextIdx];
      setFocusedKey(nextKey);
      rowRefs.current[nextKey]?.focus({ preventScroll: true });
    },
    [focusedKey, reachable],
  );

  const focusByKey = useCallback((key: string) => {
    setFocusedKey(key);
    rowRefs.current[key]?.focus({ preventScroll: true });
  }, []);

  const commitSelection = useCallback(
    (next: string[]) => {
      if (!isControlled) setUncontrolledKeys(next);
      onSelectionChange?.(next);
    },
    [isControlled, onSelectionChange],
  );

  const toggleSelection = useCallback(
    (key: string) => {
      if (selectionMode === "none") return;
      if (disabledSet.has(key)) return;
      if (selectionMode === "single") {
        commitSelection(selected.includes(key) ? [] : [key]);
        return;
      }
      const next = selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key];
      commitSelection(next);
    },
    [commitSelection, disabledSet, selected, selectionMode],
  );

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, key: string) => {
      if (disabled) return;
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveFocus(1);
          return;
        case "ArrowUp":
          event.preventDefault();
          moveFocus(-1);
          return;
        case "Home":
          event.preventDefault();
          if (reachable[0]) focusByKey(reachable[0]);
          return;
        case "End": {
          event.preventDefault();
          const last = reachable[reachable.length - 1];
          if (last) focusByKey(last);
          return;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          toggleSelection(key);
          return;
        default:
          return;
      }
    },
    [disabled, focusByKey, moveFocus, reachable, toggleSelection],
  );

  const handleSortToggle = useCallback(
    (column: DataGridColumn<T>) => {
      if (!column.sortable || !onSortChange) return;
      const next: DataGridSortDirection =
        sortKey === column.key && sortDirection === "asc" ? "desc" : "asc";
      onSortChange(column.key, next);
    },
    [onSortChange, sortDirection, sortKey],
  );

  return (
    <motion.div
      ref={ref}
      data-component="data-grid"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled || undefined}
      data-sticky-header={stickyHeader || undefined}
      className={cn(
        anatomy.wrapper,
        variantStyles.wrapper,
        shapeClasses[shape],
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      <div
        role="grid"
        data-component="data-grid-grid"
        aria-label={ariaLabel}
        aria-rowcount={rows.length + 1}
        aria-colcount={columns.length + (showCheckboxes ? 1 : 0)}
        aria-disabled={disabled || undefined}
        className={cn(anatomy.grid)}
      >
        <HeaderRow
          columns={columns}
          size={size}
          showCheckboxes={showCheckboxes}
          stickyHeader={stickyHeader}
          variant={variant}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortToggle={handleSortToggle}
          allSelected={
            selectionMode === "multiple" &&
            reachable.length > 0 &&
            reachable.every((k) => selected.includes(k))
          }
          onToggleAll={() => {
            if (selectionMode !== "multiple") return;
            const everyReachableSelected = reachable.every((k) =>
              selected.includes(k),
            );
            commitSelection(everyReachableSelected ? [] : reachable);
          }}
        />

        {indexedRows.length === 0 ? (
          <div role="row" className={anatomy.empty}>
            <span role="gridcell">No rows</span>
          </div>
        ) : null}

        {indexedRows.map(({ row, index, key }) => {
          const isSelected = selected.includes(key);
          const isDisabled = disabledSet.has(key) || disabled;
          const isError = errorSet.has(key);
          const isFocused = focusedKey === key;
          const interactive = selectionMode !== "none" && !isDisabled;
          const state = resolveRowState({
            isSelected,
            isDisabled,
            isError,
          });
          return (
            <BodyRow
              key={key}
              registerRef={setRowRef}
              rowKey={key}
              gridId={gridId}
              rowIndex={index}
              row={row}
              columns={columns}
              size={size}
              shape={shape}
              variant={variant}
              isSelected={isSelected}
              isDisabled={isDisabled}
              isError={isError}
              isFocused={isFocused}
              interactive={interactive}
              showCheckboxes={showCheckboxes}
              selectionMode={selectionMode}
              reduced={Boolean(reduced)}
              state={state}
              onActivate={() => toggleSelection(key)}
              onFocus={() => {
                if (interactive) setFocusedKey(key);
              }}
              onKeyDown={(event) => handleRowKeyDown(event, key)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

interface HeaderRowProps<T> {
  columns: DataGridColumn<T>[];
  size: DataGridSize;
  showCheckboxes: boolean;
  stickyHeader: boolean;
  variant: DataGridVariant;
  sortKey?: string;
  sortDirection: DataGridSortDirection;
  onSortToggle: (column: DataGridColumn<T>) => void;
  allSelected: boolean;
  onToggleAll: () => void;
}

function HeaderRow<T>({
  columns,
  size,
  showCheckboxes,
  stickyHeader,
  variant,
  sortKey,
  sortDirection,
  onSortToggle,
  allSelected,
  onToggleAll,
}: HeaderRowProps<T>) {
  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];
  return (
    <div
      role="row"
      data-component="data-grid-header"
      aria-rowindex={1}
      className={cn(
        anatomy.row,
        sizes.headerHeight,
        anatomy.headerRowDivider,
        stickyHeader && stickyHeaderClasses,
      )}
    >
      {showCheckboxes ? (
        <div
          role="columnheader"
          data-component="data-grid-cell"
          data-header="select-all"
          aria-colindex={1}
          className={cn(anatomy.checkboxCell, sizes.headerHeight)}
        >
          <button
            type="button"
            data-slot="data-grid-select-all"
            aria-checked={allSelected}
            aria-label={allSelected ? "Deselect all rows" : "Select all rows"}
            role="checkbox"
            onClick={onToggleAll}
            className={cn(
              anatomy.checkboxBox,
              allSelected && anatomy.checkboxChecked,
            )}
          >
            {allSelected ? (
              <span aria-hidden className={anatomy.checkboxGlyph}>
                <CheckIcon />
              </span>
            ) : null}
          </button>
        </div>
      ) : null}

      {columns.map((column, columnIndex) => {
        const isActive = sortKey === column.key && column.sortable;
        const dir: DataGridSortDirection = isActive ? sortDirection : "none";
        const widthStyle: CSSProperties | undefined = column.width
          ? { width: column.width, flex: "0 0 auto" }
          : { flex: 1 };
        const ariaSort: "ascending" | "descending" | "none" | undefined =
          column.sortable
            ? dir === "asc"
              ? "ascending"
              : dir === "desc"
                ? "descending"
                : "none"
            : undefined;
        return (
          <div
            key={column.key}
            role="columnheader"
            data-component="data-grid-cell"
            data-header=""
            data-key={column.key}
            data-sortable={column.sortable || undefined}
            data-sort-direction={column.sortable ? dir : undefined}
            data-numeric={column.numeric || undefined}
            aria-sort={ariaSort}
            aria-colindex={columnIndex + (showCheckboxes ? 2 : 1)}
            className={cn(
              anatomy.cell,
              anatomy.cellHeader,
              sizes.headerPadding,
              column.numeric && anatomy.cellNumeric,
            )}
            style={widthStyle}
          >
            {column.sortable ? (
              <button
                type="button"
                data-slot="sort-button"
                data-sort-direction={dir}
                aria-label={
                  dir === "asc"
                    ? "Sorted ascending. Activate to sort descending."
                    : dir === "desc"
                      ? "Sorted descending. Activate to sort ascending."
                      : "Activate to sort ascending."
                }
                onClick={() => onSortToggle(column)}
                className={cn(
                  anatomy.sortButton,
                  isActive && variantStyles.sortActive,
                )}
              >
                {column.headerIcon ? (
                  <span
                    aria-hidden
                    data-slot="header-icon"
                    className={anatomy.headerIcon}
                  >
                    {column.headerIcon}
                  </span>
                ) : null}
                <span data-slot="header-label">{column.label}</span>
                <SortCaret direction={dir} />
              </button>
            ) : (
              <span
                data-slot="header-content"
                className="inline-flex items-center gap-1"
              >
                {column.headerIcon ? (
                  <span
                    aria-hidden
                    data-slot="header-icon"
                    className={anatomy.headerIcon}
                  >
                    {column.headerIcon}
                  </span>
                ) : null}
                <span data-slot="header-label">{column.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface BodyRowProps<T> {
  registerRef: (key: string, node: HTMLDivElement | null) => void;
  rowKey: string;
  gridId: string;
  rowIndex: number;
  row: T;
  columns: DataGridColumn<T>[];
  size: DataGridSize;
  shape: DataGridShape;
  variant: DataGridVariant;
  isSelected: boolean;
  isDisabled: boolean;
  isError: boolean;
  isFocused: boolean;
  interactive: boolean;
  showCheckboxes: boolean;
  selectionMode: "none" | "single" | "multiple";
  reduced: boolean;
  state: DataGridRowState;
  onActivate: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

function BodyRow<T>({
  registerRef,
  rowKey: key,
  gridId,
  rowIndex,
  row,
  columns,
  size,
  shape,
  variant,
  isSelected,
  isDisabled,
  isError,
  isFocused,
  interactive,
  showCheckboxes,
  selectionMode,
  reduced,
  state,
  onActivate,
  onFocus,
  onKeyDown,
}: BodyRowProps<T>) {
  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const stateLayer =
    !interactive
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

  const showCursor = isFocused && interactive;

  return (
    <div
      ref={(node) => registerRef(key, node)}
      role="row"
      data-component="data-grid-row"
      data-key={key}
      data-row-index={rowIndex}
      data-state={state}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-error={isError || undefined}
      data-focused={isFocused || undefined}
      aria-rowindex={rowIndex + 2}
      aria-selected={interactive ? isSelected : undefined}
      aria-disabled={isDisabled || undefined}
      tabIndex={!interactive ? -1 : isFocused ? 0 : -1}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => {
        if (interactive) setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onFocus={() => {
        setFocused(true);
        onFocus();
      }}
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={onKeyDown}
      className={cn(
        anatomy.row,
        sizes.rowHeight,
        anatomy.rowBodyDivider,
        interactive && anatomy.rowInteractive,
        isDisabled && anatomy.rowDisabled,
        isSelected
          ? anatomy.rowSelected
          : isError
            ? anatomy.rowError
            : "text-on-surface",
      )}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.stateLayer, "bg-on-surface")}
        style={{ opacity: stateLayer }}
      />

      {showCursor ? (
        <motion.span
          layout
          layoutId={`data-grid-cursor-${gridId}`}
          aria-hidden
          data-slot="data-grid-cursor"
          data-shape={shape}
          className={cn(
            anatomy.cursor,
            variantStyles.cursor,
            shapeClasses[shape],
          )}
          transition={
            reduced
              ? { duration: 0 }
              : { ...springs.springy, layout: springs.springy }
          }
        />
      ) : null}

      {showCheckboxes ? (
        <div
          role="gridcell"
          data-component="data-grid-cell"
          data-key="select"
          aria-colindex={1}
          className={cn(anatomy.checkboxCell, sizes.rowHeight)}
        >
          {selectionMode === "multiple" || selectionMode === "single" ? (
            <span
              data-slot="row-checkbox"
              aria-hidden
              className={cn(
                anatomy.checkboxBox,
                isSelected && anatomy.checkboxChecked,
              )}
            >
              {isSelected ? (
                <span aria-hidden className={anatomy.checkboxGlyph}>
                  <CheckIcon />
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      ) : null}

      {columns.map((column, columnIndex) => {
        const widthStyle: CSSProperties | undefined = column.width
          ? { width: column.width, flex: "0 0 auto" }
          : { flex: 1 };
        return (
          <div
            key={column.key}
            role="gridcell"
            data-component="data-grid-cell"
            data-key={column.key}
            data-numeric={column.numeric || undefined}
            aria-colindex={columnIndex + (showCheckboxes ? 2 : 1)}
            className={cn(
              anatomy.cell,
              anatomy.cellBody,
              sizes.bodyType,
              sizes.cellPadding,
              column.numeric && anatomy.cellNumeric,
            )}
            style={widthStyle}
          >
            <span data-slot="cell-content" className="relative z-[1] truncate">
              {renderCell(column, row, rowIndex)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function renderCell<T>(
  column: DataGridColumn<T>,
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

function resolveRowState({
  isSelected,
  isDisabled,
  isError,
}: {
  isSelected: boolean;
  isDisabled: boolean;
  isError: boolean;
}): DataGridRowState {
  if (isDisabled) return "disabled";
  if (isError) return "error";
  if (isSelected) return "selected";
  return "default";
}

function SortCaret({ direction }: { direction: DataGridSortDirection }) {
  const opacity = direction === "none" ? 0.38 : 1;
  const rotate = direction === "desc" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <span
      aria-hidden
      data-slot="sort-caret"
      className={anatomy.sortIcon}
      style={{ opacity, transform: rotate }}
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

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="currentColor"
    >
      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z" />
    </svg>
  );
}

export const DataGrid = forwardRef(DataGridInner) as <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  props: DataGridProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof DataGridInner>;
