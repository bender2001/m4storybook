import type { ReactNode } from "react";
import type { HTMLMotionProps } from "motion/react";

/**
 * M3 Expressive FAB (Floating Action Button) sizes follow the spec
 * at https://m3.material.io/components/floating-action-button/specs.
 *
 * - sm  → Small FAB:   40dp container, shape-md (12dp), 24dp icon
 * - md  → Default FAB: 56dp container, shape-lg (16dp), 24dp icon
 * - lg  → Large FAB:   96dp container, shape-xl (28dp), 36dp icon
 *
 * The Extended FAB (rectangular, icon + label) is available as a
 * separate render path triggered by passing a `label` prop with
 * size="md".
 */
export type FabSize = "sm" | "md" | "lg";

/**
 * FAB color variants. M3 specifies four container roles; the
 * `surface` variant is the standard low-emphasis FAB, while the
 * primary/secondary/tertiary variants paint with the corresponding
 * container role for higher emphasis.
 */
export type FabVariant = "surface" | "primary" | "secondary" | "tertiary";

export interface FabProps
  extends Omit<
    HTMLMotionProps<"button">,
    "ref" | "children" | "type"
  > {
  /** Visual color role. Defaults to `primary` (the M3 default emphasis). */
  variant?: FabVariant;
  /** Container size — small (40dp), default (56dp), or large (96dp). */
  size?: FabSize;
  /**
   * Icon node rendered inside the FAB. Pass an SVG; the component
   * sizes it to 24/24/36dp via the icon slot.
   */
  icon: ReactNode;
  /**
   * Optional label. When provided with size="md", renders as the
   * Extended FAB (rectangular pill with icon + label). For sm/lg
   * the label is treated as an aria-label only.
   */
  label?: ReactNode;
  /**
   * When true, lowers the FAB to elevation level 1 (used when the
   * FAB sits over a colored surface). M3 spec calls this the
   * "lowered" treatment.
   */
  lowered?: boolean;
  /** Disables interaction and fades the container per M3 spec. */
  disabled?: boolean;
  /** Native button type. Defaults to "button". */
  type?: "button" | "submit" | "reset";
  /** Accessible label override (required when no visible label). */
  "aria-label"?: string;
}
