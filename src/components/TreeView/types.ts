import type { HTMLMotionProps } from "motion/react";
import type { Key, ReactNode } from "react";

/**
 * TreeView is an MUI fallback re-skinned with M3 tokens. Material 3 has
 * no formal Tree View spec, so this follows the project's "MUI fallback"
 * rule: it ports the MUI X TreeView behaviour
 * (https://mui.com/x/react-tree-view/) and paints it through M3 surface,
 * shape, elevation, and motion tokens.
 *
 * Surface variants drive the host wrapper *and* the per-row paint when
 * an item is selected. The selection cursor (a 3dp leading bar painted
 * in `bg-primary` on the focused item) springs between rows via a
 * shared `layoutId` motion span — the same M3 Expressive selection
 * morph used by Tabs / Stepper / Pagination / DataGrid.
 *
 * State-layer opacities follow M3:
 *
 *   - hover    : 0.08 of the current foreground role
 *   - focus    : 0.10
 *   - pressed  : 0.10
 *   - dragged  : 0.16  (unused here)
 *
 * Motion tokens (from `src/tokens/motion.ts`):
 *
 *   - Expand / collapse        : `springs.springy` height + opacity morph
 *   - Selection cursor slide   : `springs.springy`
 *   - Caret rotation           : `short4` (200ms) / `standard`
 *   - State-layer opacity      : `short4` / `standard`
 */

/**
 * Surface variant. Drives the host wrapper paint and the selection
 * cursor / selected-row tint.
 *
 *   - text     : transparent host, primary cursor (default)
 *   - filled   : `surface-container-highest` host, primary cursor
 *   - tonal    : `secondary-container` host, secondary cursor
 *   - outlined : transparent host with 1dp `outline-variant` border
 *   - elevated : `surface-container-low` host with elevation-2 shadow
 */
export type TreeViewVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density scale.
 *
 *   sm : 32dp row, body-s, 4dp indent step
 *   md : 40dp row, body-m, 8dp indent step (M3 default)
 *   lg : 56dp row, body-l, 12dp indent step
 */
export type TreeViewSize = "sm" | "md" | "lg";

/** Wrapper + selection cursor shape token. */
export type TreeViewShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Selection mode. Mirrors MUI X TreeView's `multiSelect` prop. */
export type TreeViewSelectionMode = "none" | "single" | "multiple";

/**
 * Single tree node descriptor. Children form the recursive shape.
 *
 *   - `id`            : stable node id (used as React key + selection key)
 *   - `label`         : primary row label (string or ReactNode)
 *   - `secondary`     : optional secondary text shown below the label
 *   - `icon`          : optional leading glyph that overrides the
 *                       expand/collapse caret. When omitted the caret
 *                       (or a leaf dot) renders.
 *   - `endIcon`       : optional trailing glyph (alignment slot).
 *   - `disabled`      : marks the node as non-interactive.
 *   - `error`         : paints the row in the M3 `error` foreground role.
 *   - `children`      : optional child node list.
 */
export interface TreeNode {
  id: string;
  label: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  error?: boolean;
  children?: TreeNode[];
}

/** Resolved per-row render state. */
export type TreeViewItemState =
  | "default"
  | "hover"
  | "focus"
  | "pressed"
  | "selected"
  | "disabled"
  | "error";

type TreeViewOwnKey =
  | "nodes"
  | "variant"
  | "size"
  | "shape"
  | "ariaLabel"
  | "selectionMode"
  | "selected"
  | "defaultSelected"
  | "onSelectionChange"
  | "expanded"
  | "defaultExpanded"
  | "onExpansionChange"
  | "focusedId"
  | "defaultFocusedId"
  | "onFocusedChange"
  | "disabled"
  | "showCursor";

export interface TreeViewProps
  extends Omit<HTMLMotionProps<"div">, TreeViewOwnKey | keyof { key: Key }> {
  /** Tree of nodes to render. */
  nodes: TreeNode[];
  /** Surface variant. Defaults to `text`. */
  variant?: TreeViewVariant;
  /** Density. Defaults to `md`. */
  size?: TreeViewSize;
  /** Wrapper + cursor shape. Defaults to `md`. */
  shape?: TreeViewShape;
  /** Accessible name for the `role="tree"` host. */
  ariaLabel?: string;
  /** Selection mode. Defaults to `single`. */
  selectionMode?: TreeViewSelectionMode;
  /** Controlled selected node ids. */
  selected?: string[];
  /** Initial selected node ids when uncontrolled. */
  defaultSelected?: string[];
  /** Fires whenever the selection changes. */
  onSelectionChange?: (next: string[]) => void;
  /** Controlled expanded node ids. */
  expanded?: string[];
  /** Initial expanded node ids when uncontrolled. */
  defaultExpanded?: string[];
  /** Fires whenever the expansion set changes. */
  onExpansionChange?: (next: string[]) => void;
  /** Controlled focused (tabbable) node id. */
  focusedId?: string;
  /** Initial focused node id when uncontrolled. */
  defaultFocusedId?: string;
  /** Fires whenever the focused (tabbable) node changes. */
  onFocusedChange?: (id: string | null) => void;
  /** Disables the entire tree. */
  disabled?: boolean;
  /**
   * Show the M3 Expressive selection cursor (3dp leading bar on the
   * focused row). Defaults to `true`.
   */
  showCursor?: boolean;
}
