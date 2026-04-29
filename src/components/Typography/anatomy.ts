import type { ElementType } from "react";
import type {
  TypographyEmphasis,
  TypographySize,
  TypographyVariant,
} from "./types";

/**
 * Typography anatomy. M3 type roles drive every visible token:
 *  - fontSize / lineHeight / letterSpacing / fontWeight come from the
 *    Tailwind `text-{role}` class which is the single source of
 *    truth (mirrored from src/tokens/typography.ts).
 *  - color comes from the emphasis matrix (`on-surface`,
 *    `on-surface-variant`, `primary`, `error`, `inverse-on-surface`).
 *  - inline icon slots render as 16dp boxes adjacent to the text run.
 */
export const anatomy = {
  /** Root text element shared by every variant. */
  root: [
    "inline-flex items-baseline gap-1",
    "transition-[color,opacity] duration-short4 ease-standard",
  ].join(" "),
  /** Block root used for display/headline/title/body. */
  rootBlock: [
    "block",
    "transition-[color,opacity] duration-short4 ease-standard",
  ].join(" "),
  /** Inline icon slot. */
  icon: "inline-flex h-[1em] w-[1em] shrink-0 items-center justify-center",
  /** Single-line truncation. */
  truncate: "truncate",
} as const;

/**
 * Variant × size → M3 type role. Drives the `text-{role}` Tailwind
 * class which carries fontSize, lineHeight, letterSpacing, weight.
 */
export const variantSizeToRole: Record<
  TypographyVariant,
  Record<TypographySize, string>
> = {
  display: { sm: "display-s", md: "display-m", lg: "display-l" },
  headline: { sm: "headline-s", md: "headline-m", lg: "headline-l" },
  title: { sm: "title-s", md: "title-m", lg: "title-l" },
  body: { sm: "body-s", md: "body-m", lg: "body-l" },
  label: { sm: "label-s", md: "label-m", lg: "label-l" },
};

/**
 * Tailwind v3 only scans static class literals, so the 15 type-role
 * classes need to live as a literal map. A computed `text-${role}`
 * would silently get purged from the production CSS for any role
 * not already referenced elsewhere in the project (e.g. text-title-l
 * is not used by any other component, so it would never ship without
 * this map). Keep this in sync with `variantSizeToRole`.
 */
export const typeRoleClassMap: Record<
  TypographyVariant,
  Record<TypographySize, string>
> = {
  display: {
    sm: "text-display-s",
    md: "text-display-m",
    lg: "text-display-l",
  },
  headline: {
    sm: "text-headline-s",
    md: "text-headline-m",
    lg: "text-headline-l",
  },
  title: { sm: "text-title-s", md: "text-title-m", lg: "text-title-l" },
  body: { sm: "text-body-s", md: "text-body-m", lg: "text-body-l" },
  label: { sm: "text-label-s", md: "text-label-m", lg: "text-label-l" },
};

/** Tailwind class for the resolved type role. */
export const typeRoleClass = (variant: TypographyVariant, size: TypographySize) =>
  typeRoleClassMap[variant][size];

/** Default semantic element per variant. Overridable via `as`. */
export const defaultTagForVariant: Record<TypographyVariant, ElementType> = {
  display: "h1",
  headline: "h2",
  title: "h3",
  body: "p",
  label: "span",
};

/** Color emphasis matrix. */
export const emphasisColor: Record<TypographyEmphasis, string> = {
  default: "text-on-surface",
  muted: "text-on-surface-variant",
  primary: "text-primary",
  error: "text-error",
  inverse: "text-inverse-on-surface",
};

/** Text alignment. */
export const alignClass: Record<
  NonNullable<"start" | "center" | "end" | "justify">,
  string
> = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
  justify: "text-justify",
};
