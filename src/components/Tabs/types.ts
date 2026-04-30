import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Tabs.
 *
 * Implements both M3 Primary Tabs and M3 Secondary Tabs spec
 * (https://m3.material.io/components/tabs/specs) plus the M3
 * Expressive selection morph: the active indicator is a shared
 * `layoutId` element that springs between tabs, and the indicator
 * shape morphs from a flat 3dp bar (`shape-xs`) to the selected
 * `shape` token via motion/react springs.
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
 *   - Indicator slide / shape morph : `springs.springy`
 *   - State-layer opacity           : `short4` (200ms) / `standard`
 */

/**
 * Tabs paint variant. Drives the indicator paint, the active-tab
 * container surface, and the host surface. All variants share the
 * same M3 Expressive indicator + spring + a11y wiring.
 *
 *   - filled   : M3 Primary Tabs (default) - 3dp `primary` indicator
 *                with shape-md squircle morph; active label paints
 *                `text-primary`
 *   - tonal    : M3 Expressive tonal pill - active tab background
 *                paints `secondary-container` with shape-full pill
 *   - outlined : Outlined ring per tab + 3dp `primary` indicator
 *   - text     : M3 Secondary Tabs - 2dp `primary` underline; no
 *                container paint, label color changes only
 *   - elevated : `surface-container-low` host w/ elevation-1 +
 *                3dp `primary` indicator
 */
export type TabsVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Tab density.
 *
 *   - sm : 40dp / label-m
 *   - md : 48dp / title-s   (M3 default)
 *   - lg : 64dp / title-s   (icon + label stacked)
 */
export type TabsSize = "sm" | "md" | "lg";

/**
 * Tabs layout axis.
 *
 *   - horizontal : tabs sit in a row, indicator at bottom edge
 *   - vertical   : tabs stack in a column, indicator at trailing edge
 */
export type TabsOrientation = "horizontal" | "vertical";

/**
 * Active-tab indicator shape (the morph target). Inactive tabs
 * have no indicator. The indicator morphs via motion/react springs
 * when the selected tab changes — matching the M3 Expressive
 * selection pattern.
 */
export type TabsShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** A single tab descriptor. */
export interface TabsItem {
  /** Stable React key + DOM id seed. */
  key: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional leading icon glyph rendered before the label. */
  icon?: ReactNode;
  /** Optional trailing slot (e.g. a Badge dot) rendered after the label. */
  trailing?: ReactNode;
  /** Disables this tab (cannot be navigated to). */
  disabled?: boolean;
  /**
   * Marks the tab as in error. Paints the label with the `error`
   * role regardless of variant.
   */
  error?: boolean;
}

type TabsOwnKey =
  | "items"
  | "activeKey"
  | "defaultActiveKey"
  | "onChange"
  | "variant"
  | "size"
  | "orientation"
  | "shape"
  | "fullWidth"
  | "disabled"
  | "ariaLabel"
  | "renderTabContent";

export interface TabsProps
  extends Omit<HTMLMotionProps<"div">, TabsOwnKey> {
  /** Ordered list of tabs. */
  items: TabsItem[];
  /** Controlled active tab key. */
  activeKey?: string;
  /** Initial active tab key when uncontrolled. Defaults to the first item. */
  defaultActiveKey?: string;
  /** Fires whenever the active tab changes (controlled + uncontrolled). */
  onChange?: (next: string, index: number) => void;
  /** Paint variant. Defaults to `filled`. */
  variant?: TabsVariant;
  /** Tab density. Defaults to `md`. */
  size?: TabsSize;
  /** Layout orientation. Defaults to `horizontal`. */
  orientation?: TabsOrientation;
  /** Active-indicator morph shape. Defaults to `md` (M3 squircle). */
  shape?: TabsShape;
  /** Tabs occupy equal-width slots across the host. Defaults to `false`. */
  fullWidth?: boolean;
  /** Disables the entire tab list. */
  disabled?: boolean;
  /**
   * Accessible name for the `<div role="tablist">`. Used as the
   * ARIA label for the tab list.
   */
  ariaLabel?: string;
  /**
   * Render-prop hook returning the panel body for the active tab.
   * When omitted, no panel is rendered (caller can control the
   * panel surface from outside via `onChange`).
   */
  renderTabContent?: (active: TabsItem, index: number) => ReactNode;
}

/** Resolved per-tab state used for label + container painting. */
export type TabsItemState =
  | "selected"
  | "inactive"
  | "error"
  | "disabled";
