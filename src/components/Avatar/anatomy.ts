import type { AvatarShape, AvatarSize, AvatarStatus, AvatarVariant } from "./types";

/**
 * Avatar anatomy. M3 Expressive characteristic = shape morph on hover
 * for interactive circular avatars (circular ↔ rounded). The morph
 * animates over the medium2 (300ms) emphasized easing token, matching
 * the rest of the input library.
 *
 * MUI fallback re-skinned with M3 tokens (no first-class M3 spec for
 * Avatar, see app_spec.txt component selection rule).
 */
export const anatomy = {
  root: [
    "relative inline-flex select-none items-center justify-center",
    "overflow-hidden align-middle font-medium",
    "transition-[box-shadow,background-color,border-color,color,border-radius]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  rootInteractive: [
    "outline-none cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  rootDisabled: "opacity-[0.38] cursor-not-allowed",
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  image: [
    "absolute inset-0 h-full w-full object-cover",
  ].join(" "),
  fallback: [
    "relative z-[1] inline-flex items-center justify-center",
    "leading-none uppercase",
  ].join(" "),
  status: [
    "absolute right-0 bottom-0 z-[2]",
    "rounded-full ring-2 ring-surface",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
} as const;

export const variantClasses: Record<
  AvatarVariant,
  { rest: string; stateLayer: string }
> = {
  filled: {
    rest: "bg-primary-container text-on-primary-container",
    stateLayer: "bg-on-primary-container",
  },
  tonal: {
    rest: "bg-tertiary-container text-on-tertiary-container",
    stateLayer: "bg-on-tertiary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface border border-outline",
    stateLayer: "bg-on-surface",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface shadow-elevation-1",
    stateLayer: "bg-on-surface",
  },
};

/**
 * Sizes mirror the rest of the input set: 32 / 40 / 56dp.
 * Status-dot diameter scales with the avatar so the ratio stays at
 * roughly 25% (M3 contact-status proportion).
 */
export const sizeClasses: Record<
  AvatarSize,
  { container: string; text: string; status: string }
> = {
  sm: {
    container: "h-8 w-8 text-label-m",
    text: "text-label-m",
    status: "h-2 w-2",
  },
  md: {
    container: "h-10 w-10 text-label-l",
    text: "text-label-l",
    status: "h-2.5 w-2.5",
  },
  lg: {
    container: "h-14 w-14 text-title-m",
    text: "text-title-m",
    status: "h-3.5 w-3.5",
  },
};

/**
 * M3 shape mapping. `circular` is the M3 default. The "morph" target
 * for an interactive circular avatar is `rounded` (shape-md = 12dp).
 */
export const shapeClasses: Record<AvatarShape, string> = {
  circular: "rounded-shape-full",
  rounded: "rounded-shape-md",
  square: "rounded-shape-none",
};

export const morphTarget: Record<AvatarShape, string> = {
  circular: "rounded-shape-md",
  rounded: "rounded-shape-md",
  square: "rounded-shape-none",
};

/**
 * Presence colors. M3 mirrors the Material/Google contact pattern:
 * green = online, amber = away, red/error = busy, neutral = offline.
 */
export const statusClasses: Record<AvatarStatus, string> = {
  online: "bg-[#16a34a]",
  away: "bg-[#d97706]",
  busy: "bg-error",
  offline: "bg-outline",
};

/**
 * Render the human-readable initials (first two non-space characters,
 * uppercased) from a name string. Used when a parent passes an alt
 * but no children — the alt becomes the fallback initials.
 */
export const deriveInitials = (source: string | undefined): string => {
  if (!source) return "";
  const trimmed = source.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
