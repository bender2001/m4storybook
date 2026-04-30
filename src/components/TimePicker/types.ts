import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Time Picker.
 *
 * Re-skins MUI X TimePicker (https://mui.com/x/react-date-pickers/time-picker/)
 * onto M3 tokens — Material 3 has no formal Lab Time Picker JSON spec, so
 * this follows the project's MUI fallback rule and matches the M3 docs at
 * https://m3.material.io/components/time-pickers/specs.
 *
 * Anatomy:
 *
 *   - trigger : the input-shaped surface that shows the formatted time
 *               (HH:MM AM/PM) and opens the dial panel on click /
 *               Enter / Space
 *   - panel   : the floating clock surface (surface-container-high
 *               by default, shape-xl 28dp by default per M3)
 *   - header  : "Select time" supporting line + HH : MM time field
 *   - dial    : the analog clock face — a 256dp circle surface holding
 *               12 numeric labels; switches between hour / minute view
 *               via `mode`
 *   - hand    : the active selector (`bg-primary` blob with on-primary
 *               digit) connected to the dial center via a 1px stroke;
 *               morphs between positions via shared motion/react
 *               `layoutId`
 *   - actions : Cancel / OK buttons in the panel footer
 *
 * The selection blob morphs from `shape-xs` to the picker's `shape`
 * token via a shared `layoutId` motion span — the same M3 Expressive
 * selection morph used by DatePicker / Tabs / Stepper / Pagination /
 * Data Grid. Hour blob travels from hour-1 → hour-12 in 30° steps;
 * minute blob travels in 6° steps (snapped to 5-minute increments by
 * default).
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
 *   - Hand morph + slide                     : `springs.springy`
 *   - Hour ↔ minute mode swap                : `tweens.standard`
 *   - State-layer opacity                    : `short4` / `standard`
 */

/** TimePicker paint variant. */
export type TimePickerVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Trigger size + dial density.
 *
 *   - sm : 40dp trigger / 224dp dial
 *   - md : 56dp trigger / 256dp dial   (M3 default)
 *   - lg : 64dp trigger / 288dp dial
 */
export type TimePickerSize = "sm" | "md" | "lg";

/**
 * Panel + selection-blob corner shape. The selection blob morphs from
 * `shape-xs` to this shape via a shared `layoutId` motion span.
 * Defaults to `xl` to match M3 (28dp panel) — `full` keeps the
 * canonical circular blob.
 */
export type TimePickerShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Active dial mode: hours or minutes. */
export type TimePickerMode = "hours" | "minutes";

/**
 * 24-hour vs 12-hour clock format.
 *
 *   - 12 : 1..12 dial + AM/PM toggle (M3 default)
 *   - 24 : 0..23 dial, no toggle
 */
export type TimePickerHourCycle = 12 | 24;

/** Resolved per-cell state. */
export type TimePickerCellState =
  | "default"
  | "hover"
  | "focus"
  | "pressed"
  | "selected"
  | "disabled";

/** Selected time value. `hours` is 0..23, `minutes` is 0..59. */
export interface TimePickerValue {
  hours: number;
  minutes: number;
}

type TimePickerOwnKey =
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "mode"
  | "defaultMode"
  | "onModeChange"
  | "variant"
  | "size"
  | "shape"
  | "hourCycle"
  | "minuteStep"
  | "label"
  | "supportingText"
  | "placeholder"
  | "ariaLabel"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "formatTime";

export interface TimePickerProps
  extends Omit<HTMLMotionProps<"div">, TimePickerOwnKey> {
  /** Controlled selected time. Use `null` for "no selection". */
  value?: TimePickerValue | null;
  /** Initial selected time when uncontrolled. */
  defaultValue?: TimePickerValue | null;
  /** Fires whenever the user picks a time and confirms with OK. */
  onValueChange?: (next: TimePickerValue | null) => void;
  /** Controlled panel-open flag. */
  open?: boolean;
  /** Initial panel-open flag when uncontrolled. */
  defaultOpen?: boolean;
  /** Fires whenever the panel toggles. */
  onOpenChange?: (next: boolean) => void;
  /** Controlled active dial mode. */
  mode?: TimePickerMode;
  /** Initial dial mode when uncontrolled. Defaults to `hours`. */
  defaultMode?: TimePickerMode;
  /** Fires whenever the dial flips between hour / minute view. */
  onModeChange?: (next: TimePickerMode) => void;
  /** Paint variant. Defaults to `filled`. */
  variant?: TimePickerVariant;
  /** Trigger + dial density. Defaults to `md`. */
  size?: TimePickerSize;
  /** Panel + selection-blob shape. Defaults to `xl` (28dp). */
  shape?: TimePickerShape;
  /** 12 = AM/PM clock; 24 = 24-hour clock. Defaults to 12. */
  hourCycle?: TimePickerHourCycle;
  /**
   * Snap step for minute selection. Defaults to 5 — the canonical M3
   * dial shows 12 minute marks at 5-minute increments. Pass 1 for the
   * full 60-step minute dial.
   */
  minuteStep?: 1 | 5 | 10 | 15;
  /** Floating label text inside the trigger. */
  label?: ReactNode;
  /** Supporting text rendered beneath the trigger. */
  supportingText?: ReactNode;
  /** Placeholder when the value is null. Defaults to "HH:MM". */
  placeholder?: string;
  /** Accessible name for the trigger when there is no visible label. */
  ariaLabel?: string;
  /** Disables the entire picker (trigger and panel). */
  disabled?: boolean;
  /** Paints the trigger + supporting text in the M3 error role pair. */
  error?: boolean;
  /** Optional leading icon rendered inside the trigger surface. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon. Defaults to a clock glyph. */
  trailingIcon?: ReactNode;
  /** Formatter for the trigger value. Defaults to `HH:MM AM/PM`. */
  formatTime?: (value: TimePickerValue, hourCycle: TimePickerHourCycle) => string;
}
