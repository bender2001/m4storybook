import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Date Picker.
 *
 * Re-skins MUI X Date Picker (https://mui.com/x/react-date-pickers/date-picker/)
 * onto M3 tokens — Material 3 has no formal Lab Date Picker JSON spec, so
 * this follows the project's MUI fallback rule and matches the M3 docs at
 * https://m3.material.io/components/date-pickers/specs.
 *
 * Anatomy:
 *
 *   - trigger : the input-shaped surface that shows the formatted date
 *               and opens the calendar panel on click / Enter / Space
 *   - panel   : the floating calendar surface (surface-container-high
 *               by default, shape-xl 28dp by default per M3)
 *   - header  : the panel's "Select date" supporting line + selected-date
 *               headline
 *   - nav     : prev / next month buttons + month-year label
 *   - grid    : the 7-column day-of-week grid + day cells
 *   - day     : a single day cell — circular state-layer, primary
 *               selection paint when picked
 *   - actions : Cancel / OK buttons in the panel footer
 *
 * The selected-day indicator morphs from `shape-xs` to the picker's
 * `shape` token via a shared `layoutId` motion span — the same M3
 * Expressive selection morph used by Tabs / Stepper / Pagination /
 * Data Grid. Day cells default to `shape-full` (circular) per the
 * canonical M3 date-picker docs.
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
 *   - Panel open / close                     : `springs.springy`
 *                                              + scale + opacity
 *   - Selected-day shape morph + slide       : `springs.springy`
 *   - Month transition (prev/next)           : `tweens.standard`
 *   - State-layer opacity                    : `short4` / `standard`
 */

/**
 * DatePicker paint variant. Drives the trigger surface and the panel
 * surface tinting. The panel is always `surface-container-high` per
 * M3 spec; the trigger surface follows the variant.
 *
 *   - filled   : `surface-container-highest` trigger (M3 default)
 *   - tonal    : `secondary-container` trigger
 *   - outlined : 1dp `outline` border, transparent trigger
 *   - text     : transparent trigger, only the label paints
 *   - elevated : `surface-container-low` + elevation-1 trigger
 */
export type DatePickerVariant =
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
export type DatePickerSize = "sm" | "md" | "lg";

/**
 * Panel + day-selection corner shape. The selected-day indicator
 * morphs from `shape-xs` to this shape via a shared `layoutId` motion
 * span. Defaults to `xl` to match M3 Expressive (28dp panel,
 * circular day) — `full` keeps the M3 canonical circular day cell.
 */
export type DatePickerShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Resolved per-day state. */
export type DatePickerDayState =
  | "default"
  | "hover"
  | "focus"
  | "pressed"
  | "selected"
  | "today"
  | "disabled";

type DatePickerOwnKey =
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

export interface DatePickerProps
  extends Omit<HTMLMotionProps<"div">, DatePickerOwnKey> {
  /** Controlled selected date. Use `null` for "no selection". */
  value?: Date | null;
  /** Initial selected date when uncontrolled. */
  defaultValue?: Date | null;
  /** Fires whenever the user picks a date and confirms with OK. */
  onValueChange?: (next: Date | null) => void;
  /** Controlled panel-open flag. */
  open?: boolean;
  /** Initial panel-open flag when uncontrolled. */
  defaultOpen?: boolean;
  /** Fires whenever the panel toggles. */
  onOpenChange?: (next: boolean) => void;
  /** Paint variant. Defaults to `filled`. */
  variant?: DatePickerVariant;
  /** Trigger + day-cell density. Defaults to `md`. */
  size?: DatePickerSize;
  /** Panel + selection-indicator shape. Defaults to `xl` (28dp). */
  shape?: DatePickerShape;
  /** Floating label text inside the trigger. */
  label?: ReactNode;
  /** Supporting text rendered beneath the trigger. */
  supportingText?: ReactNode;
  /** Placeholder when the value is null. Defaults to "MM/DD/YYYY". */
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
