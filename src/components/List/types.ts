import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

/**
 * M3 List variants.
 *  - standard : transparent container, items only paint state layers
 *               on interaction (the default M3 list).
 *  - filled   : surface-container fill behind the entire list (used
 *               for grouped settings, drawer rails).
 *  - outlined : 1dp outline-variant border around the list container,
 *               used to delineate sections inside surface flows.
 *
 * https://m3.material.io/components/lists/specs
 */
export type ListVariant = "standard" | "filled" | "outlined";

/**
 * List density / line scale per M3 spec.
 *  - sm : 1-line items, 56dp tall (48dp without leading slot)
 *  - md : 2-line items, 72dp tall — body-l headline + body-m supporting
 *  - lg : 3-line items, 88dp tall — supporting wraps to 2 lines
 */
export type ListSize = "sm" | "md" | "lg";

type ListOwnKey = "variant" | "size" | "children";

export interface ListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, ListOwnKey> {
  variant?: ListVariant;
  size?: ListSize;
  /** Renders an `<ol>` instead of `<ul>` for ordered lists. */
  ordered?: boolean;
  children?: ReactNode;
}

type ListItemOwnKey =
  | "variant"
  | "size"
  | "leading"
  | "trailing"
  | "headline"
  | "supportingText"
  | "overline"
  | "selected"
  | "disabled"
  | "error"
  | "as"
  | "children";

/**
 * A single list item. Renders as a static `<li>` by default. When
 * `onClick` (or `interactive`) is set, the inner row promotes to a
 * `<button>` row with a state layer (hover/focus/pressed) per the
 * M3 state-layer opacity tokens.
 */
export interface ListItemProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    ListItemOwnKey | "type"
  > {
  /** Per-item override; defaults to the parent List's variant. */
  variant?: ListVariant;
  /** Per-item override; defaults to the parent List's size. */
  size?: ListSize;
  /** Leading slot — typically an icon (24dp) or avatar. */
  leading?: ReactNode;
  /** Trailing slot — typically an icon, switch, or supporting label. */
  trailing?: ReactNode;
  /** Optional overline rendered above the headline (label-s). */
  overline?: ReactNode;
  /** Headline (body-l) — primary text. */
  headline: ReactNode;
  /** Supporting text (body-m) — only rendered for size md/lg. */
  supportingText?: ReactNode;
  /** Selected state — paints the M3 secondary-container highlight. */
  selected?: boolean;
  /** Disabled state — opacity 0.38 and pointer-events disabled. */
  disabled?: boolean;
  /** Paints the row in the error color role (text + leading icon). */
  error?: boolean;
  /** Forces the row to be interactive even without an onClick. */
  interactive?: boolean;
  children?: ReactNode;
}
