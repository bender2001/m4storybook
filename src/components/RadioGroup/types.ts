import type { HTMLAttributes, ReactNode } from "react";

export type RadioSize = "sm" | "md" | "lg";

/**
 * M3 Radio specifies a single visual treatment but we expose a `variant`
 * prop so the component library mirrors the rest of the Inputs alphabet.
 * `error` paints the outline + selected dot in the error role.
 */
export type RadioVariant = "default" | "error";

/** A single option in a RadioGroup. */
export interface RadioOption<TValue extends string = string> {
  /** Unique value submitted when this option is selected. */
  value: TValue;
  /** Visible label rendered next to the radio circle. */
  label: ReactNode;
  /** Optional helper text rendered beneath the label. */
  helperText?: ReactNode;
  /** Optional leading icon before the label. */
  startIcon?: ReactNode;
  /** Optional trailing icon after the label. */
  endIcon?: ReactNode;
  /** Disable this single option. */
  disabled?: boolean;
}

export interface RadioGroupProps<TValue extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Group name applied to every native input — required for a11y. */
  name: string;
  /** Available options. */
  options: ReadonlyArray<RadioOption<TValue>>;
  /** Controlled selected value. */
  value?: TValue | null;
  /** Uncontrolled initial selected value. */
  defaultValue?: TValue | null;
  /** Fires whenever the selected option changes. */
  onChange?: (next: TValue) => void;
  /** Visual size. */
  size?: RadioSize;
  /** `error` paints the radio circles + selected dot in the error role. */
  variant?: RadioVariant;
  /** Disable every option in the group. */
  disabled?: boolean;
  /** Render the row as a horizontal row instead of a vertical column. */
  orientation?: "horizontal" | "vertical";
  /** Render the radio circle on the right of the label. */
  labelPlacement?: "start" | "end";
  /** Optional group label (rendered as a legend). */
  legend?: ReactNode;
  /** Helper text for the whole group, rendered beneath the legend. */
  helperText?: ReactNode;
}
