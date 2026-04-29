import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Tooltip variants. The plain tooltip paints `inverse-surface`
 * with body-s text — used for terse descriptors (≈ one line). The
 * rich tooltip paints a `surface-container` panel with optional
 * subhead, supporting text, and action buttons.
 *
 * https://m3.material.io/components/tooltips/specs
 */
export type TooltipVariant = "plain" | "rich";

/** Size scale. Drives the container height + horizontal padding. */
export type TooltipSize = "sm" | "md" | "lg";

/** Placement relative to the trigger. */
export type TooltipPlacement = "top" | "right" | "bottom" | "left";

type TooltipOwnKey =
  | "variant"
  | "size"
  | "placement"
  | "label"
  | "subhead"
  | "supportingText"
  | "action"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "showDelayMs"
  | "hideDelayMs"
  | "disabled"
  | "children"
  | "id";

export interface TooltipProps
  extends Omit<HTMLMotionProps<"div">, "ref" | TooltipOwnKey> {
  variant?: TooltipVariant;
  size?: TooltipSize;
  placement?: TooltipPlacement;
  /** Plain-tooltip label or rich-tooltip primary line. */
  label: ReactNode;
  /** Rich-tooltip subhead (title-s) — ignored for plain. */
  subhead?: ReactNode;
  /** Rich-tooltip supporting text (body-m) — ignored for plain. */
  supportingText?: ReactNode;
  /** Rich-tooltip trailing action slot (e.g. text button) — ignored for plain. */
  action?: ReactNode;
  /** Controlled open. */
  open?: boolean;
  /** Uncontrolled default open. */
  defaultOpen?: boolean;
  /** Open-state subscription. */
  onOpenChange?: (open: boolean) => void;
  /** Hover-show delay (ms). Defaults to 500 (M3 spec). */
  showDelayMs?: number;
  /** Hover-hide delay (ms). Defaults to 1500 for plain, 0 for rich. */
  hideDelayMs?: number;
  /** Disables the tooltip; the trigger renders untouched. */
  disabled?: boolean;
  /** Trigger element. Wrapped in a focusable span; click/focus/hover propagate. */
  children: ReactNode;
  /** Stable id for the tooltip (used for aria-describedby). */
  id?: string;
}
