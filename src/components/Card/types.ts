import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * M3 Expressive Card variants per https://m3.material.io/components/cards/specs.
 * Three container treatments are defined in the spec:
 *   - elevated : surface-container-low + elevation-1 (resting),
 *                elevation-2 on hover
 *   - filled   : surface-container-highest, no elevation
 *   - outlined : surface + 1dp outline-variant border
 */
export type CardVariant = "elevated" | "filled" | "outlined";

/**
 * Card density. `sm` = compact (12dp interior padding), `md` =
 * default (16dp), `lg` = spacious (24dp). Mirrors the surface
 * density scale used across M3 Expressive components.
 */
export type CardSize = "sm" | "md" | "lg";

/**
 * M3 Expressive corner shape scale. Cards default to `md` (12dp) per
 * the spec for medium-emphasis surfaces. Interactive cards morph
 * one shape step up on hover/focus.
 */
export type CardShape = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

/**
 * Resting elevation level for the `elevated` variant. Maps to the M3
 * elevation token scale 0..5. Defaults to level 1; hovered cards
 * lift to level 2.
 */
export type CardElevation = 0 | 1 | 2 | 3 | 4 | 5;

type CardOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "elevation"
  | "interactive"
  | "selected"
  | "disabled"
  | "error"
  | "media"
  | "avatar"
  | "title"
  | "subhead"
  | "headerTrailing"
  | "actions"
  | "children"
  | "aria-label";

export interface CardProps
  extends Omit<HTMLMotionProps<"div">, "ref" | CardOwnKey> {
  variant?: CardVariant;
  size?: CardSize;
  shape?: CardShape;
  /** Resting elevation level for the `elevated` variant. */
  elevation?: CardElevation;
  /** Renders the card as a focusable affordance with state layer +
   *  M3 Expressive shape morph + lift on hover. Auto-enables when
   *  an `onClick` handler is supplied. */
  interactive?: boolean;
  /** Marks the card as selected (secondary-container fill + aria). */
  selected?: boolean;
  /** Disables interaction and dims the card to opacity 0.38. */
  disabled?: boolean;
  /** Paints the error-container fill + on-error-container text +
   *  error border so the card communicates a destructive state. */
  error?: boolean;
  /** Optional cover slot rendered above the header (image / video /
   *  custom node). Bleeds to the card edge — no interior padding. */
  media?: ReactNode;
  /** Optional avatar (or other leading visual) in the header row. */
  avatar?: ReactNode;
  /** Title slot — typeset as title-l per the M3 Card spec. */
  title?: ReactNode;
  /** Optional subhead — typeset as body-m on-surface-variant. */
  subhead?: ReactNode;
  /** Optional trailing slot in the header (icon button, menu, etc). */
  headerTrailing?: ReactNode;
  /** Optional action row rendered below the body (button group). */
  actions?: ReactNode;
  /** Supporting-text body. Renders below the header / above actions. */
  children?: ReactNode;
  /** Accessible label override (only used when interactive). */
  "aria-label"?: string;
}
