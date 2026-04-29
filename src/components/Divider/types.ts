import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 divider variants.
 *  - full   : spans the full width of its container (default)
 *  - inset  : starts after a 16dp inset (icon/avatar gutter)
 *  - middle : insets symmetrically (16dp on both sides)
 */
export type DividerVariant = "full" | "inset" | "middle";

/**
 * Divider thickness scale. M3 spec defaults to 1dp; we expose
 * 2dp/4dp for emphasized hierarchy in dense layouts.
 */
export type DividerSize = "sm" | "md" | "lg";

/** Orientation: horizontal (default) or vertical. */
export type DividerOrientation = "horizontal" | "vertical";

type DividerOwnKey =
  | "variant"
  | "size"
  | "orientation"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "labelAlign"
  | "children"
  | "aria-label";

export interface DividerProps
  extends Omit<HTMLMotionProps<"div">, "ref" | DividerOwnKey> {
  variant?: DividerVariant;
  size?: DividerSize;
  orientation?: DividerOrientation;
  /** Optional inline label rendered along the divider rule. */
  label?: ReactNode;
  /** Optional leading icon adjacent to the label. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon adjacent to the label. */
  trailingIcon?: ReactNode;
  /** Where to place the label along the rule. Defaults to "center". */
  labelAlign?: "start" | "center" | "end";
  /** Inline label content (alt to `label`). */
  children?: ReactNode;
  /** Accessible label override (only used when role=separator). */
  "aria-label"?: string;
}
