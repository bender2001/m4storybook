import type {
  DividerOrientation,
  DividerSize,
  DividerVariant,
} from "./types";

/**
 * Divider anatomy. M3 (https://m3.material.io/components/divider/specs)
 * paints a 1dp rule at the outline-variant color role, with three
 * inset variants (full / inset / middle) and an optional inline
 * label slot. M3 Expressive adds emphasized thickness rules and a
 * smooth opacity fade-in via the standard easing token.
 */
export const anatomy = {
  /** Wrapper for a label-less rule — just the outline-variant line. */
  rule: [
    "block bg-outline-variant",
    "transition-[opacity,background-color] duration-short4 ease-standard",
  ].join(" "),
  /** Wrapper for a labelled divider (flex container with two rules). */
  labeledRoot: [
    "flex w-full items-center text-on-surface-variant",
    "transition-[opacity,color] duration-short4 ease-standard",
  ].join(" "),
  /** Vertical labelled root. */
  labeledRootVertical: [
    "flex h-full flex-col items-center text-on-surface-variant",
    "transition-[opacity,color] duration-short4 ease-standard",
  ].join(" "),
  /** Inline label container. */
  label: [
    "inline-flex shrink-0 items-center gap-1.5",
    "text-label-m font-medium leading-none",
  ].join(" "),
  /** Icon slot inside a labelled divider. */
  icon: "inline-flex h-4 w-4 shrink-0 items-center justify-center",
} as const;

/**
 * Inset matrix per M3 divider spec.
 *  - full   : zero inset
 *  - inset  : 16dp leading inset (mirrors list item icon gutter)
 *  - middle : 16dp inset on both sides
 */
export const variantInset: Record<
  DividerVariant,
  { horizontal: string; vertical: string }
> = {
  full: { horizontal: "", vertical: "" },
  inset: { horizontal: "ml-4", vertical: "mt-4" },
  middle: { horizontal: "mx-4", vertical: "my-4" },
};

/**
 * Thickness scale. M3 default is 1dp; the emphasized 2dp / 4dp rules
 * are reserved for hierarchy. Vertical dividers swap height/width.
 */
export const sizeClasses: Record<
  DividerSize,
  {
    horizontal: { thickness: string; padding: string };
    vertical: { thickness: string; padding: string };
  }
> = {
  sm: {
    horizontal: { thickness: "h-px", padding: "py-2" },
    vertical: { thickness: "w-px", padding: "px-2" },
  },
  md: {
    horizontal: { thickness: "h-0.5", padding: "py-3" },
    vertical: { thickness: "w-0.5", padding: "px-3" },
  },
  lg: {
    horizontal: { thickness: "h-1", padding: "py-4" },
    vertical: { thickness: "w-1", padding: "px-4" },
  },
};

/**
 * Resolve the gutter classes the labelled rules paint on the inset
 * side. The leading rule shrinks when label is start-aligned, etc.
 */
export const labelAlignToFlex: Record<"start" | "center" | "end", {
  leading: string;
  trailing: string;
  gap: string;
}> = {
  start: {
    leading: "w-4 flex-none",
    trailing: "flex-1",
    gap: "gap-3",
  },
  center: {
    leading: "flex-1",
    trailing: "flex-1",
    gap: "gap-3",
  },
  end: {
    leading: "flex-1",
    trailing: "w-4 flex-none",
    gap: "gap-3",
  },
};

/**
 * The orientation determines whether the rule paints horizontally
 * (block-level h-px) or vertically (inline-level w-px filling the
 * parent's height).
 */
export const orientationClasses: Record<
  DividerOrientation,
  { rule: string; root: string }
> = {
  horizontal: { rule: "w-full", root: "w-full" },
  vertical: { rule: "h-full self-stretch", root: "h-full" },
};
