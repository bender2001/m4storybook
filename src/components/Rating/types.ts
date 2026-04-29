import type { HTMLAttributes, ReactNode } from "react";

export type RatingSize = "sm" | "md" | "lg";

/**
 * MUI fallback re-skinned with M3 tokens. `default` paints the active
 * symbol in the primary role; `accent` swaps to the tertiary role for
 * a higher-emphasis "favorite" treatment.
 */
export type RatingVariant = "default" | "accent";

export interface RatingProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Group name applied to every native input — required for a11y. */
  name: string;
  /** Controlled value (0..max, half-precision when `precision === 0.5`). */
  value?: number | null;
  /** Uncontrolled initial value. */
  defaultValue?: number | null;
  /** Fires when the user picks a new rating. */
  onChange?: (next: number | null) => void;
  /** Fires while the user hovers a value (or `null` on leave). */
  onChangeActive?: (preview: number | null) => void;
  /** Total number of symbols. Default 5. */
  max?: number;
  /** 1 (full only) or 0.5 (half-precision). Default 1. */
  precision?: 0.5 | 1;
  /** Visual size. */
  size?: RatingSize;
  /** Color treatment: `default` = primary, `accent` = tertiary. */
  variant?: RatingVariant;
  /** Block all interaction; reads as aria-readonly. */
  readOnly?: boolean;
  /** Disable every option. */
  disabled?: boolean;
  /** Label rendered next to / above the row. */
  label?: ReactNode;
  /** Helper text under the row. */
  helperText?: ReactNode;
  /** Custom filled icon. Defaults to a star glyph. */
  icon?: ReactNode;
  /** Custom empty icon. Defaults to a hollow star. */
  emptyIcon?: ReactNode;
  /**
   * Generate the aria-label for each individual symbol. Defaults to
   * `"value Stars"`. Receives the value the symbol represents (1, 2, ...).
   */
  getLabelText?: (value: number) => string;
}
