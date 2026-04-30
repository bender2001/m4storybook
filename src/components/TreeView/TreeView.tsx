import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  TreeNode,
  TreeViewItemState,
  TreeViewProps,
  TreeViewShape,
  TreeViewSize,
  TreeViewVariant,
} from "./types";

export type {
  TreeNode,
  TreeViewItemState,
  TreeViewProps,
  TreeViewSelectionMode,
  TreeViewShape,
  TreeViewSize,
  TreeViewVariant,
} from "./types";

/**
 * M3-tokenized TreeView.
 *
 * Re-skins MUI X's `<TreeView />` (https://mui.com/x/react-tree-view/)
 * onto M3 tokens — Material 3 has no formal Tree View spec, so this
 * follows the project's "MUI fallback" rule.
 *
 *   - 5 variants     : text / filled / tonal / outlined / elevated
 *   - 3 sizes        : 32 / 40 / 56 dp row heights (M3 list density)
 *   - 7 shapes       : full M3 corner scale on the wrapper + cursor
 *   - WAI-ARIA       : `role="tree"` + `role="treeitem"` +
 *                      `role="group"` for child lists +
 *                      `aria-expanded` / `aria-selected` /
 *                      `aria-level` / `aria-posinset` / `aria-setsize`
 *   - Motion         : expand/collapse rides springs.springy on a
 *                      height + opacity morph; selection cursor slides
 *                      between rows via shared `layoutId`; caret rotates
 *                      via standard easing; collapses under reduced motion
 *   - Keyboard       : ArrowUp/Down move focus across visible rows;
 *                      ArrowRight expands or moves to first child;
 *                      ArrowLeft collapses or moves to parent;
 *                      Home/End jump to first/last visible row;
 *                      Enter / Space toggle selection; `*` expands all
 *                      siblings of the focused row (MUI parity).
 */
