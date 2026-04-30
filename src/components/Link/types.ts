import type {
  AnchorHTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

/**
 * MUI's Link has no dedicated M3 Expressive component spec; we re-skin
 * it with M3 tokens.
 *
 *   - text      : transparent host. Inline link affordance — paints
 *                 `primary`, underlines on hover by default. MUI default.
 *   - filled    : `surface-container-highest` pill host with `primary`
 *                 label. Reads as a tonal chip-link.
 *   - tonal     : `secondary-container` pill host with
 *                 `on-secondary-container` label.
 *   - outlined  : transparent host with a 1dp `outline-variant` border.
 *   - elevated  : `surface-container-low` host + elevation-1 shadow.
 */
export type LinkVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Mirrors the M3 chip / breadcrumb scale so a Link slots into
 * the same toolbars / hero shells.
 *
 *   sm : label-m (12dp), 24dp host height
 *   md : body-m  (14dp), 28dp host height (default)
 *   lg : body-l  (16dp), 36dp host height
 */
export type LinkSize = "sm" | "md" | "lg";

/**
 * Corner shape token. Default `full` so the chip-style hosts read as
 * pills; `none` collapses to plain inline text without a pill.
 */
export type LinkShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Underline policy. M3 type guidance recommends underlining link text
 * for a11y — `hover` (default) underlines on hover/focus, `always`
 * paints the underline at rest, `none` hides it entirely.
 */
export type LinkUnderline = "hover" | "always" | "none";

/** Mouse + keyboard activation events surfaced to consumers. */
export type LinkActivateEvent =
  | MouseEvent<HTMLAnchorElement>
  | KeyboardEvent<HTMLAnchorElement>;

type LinkOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "underline"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "external"
  | "onActivate";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, LinkOwnKey> {
  variant?: LinkVariant;
  size?: LinkSize;
  shape?: LinkShape;
  /** Underline behaviour. Defaults to `hover`. */
  underline?: LinkUnderline;
  /** Forces the M3 selected (current page) treatment. */
  selected?: boolean;
  /** Disables the link (no pointer events, dimmed to opacity 0.38). */
  disabled?: boolean;
  /** Paints the link in the M3 error-container surface. */
  error?: boolean;
  /** Optional leading 18dp icon glyph. */
  leadingIcon?: ReactNode;
  /** Optional trailing 18dp icon glyph (e.g. external-link arrow). */
  trailingIcon?: ReactNode;
  /**
   * Marks the link as opening an external resource. Sets
   * `target="_blank"` + `rel="noopener noreferrer"` automatically and
   * surfaces a default trailing `↗` glyph if no `trailingIcon` is set.
   */
  external?: boolean;
  /** Fires on click + Enter/Space activation. */
  onActivate?: (event: LinkActivateEvent) => void;
  children?: ReactNode;
}
