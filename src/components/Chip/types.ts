import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Expressive Chip variants. Each maps to an M3 chip type:
 *   - assist     : action that helps the user (single-action affordance)
 *   - filter     : toggleable filter selection (selected morphs container)
 *   - input      : tag/token representing user input (often dismissible)
 *   - suggestion : quick-reply suggestion chip
 */
export type ChipVariant = "assist" | "filter" | "input" | "suggestion";

/**
 * Chip density. M3 spec is 32dp; we add a small (24dp) and large (40dp)
 * to mirror the rest of the library.
 */
export type ChipSize = "sm" | "md" | "lg";

type ChipOwnKey =
  | "variant"
  | "size"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "selected"
  | "disabled"
  | "elevated"
  | "onDelete"
  | "deleteLabel"
  | "children"
  | "aria-label";

export interface ChipProps
  extends Omit<HTMLMotionProps<"button">, "ref" | ChipOwnKey> {
  variant?: ChipVariant;
  size?: ChipSize;
  /** Visible label. May also be passed via `children`. */
  label?: ReactNode;
  /** Optional leading slot (icon, avatar, or check glyph for filter). */
  leadingIcon?: ReactNode;
  /** Optional trailing slot. Hidden when `onDelete` is provided. */
  trailingIcon?: ReactNode;
  /** Selected (filter / input). Triggers M3 Expressive shape morph. */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Elevated container variant (surface-container-low + elevation-1). */
  elevated?: boolean;
  /** When provided, renders a trailing dismiss button (input chip pattern). */
  onDelete?: () => void;
  /** Accessible label for the dismiss button (default "Remove"). */
  deleteLabel?: string;
  /** Inline label content (alt to `label`). */
  children?: ReactNode;
  /** Accessible label override for the chip itself. */
  "aria-label"?: string;
}