function TreeViewInner(
  {
    nodes,
    variant = "text",
    size = "md",
    shape = "md",
    ariaLabel,
    selectionMode = "single",
    selected,
    defaultSelected,
    onSelectionChange,
    expanded,
    defaultExpanded,
    onExpansionChange,
    focusedId,
    defaultFocusedId,
    onFocusedChange,
    disabled = false,
    showCursor = true,
    className,
    ...rest
  }: TreeViewProps,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const reduced = useReducedMotion();
  const reactId = useId();
  const treeId = reactId.replace(/[^a-zA-Z0-9_-]/g, "");

  const variantStyles = variantClasses[variant];
  const sizes = sizeClasses[size];

  // -------- selection (controlled / uncontrolled) ---------------------------

  const isSelectionControlled = selected !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] = useState<string[]>(
    () => defaultSelected ?? [],
  );
  const selectedIds = isSelectionControlled
    ? (selected as string[])
    : uncontrolledSelected;

  const commitSelection = useCallback(
    (next: string[]) => {
      if (!isSelectionControlled) setUncontrolledSelected(next);
      onSelectionChange?.(next);
    },
    [isSelectionControlled, onSelectionChange],
  );

  // -------- expansion (controlled / uncontrolled) ---------------------------

  const isExpansionControlled = expanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<string[]>(
    () => defaultExpanded ?? [],
  );
  const expandedIds = isExpansionControlled
    ? (expanded as string[])
    : uncontrolledExpanded;
  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const commitExpansion = useCallback(
    (next: string[]) => {
      if (!isExpansionControlled) setUncontrolledExpanded(next);
      onExpansionChange?.(next);
    },
    [isExpansionControlled, onExpansionChange],
  );

  // -------- focus / roving tabindex (controlled / uncontrolled) -------------

  const isFocusControlled = focusedId !== undefined;
  const [uncontrolledFocused, setUncontrolledFocused] = useState<string | null>(
    () => defaultFocusedId ?? null,
  );
  const focusedKey = isFocusControlled
    ? (focusedId as string)
    : uncontrolledFocused;

  const commitFocus = useCallback(
    (next: string | null) => {
      if (!isFocusControlled) setUncontrolledFocused(next);
      onFocusedChange?.(next);
    },
    [isFocusControlled, onFocusedChange],
  );

  // -------- flatten visible rows for keyboard navigation --------------------

  interface FlatRow {
    id: string;
    parentId: string | null;
    level: number;
    posInSet: number;
    setSize: number;
    hasChildren: boolean;
    expanded: boolean;
    disabled: boolean;
    siblings: TreeNode[];
  }

  const flatVisible = useMemo<FlatRow[]>(() => {
    const out: FlatRow[] = [];
    const visit = (
      siblings: TreeNode[],
      level: number,
      parentId: string | null,
    ) => {
      siblings.forEach((node, index) => {
        const hasChildren = (node.children?.length ?? 0) > 0;
        const isExpanded = hasChildren && expandedSet.has(node.id);
        out.push({
          id: node.id,
          parentId,
          level,
          posInSet: index + 1,
          setSize: siblings.length,
          hasChildren,
          expanded: isExpanded,
          disabled: Boolean(node.disabled) || disabled,
          siblings,
        });
        if (isExpanded && node.children) {
          visit(node.children, level + 1, node.id);
        }
      });
    };
    visit(nodes, 1, null);
    return out;
  }, [nodes, expandedSet, disabled]);

  const reachable = useMemo(
    () => flatVisible.filter((row) => !row.disabled).map((row) => row.id),
    [flatVisible],
  );

  // -------- ensure the focused id stays valid -------------------------------

  useEffect(() => {
    if (focusedKey == null && reachable.length > 0) {
      const fallback =
        selectedIds.find((id) => reachable.includes(id)) ?? reachable[0];
      commitFocus(fallback ?? null);
    } else if (focusedKey != null && !reachable.includes(focusedKey)) {
      commitFocus(reachable[0] ?? null);
    }
    // commitFocus / selectedIds intentionally tracked through state above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedKey, reachable]);

  // -------- ref registry so keyboard nav can move DOM focus -----------------

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setRowRef = useCallback(
    (id: string, node: HTMLDivElement | null) => {
      rowRefs.current[id] = node;
    },
    [],
  );

  const moveFocus = useCallback(
    (delta: 1 | -1) => {
      if (reachable.length === 0) return;
      const current = focusedKey ?? reachable[0];
      const idx = reachable.indexOf(current);
      const nextIdx = (idx + delta + reachable.length) % reachable.length;
      const nextId = reachable[nextIdx];
      commitFocus(nextId);
      rowRefs.current[nextId]?.focus({ preventScroll: true });
    },
    [reachable, focusedKey, commitFocus],
  );

  const focusById = useCallback(
    (id: string) => {
      commitFocus(id);
      rowRefs.current[id]?.focus({ preventScroll: true });
    },
    [commitFocus],
  );

  // -------- selection toggling ---------------------------------------------

  const toggleSelection = useCallback(
    (id: string) => {
      if (selectionMode === "none") return;
      const flat = flatVisible.find((row) => row.id === id);
      if (flat?.disabled) return;
      if (selectionMode === "single") {
        commitSelection(selectedIds.includes(id) ? [] : [id]);
        return;
      }
      const next = selectedIds.includes(id)
        ? selectedIds.filter((k) => k !== id)
        : [...selectedIds, id];
      commitSelection(next);
    },
    [commitSelection, flatVisible, selectedIds, selectionMode],
  );

  // -------- expansion toggling ---------------------------------------------

  const setExpansion = useCallback(
    (id: string, value: boolean) => {
      const has = expandedSet.has(id);
      if (value && !has) commitExpansion([...expandedIds, id]);
      else if (!value && has) commitExpansion(expandedIds.filter((k) => k !== id));
    },
    [commitExpansion, expandedIds, expandedSet],
  );

  const toggleExpansion = useCallback(
    (id: string) => {
      setExpansion(id, !expandedSet.has(id));
    },
    [expandedSet, setExpansion],
  );

  // -------- keyboard handling ----------------------------------------------

  interface KeyboardRow {
    id: string;
    parentId: string | null;
    level: number;
    hasChildren: boolean;
    expanded: boolean;
    siblings: TreeNode[];
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>, row: KeyboardRow) => {
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
        case "Home": {
          event.preventDefault();
          const first = reachable[0];
          if (first) focusById(first);
          return;
        }
        case "End": {
          event.preventDefault();
          const last = reachable[reachable.length - 1];
          if (last) focusById(last);
          return;
        }
        case "ArrowRight": {
          event.preventDefault();
          if (row.hasChildren && !row.expanded) {
            setExpansion(row.id, true);
            return;
          }
          if (row.hasChildren && row.expanded) {
            // move focus to first reachable descendant — re-flatten
            // happens on the next render so we look up the next id by
            // walking forward in the current reachable list until we find
            // a row whose parent is `row.id`.
            const nextId = nextChildId(row.id, flatVisible);
            if (nextId) focusById(nextId);
            return;
          }
          return;
        }
        case "ArrowLeft": {
          event.preventDefault();
          if (row.hasChildren && row.expanded) {
            setExpansion(row.id, false);
            return;
          }
          if (row.parentId) focusById(row.parentId);
          return;
        }
        case "Enter":
        case " ":
          event.preventDefault();
          toggleSelection(row.id);
          return;
        case "*": {
          event.preventDefault();
          // Expand every sibling that has children at the current level.
          const additions = row.siblings
            .filter((n) => (n.children?.length ?? 0) > 0)
            .map((n) => n.id);
          const next = Array.from(new Set([...expandedIds, ...additions]));
          commitExpansion(next);
          return;
        }
        default:
          return;
      }
    },
    [
      commitExpansion,
      disabled,
      expandedIds,
      flatVisible,
      focusById,
      moveFocus,
      reachable,
      setExpansion,
      toggleSelection,
    ],
  );

  // -------- render ----------------------------------------------------------

  return (
    <motion.div
      ref={ref}
      data-component="tree-view"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled || undefined}
      className={cn(
        anatomy.wrapper,
        variantStyles.wrapper,
        shapeClasses[shape],
        sizes.wrapperPadding,
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      <ul
        role="tree"
        data-component="tree-view-tree"
        aria-label={ariaLabel}
        aria-multiselectable={
          selectionMode === "multiple" ? true : undefined
        }
        aria-disabled={disabled || undefined}
        className={anatomy.tree}
      >
        {nodes.map((node, index) => (
          <TreeItem
            key={node.id}
            node={node}
            level={1}
            posInSet={index + 1}
            setSize={nodes.length}
            parentId={null}
            siblings={nodes}
            treeId={treeId}
            variant={variant}
            size={size}
            shape={shape}
            selectedIds={selectedIds}
            expandedSet={expandedSet}
            focusedKey={focusedKey}
            disabledTree={disabled}
            selectionMode={selectionMode}
            showCursor={showCursor}
            reduced={Boolean(reduced)}
            registerRef={setRowRef}
            onActivate={toggleSelection}
            onToggle={toggleExpansion}
            onFocusRow={(id) => commitFocus(id)}
            onKeyDown={(event, row) => handleKeyDown(event, row)}
          />
        ))}
      </ul>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* TreeItem (recursive)                                                       */
/* -------------------------------------------------------------------------- */

interface TreeItemProps {
  node: TreeNode;
  level: number;
  posInSet: number;
  setSize: number;
  parentId: string | null;
  siblings: TreeNode[];
  treeId: string;
  variant: TreeViewVariant;
  size: TreeViewSize;
  shape: TreeViewShape;
  selectedIds: string[];
  expandedSet: Set<string>;
  focusedKey: string | null;
  disabledTree: boolean;
  selectionMode: "none" | "single" | "multiple";
  showCursor: boolean;
  reduced: boolean;
  registerRef: (id: string, node: HTMLDivElement | null) => void;
  onActivate: (id: string) => void;
  onToggle: (id: string) => void;
  onFocusRow: (id: string) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLDivElement>,
    row: {
      id: string;
      parentId: string | null;
      level: number;
      hasChildren: boolean;
      expanded: boolean;
      siblings: TreeNode[];
    },
  ) => void;
}

function TreeItem({
  node,
  level,
  posInSet,
  setSize,
  parentId,
  siblings,
  treeId,
  variant,
  size,
  shape,
  selectedIds,
  expandedSet,
  focusedKey,
  disabledTree,
  selectionMode,
  showCursor,
  reduced,
  registerRef,
  onActivate,
  onToggle,
  onFocusRow,
  onKeyDown,
}: TreeItemProps) {
  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];

  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = hasChildren && expandedSet.has(node.id);
  const isSelected = selectedIds.includes(node.id);
  const isDisabled = Boolean(node.disabled) || disabledTree;
  const isError = Boolean(node.error);
  const isFocused = focusedKey === node.id;
  const interactive = selectionMode !== "none" && !isDisabled;

  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const stateLayer = !interactive
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focusVisible
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const itemState = resolveItemState({
    isSelected,
    isDisabled,
    isError,
  });

  // Indent: the row's left pad = base padding + (level - 1) * indentStep.
  // The base padding lives in `sizes.rowPadding` (px-N). We add the
  // per-level indent as inline style so it doesn't blow up the
  // Tailwind static-class scan.
  const indent: CSSProperties = {
    paddingLeft: `${(level - 1) * sizes.indent}px`,
  };

  return (
    <li
      role="none"
      data-component="tree-view-item"
      data-id={node.id}
      data-level={level}
      data-expanded={isExpanded || undefined}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-error={isError || undefined}
      data-state={itemState}
      className={anatomy.item}
    >
      <div
        ref={(el) => registerRef(node.id, el)}
        role="treeitem"
        data-component="tree-view-row"
        data-id={node.id}
        data-state={itemState}
        data-level={level}
        data-selected={isSelected || undefined}
        data-disabled={isDisabled || undefined}
        data-error={isError || undefined}
        data-focused={isFocused || undefined}
        data-expanded={isExpanded || undefined}
        data-has-children={hasChildren || undefined}
        aria-level={level}
        aria-posinset={posInSet}
        aria-setsize={setSize}
        aria-selected={interactive ? isSelected : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
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
        onFocus={(event) => {
          if (interactive) onFocusRow(node.id);
          if (event.target.matches(":focus-visible")) setFocusVisible(true);
        }}
        onBlur={() => {
          setFocusVisible(false);
          setPressed(false);
        }}
        onClick={() => {
          if (!interactive) return;
          // Click on the row toggles both selection and expansion.
          onActivate(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        onKeyDown={(event) =>
          onKeyDown(event, {
            id: node.id,
            parentId,
            level,
            hasChildren,
            expanded: isExpanded,
            siblings,
          })
        }
        style={indent}
        className={cn(
          anatomy.row,
          sizes.rowHeight,
          sizes.rowPadding,
          sizes.gap,
          interactive && anatomy.rowInteractive,
          isDisabled && anatomy.rowDisabled,
          isSelected
            ? anatomy.rowSelected
            : isError
              ? anatomy.rowError
              : "text-current",
        )}
      >
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.stateLayer, "bg-on-surface")}
          style={{ opacity: stateLayer }}
        />

        {showCursor && isFocused && interactive ? (
          <motion.span
            layout
            layoutId={`tree-view-cursor-${treeId}`}
            aria-hidden
            data-slot="tree-view-cursor"
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

        {hasChildren ? (
          <button
            type="button"
            data-slot="caret"
            data-expanded={isExpanded || undefined}
            aria-hidden
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              if (interactive) onToggle(node.id);
            }}
            className={cn(
              anatomy.caret,
              isExpanded && variantStyles.caretActive,
            )}
            style={{
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            <CaretIcon className={anatomy.caretIcon} />
          </button>
        ) : (
          <span
            aria-hidden
            data-slot="leaf-dot"
            className={anatomy.leafDot}
          >
            <span className={anatomy.leafDotInner} />
          </span>
        )}

        {node.icon ? (
          <span
            aria-hidden
            data-slot="icon"
            className={anatomy.icon}
          >
            {node.icon}
          </span>
        ) : null}

        <span data-slot="label-stack" className={anatomy.labelStack}>
          <span data-slot="label" className={cn(anatomy.label, sizes.labelType)}>
            {node.label}
          </span>
          {node.secondary ? (
            <span data-slot="secondary" className={anatomy.secondary}>
              {node.secondary}
            </span>
          ) : null}
        </span>

        {node.endIcon ? (
          <span
            aria-hidden
            data-slot="end-icon"
            className={anatomy.endIcon}
          >
            {node.endIcon}
          </span>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isExpanded ? (
          <motion.ul
            role="group"
            data-component="tree-view-group"
            data-parent={node.id}
            className={anatomy.group}
            initial={
              reduced
                ? { height: "auto", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              reduced
                ? { height: "auto", opacity: 0 }
                : { height: 0, opacity: 0 }
            }
            transition={reduced ? { duration: 0 } : springs.springy}
          >
            {node.children?.map((child, index) => (
              <TreeItem
                key={child.id}
                node={child}
                level={level + 1}
                posInSet={index + 1}
                setSize={node.children?.length ?? 0}
                parentId={node.id}
                siblings={node.children ?? []}
                treeId={treeId}
                variant={variant}
                size={size}
                shape={shape}
                selectedIds={selectedIds}
                expandedSet={expandedSet}
                focusedKey={focusedKey}
                disabledTree={disabledTree}
                selectionMode={selectionMode}
                showCursor={showCursor}
                reduced={reduced}
                registerRef={registerRef}
                onActivate={onActivate}
                onToggle={onToggle}
                onFocusRow={onFocusRow}
                onKeyDown={onKeyDown}
              />
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function resolveItemState({
  isSelected,
  isDisabled,
  isError,
}: {
  isSelected: boolean;
  isDisabled: boolean;
  isError: boolean;
}): TreeViewItemState {
  if (isDisabled) return "disabled";
  if (isError) return "error";
  if (isSelected) return "selected";
  return "default";
}

function CaretIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      focusable="false"
      fill="currentColor"
      className={className}
    >
      <path d="M9 6l6 6-6 6V6z" />
    </svg>
  );
}

/**
 * Walk the flattened visible row list to find the first row whose
 * parent is `parentId` and that comes after the current row. Used by
 * the ArrowRight key handler to step into the first child.
 */
function nextChildId(
  parentId: string,
  flatVisible: Array<{ id: string; parentId?: string | null }>,
): string | null {
  const startIdx = flatVisible.findIndex((row) => row.id === parentId);
  if (startIdx < 0) return null;
  for (let i = startIdx + 1; i < flatVisible.length; i++) {
    if (flatVisible[i].parentId === parentId) return flatVisible[i].id;
  }
  return null;
}

export const TreeView = forwardRef(TreeViewInner);
