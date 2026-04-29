import type { HTMLAttributes, ReactNode } from "react";

/**
 * M3 Expressive Accordion / Expansion Panel variants per
 * https://m3.material.io/components/expansion-panels and the surface
 * treatment matrix shared with Card / Paper.
 *   - elevated : surface-container-low + elevation-1 (resting),
 *                elevation-2 on hover
 *   - filled   : surface-container-highest, no elevation
 *   - outlined : surface + 1dp outline-variant border
 */
export type AccordionVariant = "elevated" | "filled" | "outlined";

/**
 * Accordion density. `sm` = 48dp header / 12dp gutter, `md` = 56dp /
 * 16dp (default), `lg` = 72dp / 24dp.
 */
export type AccordionSize = "sm" | "md" | "lg";

/**
 * M3 Expressive corner shape scale. Mirrors the Card scale so tokens
 * stay in sync; defaults to `md` (12dp).
 */
export type AccordionShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

type AccordionOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "multiple"
  | "expanded"
  | "defaultExpanded"
  | "onExpandedChange"
  | "children";

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, AccordionOwnKey> {
  variant?: AccordionVariant;
  size?: AccordionSize;
  shape?: AccordionShape;
  /** Allow more than one panel open at a time. Defaults to single. */
  multiple?: boolean;
  /** Controlled list of expanded panel ids. */
  expanded?: string[];
  /** Initial uncontrolled list of expanded panel ids. */
  defaultExpanded?: string[];
  /** Fires whenever the expanded set changes. */
  onExpandedChange?: (next: string[]) => void;
  children?: ReactNode;
}

type AccordionItemOwnKey =
  | "id"
  | "title"
  | "subhead"
  | "leadingIcon"
  | "trailingIcon"
  | "disabled"
  | "expanded"
  | "defaultExpanded"
  | "onChange"
  | "children";

export interface AccordionItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, AccordionItemOwnKey> {
  /** Stable id used by the parent Accordion to track expansion. */
  id?: string;
  /** Title slot — typeset as title-m per the M3 expansion-panel spec. */
  title: ReactNode;
  /** Optional subhead — typeset as body-m on-surface-variant. */
  subhead?: ReactNode;
  /** Optional leading visual (icon, avatar). */
  leadingIcon?: ReactNode;
  /** Override the trailing slot. Defaults to a chevron that rotates
   *  180deg on expand using the M3 emphasized easing. */
  trailingIcon?: ReactNode;
  /** Disable interaction + dim the surface to opacity 0.38. */
  disabled?: boolean;
  /** Standalone-mode controlled expanded flag (no parent Accordion). */
  expanded?: boolean;
  /** Standalone-mode default expanded flag. */
  defaultExpanded?: boolean;
  /** Standalone-mode change handler. */
  onChange?: (expanded: boolean) => void;
  /** Panel content rendered below the header on expand. */
  children?: ReactNode;
}
