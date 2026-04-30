import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Date Range Picker.
 *
 * Re-skins MUI X DateRangePicker
 * (https://mui.com/x/react-date-pickers/date-range-picker/) onto M3 tokens —
 * Material 3 has no formal Lab Date Range Picker JSON spec, so this follows
 * the project's MUI fallback rule and matches the M3 date-pickers docs at
 * https://m3.material.io/components/date-pickers/specs.
 *
 * Anatomy:
 *
 *   - trigger : the input-shaped surface that shows the formatted range
 *               and opens the calendar panel on click / Enter / Space
 *   - panel   : the floating calendar surface (surface-container-high
 *               by default, shape-xl 28dp by default per M3)
 *   - header  : the panel's "Select range" supporting line + drafted
 *               start–end headline
 *   - nav     : prev / next month buttons + month-year label
 *   - grid    : the 7-column day-of-week grid + day cells
 *   - day     : a single day cell — circular state-layer, shape-morph
 *               cursors on the start + end days, and a continuous
 *               primary-container range fill on the days between them
 *   - actions : Cancel / OK buttons in the panel footer
 *
 * The two endpoint cursors morph from `shape-xs` to the picker's
 * `shape` token via two shared `layoutId` motion spans — the same
 * M3 Expressive selection morph used by Tabs / Stepper / Pagination /
 * Date Picker / Data Grid.
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
 *   - Panel open / close                     : `springs.gentle`
 *                                              + scale + opacity
 *   - Endpoint shape morph + slide           : `springs.springy`
 *   - Range fill grow / shrink               : `tweens.standard`
 *   - State-layer opacity                    : `short4` / `standard`
 */

/**
 * DateRangePicker paint variant. Drives the trigger surface and the
 * panel surface tinting. The panel is always `surface-container-high`
 * per M3 spec; the trigger surface follows the variant.
 *
 *   - filled   : `surface-container-highest` trigger (M3 default)
 *   - tonal    : `secondary-container` trigger
 *   - outlined : 1dp `outline` border, transparent trigger
 *   - text     : transparent trigger, only the label paints
 *   - elevated : `surface-container-low` + elevation-1 trigger
 */
export type DateRangePickerVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Trigger size + day-cell density.
 *
 *   - sm : 40dp trigger / 32dp day cell
 *   - md : 56dp trigger / 40dp day cell  (M3 default)
 *   - lg : 64dp trigger / 48dp day cell
 */
export type DateRangePickerSize = "sm" | "md" | "lg";

/**
 * Panel + endpoint corner shape. The endpoint cursors morph from
 * `shape-xs` to this shape via shared `layoutId` motion spans.
 * Defaults to `xl` to match M3 Expressive (28dp panel, circular
 * day cells with morphing endpoint cursors).
 */
export type DateRangePickerShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Resolved per-day state inside the range grid. */
export type DateRangePickerDayState =
  | "default"
  | "hover"
  | "focus"
  | "pressed"
  | "start"
  | "end"
  | "in-range"
  | "today"
  | "disabled";

/**
 * Inclusive selection. `null` on either endpoint means "not yet picked".
 * When both endpoints are `null` the trigger renders the placeholder.
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

type DateRangePickerOwnKey =
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "variant"
  | "size"
  | "shape"
  | "label"
  | "supportingText"
  | "placeholder"
  | "ariaLabel"
  | "disabled"
  | "error"
  | "minDate"
  | "maxDate"
  | "leadingIcon"
  | "trailingIcon"
  | "formatDate"
  | "weekStartsOn";

export interface DateRangePickerProps
  extends Omit<HTMLMotionProps<"div">, DateRangePickerOwnKey> {
  /** Controlled selected range. */
  value?: DateRange;
  /** Initial selected range when uncontrolled. */
  defaultValue?: DateRange;
  /** Fires whenever the user picks a range and confirms with OK. */
  onValueChange?: (next: DateRange) => void;
  /** Controlled panel-open flag. */
  open?: boolean;
  /** Initial panel-open flag when uncontrolled. */
  defaultOpen?: boolean;
  /** Fires whenever the panel toggles. */
  onOpenChange?: (next: boolean) => void;
  /** Paint variant. Defaults to `filled`. */
  variant?: DateRangePickerVariant;
  /** Trigger + day-cell density. Defaults to `md`. */
  size?: DateRangePickerSize;
  /** Panel + endpoint shape. Defaults to `xl` (28dp). */
  shape?: DateRangePickerShape;
  /** Floating label text inside the trigger. */
  label?: ReactNode;
  /** Supporting text rendered beneath the trigger. */
  supportingText?: ReactNode;
  /** Placeholder when the range is empty. Defaults to "Start – End". */
  placeholder?: string;
  /** Accessible name for the trigger when there is no visible label. */
  ariaLabel?: string;
  /** Disables the entire picker (trigger and panel). */
  disabled?: boolean;
  /** Paints the trigger + supporting text in the M3 error role pair. */
  error?: boolean;
  /** Inclusive lower bound for selectable days. */
  minDate?: Date;
  /** Inclusive upper bound for selectable days. */
  maxDate?: Date;
  /** Optional leading icon rendered inside the trigger surface. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon. Defaults to a calendar glyph. */
  trailingIcon?: ReactNode;
  /** Formatter for the trigger value. Defaults to `MM/DD/YYYY`. */
  formatDate?: (date: Date) => string;
  /** First day of the week (0 = Sunday … 6 = Saturday). Defaults to 0. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
