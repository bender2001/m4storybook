import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Speed Dial.
 *
 * MUI's `<SpeedDial />` has no Material 3 spec, so the surface is
 * re-skinned onto M3 tokens: the trigger paints as the M3 Expressive
 * FAB (https://m3.material.io/components/floating-action-button/specs)
 * and each action paints as the M3 Small FAB. The trigger morphs its
 * leading icon to a "close" glyph while open, matching MUI's
 * `openIcon` swap and the M3 expressive icon-morph behavior shared
 * with the IconButton selection token.
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
 *   - Trigger press / scale       : `springs.springy`
 *   - Action enter / exit stagger : `medium2` (300 ms) / `emphasized`
 *   - Backdrop fade               : `medium1` (250 ms) / `standard`
 */

/**
 * Trigger color variants. Mirrors `<Fab>` so a Speed Dial can sit on
 * any M3 surface family without losing contrast.
 *
 *   - surface   : surface-container-high host (low-emphasis)
 *   - primary   : primary-container host (M3 default emphasis)
 *   - secondary : secondary-container host
 *   - tertiary  : tertiary-container host
 */
export type SpeedDialVariant = "surface" | "primary" | "secondary" | "tertiary";

/**
 * Trigger size. Action FABs always paint as the M3 Small FAB (40dp)
 * regardless of the trigger size, per MUI's spec.
 *
 *   sm : 40dp trigger / shape-md / 24dp icon
 *   md : 56dp trigger / shape-lg / 24dp icon  (M3 default)
 *   lg : 96dp trigger / shape-xl / 36dp icon
 */
export type SpeedDialSize = "sm" | "md" | "lg";

/**
 * Open direction. Determines both the action-list flow axis and which
 * edge of the trigger the actions stack against.
 *
 *   up    : column of actions stacked above the trigger  (M3 default)
 *   down  : column of actions stacked below the trigger
 *   left  : row of actions to the left of the trigger
 *   right : row of actions to the right of the trigger
 */
export type SpeedDialDirection = "up" | "down" | "left" | "right";

/** M3 corner shape token applied to the trigger when closed. */
export type SpeedDialShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** A single action rendered in the open list. */
export interface SpeedDialAction {
  /** Stable React key + DOM id seed. */
  key: string;
  /** Icon node rendered inside the action FAB. */
  icon: ReactNode;
  /**
   * Visible tooltip label, also used as the action's accessible name
   * when no `aria-label` is provided.
   */
  label: string;
  /** Click handler — fires after the open transition resolves. */
  onClick?: (event: unknown, key: string) => void;
  /** Disable a single action without dismissing the dial. */
  disabled?: boolean;
  /** Override the visible tooltip placement (defaults to direction). */
  tooltipOpen?: boolean;
  /** Aria-label override; falls back to `label`. */
  "aria-label"?: string;
}

type SpeedDialOwnKey =
  | "variant"
  | "size"
  | "direction"
  | "shape"
  | "actions"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "icon"
  | "openIcon"
  | "ariaLabel"
  | "disabled"
  | "hideBackdrop"
  | "renderAction"
  | "tooltipPlacement";

export interface SpeedDialProps
  extends Omit<HTMLMotionProps<"div">, SpeedDialOwnKey> {
  /** Trigger color variant. Defaults to `primary`. */
  variant?: SpeedDialVariant;
  /** Trigger size. Defaults to `md` (M3 default FAB). */
  size?: SpeedDialSize;
  /** Open direction. Defaults to `up`. */
  direction?: SpeedDialDirection;
  /** Trigger shape token (rest state). Defaults to `lg`. */
  shape?: SpeedDialShape;
  /** Ordered list of actions rendered when open. */
  actions: SpeedDialAction[];
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Fires whenever the open state changes (controlled + uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** Trigger icon shown while closed. */
  icon: ReactNode;
  /**
   * Trigger icon shown while open. When omitted, the closed icon
   * cross-fades + rotates 45° (M3 expressive icon-morph).
   */
  openIcon?: ReactNode;
  /**
   * Accessible name for the trigger. Required because the trigger has
   * no visible text label.
   */
  ariaLabel: string;
  /** Disables the entire dial. */
  disabled?: boolean;
  /**
   * Hides the dim scrim drawn behind the open dial. Defaults to false
   * (scrim is shown). MUI parity.
   */
  hideBackdrop?: boolean;
  /** Render-prop hook for total customization of an action. */
  renderAction?: (action: SpeedDialAction, index: number) => ReactNode;
  /**
   * Tooltip placement override. Defaults to:
   *   - direction=up/down → "left"
   *   - direction=left    → "top"
   *   - direction=right   → "top"
   */
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}
