import type {
  BadgeAnchorOrigin,
  BadgeOverlap,
  BadgeSize,
  BadgeVariant,
} from "./types";

/**
 * Badge anatomy. M3 Expressive characteristic = scale-in entrance + a
 * shape morph from circle (sm/dot) to pill (md/lg/label) governed by
 * the medium2 (300ms) emphasized easing token. State layer mirrors the
 * input library so an interactive badge can paint hover 0.08, focus
 * 0.10, pressed 0.10 layers of the on-color role.
 *
 * MUI fallback re-skinned with M3 tokens (M3 doesn't fully spec a
 * variant/state matrix for Badge; see app_spec.txt).
 */
export const anatomy = {
  /** Wrapper that contains the anchored target + the absolutely-positioned badge. */
  wrapper: "relative inline-flex shrink-0 align-middle",
  /** Inline standalone badge container (no target). */
  standalone: "inline-flex shrink-0 align-middle",
  /** Visible badge surface (label / dot). */
  badge: [
    "relative inline-flex items-center justify-center",
    "overflow-hidden whitespace-nowrap select-none font-medium",
    "transition-[box-shadow,background-color,border-color,color,opacity,transform]",
    "duration-medium2 ease-emphasized origin-center",
  ].join(" "),
  /** Adds the absolute anchor positioning when wrapping a child target. */
  badgeAnchored: "absolute z-[1]",
  /** Lets clicks pass through the badge to a wrapped (clickable) target. */
  badgePassThrough: "pointer-events-none",
  /** Re-enable interaction for an interactive badge. */
  badgeInteractive: [
    "outline-none cursor-pointer pointer-events-auto",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  badgeDisabled: "opacity-[0.38] cursor-not-allowed",
  /** Render-suppressed (M3 invisible transition). */
  badgeInvisible: "scale-0 opacity-0",
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center leading-none",
  iconLeading: "relative z-[1] inline-flex shrink-0 items-center justify-center",
  iconTrailing: "relative z-[1] inline-flex shrink-0 items-center justify-center",
} as const;

export const variantClasses: Record<
  BadgeVariant,
  { rest: string; selected: string; stateLayer: string }
> = {
  filled: {
    rest: "bg-error text-on-error",
    selected: "bg-on-error text-error",
    stateLayer: "bg-on-error",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-on-secondary-container text-secondary-container",
    stateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface border border-outline",
    selected: "bg-secondary-container text-on-secondary-container border border-outline",
    stateLayer: "bg-on-surface",
  },
  elevated: {
    rest: "bg-surface-container-high text-on-surface shadow-elevation-1",
    selected: "bg-secondary-container text-on-secondary-container shadow-elevation-1",
    stateLayer: "bg-on-surface",
  },
};

/**
 * Sizes. sm = M3 small badge (dot), md = M3 large badge (single
 * digit / icon), lg = M3 large badge (multi-char / icon + label).
 * Heights match the M3 spec: 6dp / 16dp / 24dp.
 */
export const sizeClasses: Record<
  BadgeSize,
  { container: string; text: string; gap: string; iconBox: string; minWidth: string }
> = {
  sm: {
    // 8dp circle (slightly larger than M3's 6dp for legibility on hi-dpi).
    container: "h-2 w-2 px-0",
    text: "",
    gap: "",
    iconBox: "",
    minWidth: "min-w-2",
  },
  md: {
    // 16dp tall, 6dp horizontal padding (label-s / 11px).
    container: "h-4 px-1.5 text-label-s",
    text: "text-label-s",
    gap: "gap-0.5",
    iconBox: "h-3 w-3",
    minWidth: "min-w-4",
  },
  lg: {
    // 24dp tall, 8dp horizontal padding (label-m / 12px) — leading icons.
    container: "h-6 px-2 text-label-m",
    text: "text-label-m",
    gap: "gap-1",
    iconBox: "h-4 w-4",
    minWidth: "min-w-6",
  },
};

/**
 * Shape: dots are circles (shape-full); label badges are pills
 * (shape-full at md/lg too — the pill morph keeps the corner radius
 * = height/2).
 */
export const shapeClasses: Record<BadgeSize, string> = {
  sm: "rounded-shape-full",
  md: "rounded-shape-full",
  lg: "rounded-shape-full",
};

/**
 * Anchor offsets. The badge sits at the named corner and translates
 * by 50% so half overflows the target. Circular `overlap` shifts the
 * anchor inward by ~14% (≈ 1 - cos45°) so the badge lands cleanly on
 * the diagonal of an Avatar / circular surface.
 */
export const anchorClasses: Record<
  BadgeAnchorOrigin,
  Record<BadgeOverlap, { position: string; transform: string }>
> = {
  "top-right": {
    rectangular: {
      position: "top-0 right-0",
      transform: "translate-x-1/2 -translate-y-1/2",
    },
    circular: {
      position: "top-[14%] right-[14%]",
      transform: "translate-x-1/2 -translate-y-1/2",
    },
  },
  "top-left": {
    rectangular: {
      position: "top-0 left-0",
      transform: "-translate-x-1/2 -translate-y-1/2",
    },
    circular: {
      position: "top-[14%] left-[14%]",
      transform: "-translate-x-1/2 -translate-y-1/2",
    },
  },
  "bottom-right": {
    rectangular: {
      position: "bottom-0 right-0",
      transform: "translate-x-1/2 translate-y-1/2",
    },
    circular: {
      position: "bottom-[14%] right-[14%]",
      transform: "translate-x-1/2 translate-y-1/2",
    },
  },
  "bottom-left": {
    rectangular: {
      position: "bottom-0 left-0",
      transform: "-translate-x-1/2 translate-y-1/2",
    },
    circular: {
      position: "bottom-[14%] left-[14%]",
      transform: "-translate-x-1/2 translate-y-1/2",
    },
  },
};

/**
 * Clamp numeric content to `${max}+`. Returns the original value when
 * content isn't a number or when below the cap.
 */
export const clampContent = (
  content: unknown,
  max: number,
): unknown => {
  if (typeof content === "number") {
    return content > max ? `${max}+` : content;
  }
  return content;
};
