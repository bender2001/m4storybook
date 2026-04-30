import type { HTMLMotionProps } from "motion/react";
import type { ElementType, ReactNode, Ref } from "react";

/**
 * No SSR variants. MUI's `<NoSsr />` is a deferred-render utility that
 * skips its children during the server render and mounts them only on
 * the client. M3 has no equivalent component, so we re-skin it as a
 * surface-aware deferred slot whose host paints one of five M3 surface
 * roles while the deferred children are pending.
 *
 *   - text     : transparent host, on-surface text
 *   - filled   : surface, on-surface text (M3 default)
 *   - tonal    : secondary-container, on-secondary-container text
 *   - outlined : transparent + 1dp outline-variant border
 *   - elevated : surface-container-low + elevation-1 host
 */
export type NoSsrVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/**
 * Density. The deferred slot honours the same three-step density scale
 * the rest of the library uses so it can host text, icon rows, or full
 * deferred panels at the documented M3 type rhythm.
 *
 *   sm : body-s (12px) / 1.43 line / compact (48dp min-height)
 *   md : body-m (14px) / 1.5 line  / M3 default (64dp min-height)
 *   lg : body-l (16px) / 1.5 line  / spacious (80dp min-height)
 */
export type NoSsrSize = "sm" | "md" | "lg";

/** M3 corner shape token. */
export type NoSsrShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Source of the mount transition. Mirrors MUI's `defer` semantics. */
export type NoSsrDeferStrategy = "mount" | "idle" | "defer";

type NoSsrOwnKey =
  | "as"
  | "variant"
  | "size"
  | "shape"
  | "defer"
  | "strategy"
  | "fallback"
  | "selected"
  | "disabled"
  | "error"
  | "leadingIcon"
  | "trailingIcon"
  | "label"
  | "children"
  | "onMount"
  | "aria-label"
  | "ref";

export interface NoSsrProps
  extends Omit<HTMLMotionProps<"div">, NoSsrOwnKey> {
  /** Polymorphic render element. Defaults to `"section"`. */
  as?: ElementType;
  /** Forwarded ref typed loosely for polymorphic consumers. */
  ref?: Ref<HTMLElement>;
  /** Visual variant. Defaults to `filled`. */
  variant?: NoSsrVariant;
  /** Density. Defaults to `md`. */
  size?: NoSsrSize;
  /** Corner shape token. Defaults to `lg` (M3 expressive container). */
  shape?: NoSsrShape;
  /**
   * MUI parity prop. When true, schedules the children mount onto the
   * next animation frame so deferred work yields back to the browser
   * before painting. Defaults to `false` so the typical Storybook flow
   * mounts children synchronously after first commit.
   */
  defer?: boolean;
  /**
   * Deferred-render strategy.
   *   - `mount` : render children after first useEffect tick (MUI default)
   *   - `idle`  : wait for `requestIdleCallback` (or rAF fallback)
   *   - `defer` : wait one animation frame after mount
   *
   * Defaults to `mount`.
   */
  strategy?: NoSsrDeferStrategy;
  /** Optional placeholder rendered until children mount. */
  fallback?: ReactNode;
  /** Selected fill (M3 secondary-container). */
  selected?: boolean;
  /** Disabled wash + aria-disabled. */
  disabled?: boolean;
  /** Error treatment (error-container fill + aria-invalid). */
  error?: boolean;
  /** Optional leading icon rendered alongside the label slot. */
  leadingIcon?: ReactNode;
  /** Optional trailing icon rendered alongside the label slot. */
  trailingIcon?: ReactNode;
  /** Optional label slot — renders inline with the icon slots. */
  label?: ReactNode;
  /** Body content, mounted only after the deferred strategy resolves. */
  children?: ReactNode;
  /** Fires once the deferred children commit to the DOM. */
  onMount?: () => void;
  /** Accessible label override. */
  "aria-label"?: string;
}
