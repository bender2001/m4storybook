import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

/**
 * MUI-fallback Avatar re-skinned with M3 tokens. Color treatment:
 *   - filled    : primary-container / on-primary-container
 *   - tonal     : tertiary-container / on-tertiary-container
 *   - outlined  : transparent + 1dp outline, on-surface text
 *   - elevated  : surface-container-low + elevation-1
 */
export type AvatarVariant = "filled" | "tonal" | "outlined" | "elevated";

export type AvatarSize = "sm" | "md" | "lg";

/**
 * M3 shape morph for avatars. `circular` is the M3 default; `rounded`
 * uses the medium shape token (12dp); `square` falls back to the no-
 * shape token. When the avatar is interactive AND circular, hovering
 * morphs the container to `rounded` for the M3 Expressive bounce.
 */
export type AvatarShape = "circular" | "rounded" | "square";

/**
 * Optional presence indicator rendered as a small dot in the corner
 * of the avatar. Mirrors the M3 contact-status pattern.
 */
export type AvatarStatus = "online" | "away" | "busy" | "offline";

type AvatarOwnKey =
  | "variant"
  | "size"
  | "shape"
  | "src"
  | "alt"
  | "children"
  | "interactive"
  | "disabled"
  | "status"
  | "aria-label";

export interface AvatarProps
  extends Omit<HTMLMotionProps<"div">, "ref" | AvatarOwnKey> {
  variant?: AvatarVariant;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Image source. Falls back to children when the image fails to load. */
  src?: string;
  /** Image alt text. Required when `src` is set. */
  alt?: string;
  /** Initials, icon, or any custom node. Rendered when no image. */
  children?: ReactNode;
  /** Renders the root as a focusable button-style affordance. */
  interactive?: boolean;
  /** Block all interaction; reads as aria-disabled. */
  disabled?: boolean;
  /** Optional presence indicator. */
  status?: AvatarStatus;
  /** Accessible label override (defaults to alt or initials). */
  "aria-label"?: string;
}
