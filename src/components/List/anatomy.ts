import type { ListSize, ListVariant } from "./types";

/**
 * List anatomy. M3 spec
 * (https://m3.material.io/components/lists/specs):
 *  - Container fills with surface (transparent), surface-container
 *    (filled), or transparent + 1dp outline-variant border (outlined).
 *  - Items: 16dp horizontal padding, leading slot 24dp icon w/ 16dp
 *    gap to headline; trailing slot 16dp gap to headline column.
 *  - 1-line items: 56dp tall (48dp without leading), 2-line: 72dp,
 *    3-line: 88dp.
 *  - Headline: body-l, on-surface; supporting: body-m,
 *    on-surface-variant; overline: label-s, on-surface-variant.
 *  - Selected: secondary-container fill + on-secondary-container text.
 *  - State layers paint on-surface at 0.08 (hover) / 0.10 (focus,
 *    pressed) opacity per the M3 state-layer tokens.
 *
 * NOTE: The bracket utilities like `bg-on-surface/[0.08]` look right
 * but Tailwind v3 silently drops the slash-opacity modifier when the
 * color is a CSS variable. We instead paint the state layer as a
 * dedicated overlay span and animate its opacity with motion/react.
 */
export const anatomy = {
  root: [
    "flex flex-col w-full m-0 list-none p-0",
    "transition-[background-color,border-color] duration-short4 ease-standard",
  ].join(" "),
  item: [
    "relative isolate flex w-full items-center gap-4 select-none",
    "text-on-surface",
    "transition-[background-color,color] duration-short4 ease-standard",
  ].join(" "),
  itemInteractive: [
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  itemDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State layer overlay — opacity is driven by motion/react. */
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "bg-on-surface",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** State-layer color when an item is rendered in error mode. */
  stateLayerError: "bg-on-error-container",
  /** State-layer color when an item is rendered selected. */
  stateLayerSelected: "bg-on-secondary-container",
  leading: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  ].join(" "),
  /** Two-column layout: column 1 = overline+headline+supporting. */
  textColumn: [
    "relative z-[1] flex min-w-0 flex-1 flex-col items-start gap-0.5",
  ].join(" "),
  overline: "text-label-s text-on-surface-variant",
  headline: "text-body-l text-on-surface",
  supporting: "text-body-m text-on-surface-variant truncate",
  trailing: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "text-label-s text-on-surface-variant",
  ].join(" "),
} as const;

/**
 * Variant matrix — drives container fill, item state colors, and
 * border. Each entry returns the classes that the List/ListItem
 * compose with size + state classes.
 */
export const variantClasses: Record<
  ListVariant,
  { container: string; itemRest: string }
> = {
  standard: {
    container: "bg-transparent",
    itemRest: "bg-transparent",
  },
  filled: {
    container: "bg-surface-container rounded-shape-sm",
    itemRest: "bg-transparent",
  },
  outlined: {
    container: "border border-outline-variant rounded-shape-sm bg-transparent",
    itemRest: "bg-transparent",
  },
};

/**
 * Per-size container heights and supporting-text visibility. Padding
 * mirrors the M3 spec: 16dp horizontal across all sizes, vertical
 * padding scales so the item still vertically centers.
 */
export const sizeClasses: Record<
  ListSize,
  {
    minHeight: string;
    minHeightWithLeading: string;
    padding: string;
    paddingWithLeading: string;
    showSupporting: boolean;
    supportingClamp: string;
  }
> = {
  sm: {
    minHeight: "min-h-[48px]",
    minHeightWithLeading: "min-h-[56px]",
    padding: "px-4 py-2",
    paddingWithLeading: "px-4 py-2",
    showSupporting: false,
    supportingClamp: "line-clamp-1",
  },
  md: {
    minHeight: "min-h-[64px]",
    minHeightWithLeading: "min-h-[72px]",
    padding: "px-4 py-2.5",
    paddingWithLeading: "px-4 py-2.5",
    showSupporting: true,
    supportingClamp: "line-clamp-1",
  },
  lg: {
    minHeight: "min-h-[80px]",
    minHeightWithLeading: "min-h-[88px]",
    padding: "px-4 py-3",
    paddingWithLeading: "px-4 py-3",
    showSupporting: true,
    supportingClamp: "line-clamp-2",
  },
};

/**
 * Selected state paints the secondary-container fill + the
 * on-secondary-container text on the entire item box. M3 lists in
 * navigation contexts use this exact role mapping.
 */
export const selectedClasses = [
  "bg-secondary-container text-on-secondary-container",
].join(" ");

/**
 * Error state recolors headline + supporting + leading icon to the
 * error role; selected + error compose by letting selected win on
 * background and error win on text.
 */
export const errorClasses = "text-error";
