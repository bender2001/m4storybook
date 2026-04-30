import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3-tokenized Stepper.
 *
 * MUI's `<Stepper />` (https://mui.com/material-ui/react-stepper/) has
 * no Material 3 spec, so the surface is re-skinned onto M3 navigation
 * tokens. Step icons paint as the M3 Expressive squircle selection
 * pattern shared with Pagination + Navigation Rail: the *active*
 * indicator morphs from `shape-full` (circle) to the selected `shape`
 * token while sitting on `bg-primary` / `text-on-primary` (or the
 * variant's role pair). Completed steps stay filled with a checkmark
 * glyph; upcoming steps render as an outlined / tonal circle in the
 * `surface-variant` family.
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
 *   - Active step shape morph    : `springs.springy`
 *   - Connector progress fill    : `medium2` (300 ms) / `emphasized`
 *   - Vertical content collapse  : `medium2` / `emphasized`
 */

/**
 * Stepper paint variant. Drives the active-step container surface, the
 * upcoming-step container surface, and the connector fill. All variants
 * share the same M3 squircle morph + spring + a11y wiring.
 *
 *   - filled   : primary / on-primary active (M3 default)
 *   - tonal    : secondary-container / on-secondary-container active
 *   - outlined : transparent active w/ outline-primary ring + text-primary
 *   - text     : no container, text-primary glyph only (low-emphasis)
 *   - elevated : surface-container-low host w/ elevation-1 + filled active
 */
export type StepperVariant =
  | "filled"
  | "tonal"
  | "outlined"
  | "text"
  | "elevated";

/**
 * Step icon density.
 *
 *   - sm : 24dp circle / label-m
 *   - md : 28dp circle / label-l   (M3 default)
 *   - lg : 36dp circle / title-m
 */
export type StepperSize = "sm" | "md" | "lg";

/**
 * Stepper layout axis.
 *
 *   - horizontal : icons sit in a row, connectors fill horizontally
 *   - vertical   : icons stack in a column, optional content expands
 *                  beneath the active step
 */
export type StepperOrientation = "horizontal" | "vertical";

/**
 * Active-step container shape (the morph target). Inactive icons stay
 * `shape-full` (circle); the active step morphs from circle to this
 * shape on activation, matching the M3 Expressive selection pattern
 * shared with Navigation Rail / Pagination.
 */
export type StepperShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** A single step descriptor. */
export interface StepperStep {
  /** Stable React key + DOM id seed. */
  key: string;
  /** Visible label. */
  label: ReactNode;
  /** Optional secondary description rendered beneath the label. */
  description?: ReactNode;
  /**
   * Custom icon for this step. Falls back to the 1-based index for
   * upcoming/active steps, and a checkmark for completed steps.
   */
  icon?: ReactNode;
  /** Marks the step as optional in the visible label. */
  optional?: ReactNode;
  /** Disables this step (cannot be navigated to in non-linear mode). */
  disabled?: boolean;
  /**
   * Marks the step as in error. Paints the icon + label with the
   * `error` / `on-error` role pair regardless of variant.
   */
  error?: boolean;
  /**
   * Body content rendered beneath the step in `vertical` mode. Ignored
   * when the stepper is `horizontal`.
   */
  content?: ReactNode;
}

type StepperOwnKey =
  | "steps"
  | "activeStep"
  | "defaultActiveStep"
  | "onStepChange"
  | "variant"
  | "size"
  | "orientation"
  | "shape"
  | "linear"
  | "alternativeLabel"
  | "disabled"
  | "ariaLabel"
  | "renderStepIcon";

export interface StepperProps
  extends Omit<HTMLMotionProps<"ol">, StepperOwnKey> {
  /** Ordered list of steps. */
  steps: StepperStep[];
  /** Controlled active step index (0-based). */
  activeStep?: number;
  /** Initial active step index when uncontrolled. Defaults to 0. */
  defaultActiveStep?: number;
  /** Fires whenever the active step changes (controlled + uncontrolled). */
  onStepChange?: (next: number, key: string) => void;
  /** Paint variant. Defaults to `filled`. */
  variant?: StepperVariant;
  /** Icon density. Defaults to `md`. */
  size?: StepperSize;
  /** Layout orientation. Defaults to `horizontal`. */
  orientation?: StepperOrientation;
  /** Active-step morph shape. Defaults to `md` (M3 squircle). */
  shape?: StepperShape;
  /**
   * Linear progression. When true, only the active step (and its
   * preceding completed peers) are interactive; future steps render as
   * `aria-disabled` regardless of their `disabled` flag. Defaults to
   * `true` (matches MUI's default).
   */
  linear?: boolean;
  /**
   * Render labels beneath the icon instead of next to it. Horizontal
   * only; ignored in vertical orientation. Defaults to `false`.
   */
  alternativeLabel?: boolean;
  /** Disables the entire stepper. */
  disabled?: boolean;
  /**
   * Accessible name for the `<ol>`. Used as the ARIA label for the
   * step list.
   */
  ariaLabel?: string;
  /** Render-prop hook for total customization of a step's icon glyph. */
  renderStepIcon?: (
    step: StepperStep,
    state: StepperStepState,
    index: number,
  ) => ReactNode;
}

/** Resolved per-step state used for icon + connector painting. */
export type StepperStepState =
  | "completed"
  | "active"
  | "upcoming"
  | "error"
  | "disabled";
