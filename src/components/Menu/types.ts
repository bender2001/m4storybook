import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Menu surface variants.
 *
 *   - text     : transparent host (lets a parent surface paint through)
 *   - filled   : `surface-container-highest` panel
 *   - tonal    : `secondary-container` panel
 *   - outlined : transparent panel + 1dp `outline-variant` border
 *   - elevated : `surface-container` panel + elevation-2 shadow
 *                (M3 default menu container — see
 *                https://m3.material.io/components/menus/specs)
 */
export type MenuVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. M3 menu lists use 48dp single-line items by default
 * (`md`); compact lists drop to 40dp (`sm`); spacious to 56dp
 * (`lg`) to match the dense / standard / comfortable density tiers.
 *
 *   sm : 40dp item / label-l type / 8dp pad
 *   md : 48dp item / body-l  type / 12dp pad   (M3 default)
 *   lg : 56dp item / body-l  type / 16dp pad
 */
export type MenuSize = "sm" | "md" | "lg";

/**
 * M3 corner shape token. Default `xs` (4px) per the M3 menu
 * container shape role.
 */
export type MenuShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** A single row inside the menu list. */
export interface MenuItem {
  /** Stable identifier used for keyboard nav + selection. */
  id: string;
  /** Primary label. */
  label?: ReactNode;
  /** Optional leading icon (24dp). */
  leadingIcon?: ReactNode;
  /** Optional trailing icon (24dp). */
  trailingIcon?: ReactNode;
  /** Optional trailing supporting text (e.g. shortcut "⌘S"). */
  trailingText?: ReactNode;
  /** Disabled item: aria-disabled, opacity 0.38, no events. */
  disabled?: boolean;
  /** Selected: paints the secondary-container fill, aria-selected. */
  selected?: boolean;
  /** Error: paints the on-error-container foreground (destructive). */
  error?: boolean;
  /** Render a 1dp `outline-variant` divider after this item. */
  divider?: boolean;
  /** Fires when the item is activated (click / Enter / Space). */
  onSelect?: () => void;
}

type MenuOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "open"
  | "items"
  | "selectedId"
  | "label"
  | "disabled"
  | "error"
  | "dismissOnEscape"
  | "onSelect"
  | "onDismiss";

export type MenuDismissSource = "escape" | "select";

export interface MenuProps
  extends Omit<HTMLMotionProps<"div">, MenuOwnKey> {
  variant?: MenuVariant;
  size?: MenuSize;
  shape?: MenuShape;
  /** Controlled open flag — when `false` the surface unmounts via AnimatePresence. */
  open?: boolean;
  /** Items rendered inside the list. */
  items: MenuItem[];
  /** ID of the currently selected item (paints secondary-container). */
  selectedId?: string;
  /** Optional header label rendered above the list. */
  label?: ReactNode;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container. */
  error?: boolean;
  /** Whether pressing Escape should fire `onDismiss('escape')`. Defaults to `true`. */
  dismissOnEscape?: boolean;
  /**
   * Fires when the user picks an item (click / Enter / Space). The
   * item is delivered alongside the source DOM event so consumers can
   * preventDefault if they need to keep the surface open.
   */
  onSelect?: (item: MenuItem) => void;
  /**
   * Fires when the surface should close: an item was selected without
   * the consumer suppressing dismissal, or Escape was pressed.
   */
  onDismiss?: (source: MenuDismissSource) => void;
}
