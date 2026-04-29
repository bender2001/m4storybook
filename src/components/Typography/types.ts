import type { ElementType, HTMLAttributes, ReactNode } from "react";

/**
 * M3 type categories. Each category resolves to three sizes (s / m / l)
 * via the `size` prop, giving the full 15-role M3 type scale:
 *  - display  : display-s / display-m / display-l
 *  - headline : headline-s / headline-m / headline-l
 *  - title    : title-s / title-m / title-l
 *  - body     : body-s / body-m / body-l
 *  - label    : label-s / label-m / label-l
 */
export type TypographyVariant =
  | "display"
  | "headline"
  | "title"
  | "body"
  | "label";

/** Size modifier inside a variant category. */
export type TypographySize = "sm" | "md" | "lg";

/**
 * Color emphasis. M3 typography does not have filled/tonal/outlined
 * container variants (it has no container), so we expose the
 * equivalent dimension as on-surface color emphasis.
 *  - default : on-surface (default body/headline color)
 *  - muted   : on-surface-variant (caption / supporting text)
 *  - primary : primary (brand emphasis)
 *  - error   : error (form / validation messaging)
 *  - inverse : inverse-on-surface (text on inverse surfaces)
 */
export type TypographyEmphasis =
  | "default"
  | "muted"
  | "primary"
  | "error"
  | "inverse";

type TypographyOwnKey =
  | "variant"
  | "size"
  | "emphasis"
  | "as"
  | "leadingIcon"
  | "trailingIcon"
  | "truncate"
  | "selected"
  | "disabled"
  | "align"
  | "children";

export interface TypographyProps
  extends Omit<HTMLAttributes<HTMLElement>, TypographyOwnKey> {
  /** M3 type category. Defaults to `body`. */
  variant?: TypographyVariant;
  /** Size within the category. Defaults to `md`. */
  size?: TypographySize;
  /** Color emphasis role. Defaults to `default` (on-surface). */
  emphasis?: TypographyEmphasis;
  /** Polymorphic element override. Defaults to the variant's semantic tag. */
  as?: ElementType;
  /** Optional leading inline icon. */
  leadingIcon?: ReactNode;
  /** Optional trailing inline icon. */
  trailingIcon?: ReactNode;
  /** Truncate to a single line with an ellipsis. */
  truncate?: boolean;
  /** Selected emphasis (overrides emphasis to primary). */
  selected?: boolean;
  /** Disabled state (38% opacity per M3). */
  disabled?: boolean;
  /** Text alignment. */
  align?: "start" | "center" | "end" | "justify";
  /** Inline content. */
  children?: ReactNode;
}
