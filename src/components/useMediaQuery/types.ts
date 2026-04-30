import type { HTMLMotionProps } from "motion/react";
import type { ReactNode, Ref } from "react";

/**
 * useMediaQuery has no direct M3 spec — it is a MUI hook
 * (https://mui.com/material-ui/react-use-media-query/). We re-skin it as
 * a *responsive announcement panel* whose surface uses M3 surface roles,
 * elevation, and shape tokens. The companion `<MediaQuery>` component
 * subscribes to the query, fades the matched / unmatched body slots
 * through M3 Expressive motion, and reports the current match state
 * through `data-matches`.
 *
 *   - text     : transparent host, on-surface label (pure behaviour
 *                wrapper — pair with a parent surface)
 *   - filled   : `surface-container-highest` panel + on-surface label
 *   - tonal    : `secondary-container` panel + on-secondary-container label
 *   - outlined : transparent panel + 1dp `outline-variant` border
 *   - elevated : `surface-container-low` panel + elevation-2 shadow
 *                (M3 popover/menu surface elevation)
 */
export type UseMediaQueryVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. Mirrors the M3 menu / dialog density scale so the panel slots
 * into the same hosts as Click-Away Listener / Transitions.
 *
 *   sm : 12dp pad, 8dp gap, 56dp min-height (compact responsive cues)
 *   md : 16dp pad, 12dp gap, 72dp min-height (M3 default)
 *   lg : 24dp pad, 16dp gap, 96dp min-height (sheets / dialogs)
 */
export type UseMediaQuerySize = "sm" | "md" | "lg";

/** M3 corner shape token. Default `lg` (16dp, M3 menu/popover radius). */
export type UseMediaQueryShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/**
 * Options for the `useMediaQuery(query, options?)` hook. Mirrors the
 * MUI surface so consumers can drop in.
 */
export interface UseMediaQueryOptions {
  /**
   * Default match value used during SSR / before the first paint when
   * `window.matchMedia` is unavailable. Defaults to `false`.
   */
  defaultMatches?: boolean;
  /**
   * If true, skips the SSR-safe two-pass render and reads `matchMedia`
   * synchronously on first render. Defaults to `false`. Same semantics
   * as MUI: enable when the hook is only ever called in the browser.
   */
  noSsr?: boolean;
  /**
   * Optional `matchMedia` injection — useful for tests and SSR shims.
   * Defaults to `window.matchMedia`.
   */
  matchMedia?: (query: string) => MediaQueryList;
  /** Fires whenever the match state flips. */
  onChange?: (matches: boolean) => void;
}

type MediaQueryOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "query"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "matchedLabel"
  | "unmatchedLabel"
  | "matchedContent"
  | "unmatchedContent"
  | "defaultMatches"
  | "noSsr"
  | "matchMedia"
  | "onMatchChange"
  | "children"
  | "ref";

export interface MediaQueryProps
  extends Omit<HTMLMotionProps<"div">, MediaQueryOwnKey> {
  /** CSS media query string (e.g. "(min-width: 768px)"). */
  query: string;
  variant?: UseMediaQueryVariant;
  size?: UseMediaQuerySize;
  shape?: UseMediaQueryShape;
  /** Marks the panel as selected (M3 secondary-container fill + aria). */
  selected?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Error treatment: paints the host in error-container. */
  error?: boolean;
  /** Optional leading icon rendered alongside the header label. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the header label. */
  trailingIcon?: ReactNode;
  /** Optional header label slot. */
  label?: ReactNode;
  /** Sub-label rendered in the matched body slot. */
  matchedLabel?: ReactNode;
  /** Sub-label rendered in the unmatched body slot. */
  unmatchedLabel?: ReactNode;
  /** Content rendered when the query matches. */
  matchedContent?: ReactNode;
  /** Content rendered when the query does not match. */
  unmatchedContent?: ReactNode;
  /** Default match value used during SSR / first paint. */
  defaultMatches?: boolean;
  /** Skip SSR-safe two-pass render. */
  noSsr?: boolean;
  /** Injectable matchMedia (testing / SSR shim). */
  matchMedia?: (query: string) => MediaQueryList;
  /** Fires when the match state flips. */
  onMatchChange?: (matches: boolean) => void;
  /**
   * Render-prop or static body. When `children` is a function it
   * receives the current `matches` state and replaces the
   * matched/unmatched slots; otherwise the slots render normally.
   */
  children?: ReactNode | ((matches: boolean) => ReactNode);
  /** Forwarded ref. */
  ref?: Ref<HTMLDivElement>;
}
