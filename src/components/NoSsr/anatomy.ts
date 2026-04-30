import type { NoSsrShape, NoSsrSize, NoSsrVariant } from "./types";

/**
 * No SSR anatomy + M3 token bindings.
 *
 * MUI's `<NoSsr />` (https://mui.com/material-ui/react-no-ssr/) is a
 * deferred-render utility that mounts its children only on the client,
 * optionally yielding to the browser before commit via the `defer` prop.
 * M3 has no equivalent component, so we re-skin it as a surface-aware
 * deferred slot:
 *
 *   - The host paints an M3 surface role + on-surface foreground.
 *   - Three densities map to body-s / body-m / body-l type roles.
 *   - The full M3 7-token shape scale maps to `--shape-*`.
 *   - The pending fallback fades out and the deferred children fade in
 *     on the M3 `medium2` (300ms) duration with the `emphasized` easing.
 *
 * Spec sources:
 *   - MUI NoSsr          https://mui.com/material-ui/react-no-ssr/
 *   - M3 surface roles   https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 type scale      https://m3.material.io/styles/typography/type-scale-tokens
 *   - M3 elevation       https://m3.material.io/styles/elevation/tokens
 *   - M3 motion          https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 */
export const anatomy = {
  root: [
    "relative isolate flex w-full flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Header row — leading icon + label + trailing icon. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
  ].join(" "),
  /** Body slot (deferred children mount here). */
  body: "relative z-[1] w-full",
  /** Pending fallback slot — replaced by `body` once children mount. */
  fallback: "relative z-[1] flex w-full items-center text-on-surface-variant",
} as const;

type ColorBlock = {
  rest: string;
  selected: string;
  error: string;
  border: string;
  elevation: string;
  iconColor: string;
};

export const variantClasses: Record<NoSsrVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  filled: {
    rest: "bg-surface text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    iconColor: "text-on-surface-variant",
  },
};

type SizeBlock = {
  pad: string;
  gap: string;
  minH: string;
  bodyType: string;
  headerType: string;
};

export const sizeClasses: Record<NoSsrSize, SizeBlock> = {
  sm: {
    pad: "p-3",
    gap: "gap-2",
    minH: "min-h-[48px]",
    bodyType: "text-body-s leading-[20px]",
    headerType: "text-title-s",
  },
  md: {
    pad: "p-6",
    gap: "gap-3",
    minH: "min-h-[64px]",
    bodyType: "text-body-m leading-[20px]",
    headerType: "text-title-m",
  },
  lg: {
    pad: "p-10",
    gap: "gap-4",
    minH: "min-h-[80px]",
    bodyType: "text-body-l leading-[24px]",
    headerType: "text-title-l",
  },
};

export const shapeClasses: Record<NoSsrShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
