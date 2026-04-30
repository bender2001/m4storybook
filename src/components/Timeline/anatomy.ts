import type {
  TimelineConnectorVariant,
  TimelineDotColor,
  TimelineDotVariant,
  TimelineShape,
  TimelineSize,
  TimelineVariant,
} from "./types";

/**
 * Timeline anatomy + token bindings.
 *
 * Spec references (re-skinned MUI Lab Timeline onto M3):
 *   - MUI Timeline            https://mui.com/material-ui/react-timeline/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *
 * The active-dot cursor is a shared `layoutId` motion span that
 * springs between focused dots. Its shape is always a circle
 * (`shape-full`) — the M3 Expressive selection morph used by Tabs /
 * Stepper / Pagination / DataGrid / TreeView.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer wrapper around the timeline. Paints variant surface + radius. */
  wrapper: [
    "relative isolate w-full overflow-hidden",
    "outline-none",
    "transition-[background-color,box-shadow,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:outline-none",
  ].join(" "),
  /** The `role="list"` host (the actual UL). */
  list: [
    "relative w-full",
    "outline-none m-0 p-0 list-none",
    "flex flex-col",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** A single timeline item (the LI). */
  item: [
    "relative isolate flex w-full items-stretch",
    "outline-none",
    "min-h-[64px]",
  ].join(" "),
  /** Left layout: opposite | separator | content. */
  itemLeft: ["flex-row"].join(" "),
  /** Right layout: content | separator | opposite. */
  itemRight: ["flex-row-reverse"].join(" "),
  /** Disabled wash for a single row. */
  itemDisabled: "opacity-[0.38] cursor-not-allowed",
  /** Opposite content slot (timestamp / metadata). */
  oppositeContent: [
    "relative z-[1] flex-1 min-w-0",
    "flex flex-col text-on-surface-variant",
    "py-2",
  ].join(" "),
  /** Vertical rail wrapper containing dot + connector. */
  separator: [
    "relative z-[1] flex shrink-0 flex-col items-center",
    "self-stretch",
  ].join(" "),
  /** Dot wrapper (paints background + outer ring). */
  dot: [
    "relative z-[2] inline-flex shrink-0 items-center justify-center",
    "rounded-shape-full",
    "outline-none",
    "transition-[background-color,box-shadow,border-color,color,transform]",
    "duration-short4 ease-standard",
  ].join(" "),
  /** Inline glyph slot inside the dot. */
  dotIcon: ["block leading-none"].join(" "),
  /** Connector stroke between dots. */
  connector: [
    "block w-[2px] flex-1 mt-1 mb-1",
    "transition-[background-color] duration-short4 ease-standard",
  ].join(" "),
  /** Active-dot cursor (halo that springs between focused dots). */
  cursor: [
    "pointer-events-none absolute z-[3]",
    "rounded-shape-full",
    "ring-2 ring-primary",
    "bg-transparent",
  ].join(" "),
  /** Content card (the actual event). */
  content: [
    "relative z-[1] flex-1 min-w-0",
    "transition-[background-color,color] duration-short4 ease-standard",
    "outline-none",
    "focus-visible:outline-none",
  ].join(" "),
  /** Interactive content affordance. */
  contentInteractive: ["cursor-pointer"].join(" "),
  /** Selected content paint. */
  contentSelected:
    "bg-secondary-container text-on-secondary-container",
  /** Error content foreground. */
  contentError: "text-error",
  /** State-layer overlay (animated opacity). */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-[1]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Label column (label + secondary stack). */
  labelStack: [
    "relative z-[2] flex min-w-0 flex-col",
  ].join(" "),
  /** Primary label text. */
  label: ["font-medium leading-snug text-current"].join(" "),
  /** Secondary text below the label. */
  secondary: [
    "text-body-s text-on-surface-variant leading-snug mt-1",
  ].join(" "),
} as const;

interface VariantStyles {
  /** Outer wrapper paint. */
  wrapper: string;
  /** Active-dot cursor ring color. */
  cursor: string;
  /** Selected content paint. */
  selected: string;
}

/** Variant matrix. */
export const variantClasses: Record<TimelineVariant, VariantStyles> = {
  text: {
    wrapper: "bg-transparent text-on-surface",
    cursor: "ring-primary",
    selected: "bg-secondary-container text-on-secondary-container",
  },
  filled: {
    wrapper: "bg-surface-container-highest text-on-surface",
    cursor: "ring-primary",
    selected: "bg-secondary-container text-on-secondary-container",
  },
  tonal: {
    wrapper: "bg-secondary-container text-on-secondary-container",
    cursor: "ring-secondary",
    selected: "bg-primary-container text-on-primary-container",
  },
  outlined: {
    wrapper:
      "bg-transparent text-on-surface border border-outline-variant",
    cursor: "ring-primary",
    selected: "bg-secondary-container text-on-secondary-container",
  },
  elevated: {
    wrapper:
      "bg-surface-container-low text-on-surface shadow-elevation-2",
    cursor: "ring-primary",
    selected: "bg-secondary-container text-on-secondary-container",
  },
};

interface SizeBlock {
  /** Dot diameter in px. */
  dotSize: number;
  /** Inner glyph size class (h/w). */
  dotGlyph: string;
  /** Body label type role. */
  labelType: string;
  /** Secondary label type role. */
  secondaryType: string;
  /** Vertical gap between rows. */
  rowGap: string;
  /** Horizontal gap between separator and content. */
  contentGap: string;
  /** Wrapper outer padding. */
  wrapperPadding: string;
  /** Content inner padding. */
  contentPadding: string;
  /** Cursor halo overall diameter in px. */
  cursorSize: number;
}

/**
 * Density scale. M3 default reads as `md` (28dp dot, body-m, 24dp gap).
 */
export const sizeClasses: Record<TimelineSize, SizeBlock> = {
  sm: {
    dotSize: 24,
    dotGlyph: "h-3 w-3",
    labelType: "text-body-s",
    secondaryType: "text-body-s",
    rowGap: "gap-y-2",
    contentGap: "gap-x-3",
    wrapperPadding: "p-2",
    contentPadding: "px-3 py-1.5",
    cursorSize: 32,
  },
  md: {
    dotSize: 28,
    dotGlyph: "h-3.5 w-3.5",
    labelType: "text-body-m",
    secondaryType: "text-body-s",
    rowGap: "gap-y-3",
    contentGap: "gap-x-4",
    wrapperPadding: "p-3",
    contentPadding: "px-4 py-2",
    cursorSize: 40,
  },
  lg: {
    dotSize: 36,
    dotGlyph: "h-4 w-4",
    labelType: "text-body-l",
    secondaryType: "text-body-m",
    rowGap: "gap-y-4",
    contentGap: "gap-x-5",
    wrapperPadding: "p-4",
    contentPadding: "px-5 py-3",
    cursorSize: 48,
  },
};

/** Wrapper + content shape mapping. */
export const shapeClasses: Record<TimelineShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

interface DotColorBlock {
  /** Filled dot background. */
  filledBg: string;
  /** Filled dot foreground (icon color). */
  filledFg: string;
  /** Outlined dot ring. */
  outlinedRing: string;
  /** Outlined dot foreground (icon color). */
  outlinedFg: string;
  /** Connector tint when this dot's row is the "active" rail color. */
  connectorTint: string;
}

/**
 * Per-dot color matrix. Mirrors MUI's TimelineDot colors and snaps each
 * dot to an M3 token pair.
 */
export const dotColorClasses: Record<TimelineDotColor, DotColorBlock> = {
  primary: {
    filledBg: "bg-primary",
    filledFg: "text-on-primary",
    outlinedRing: "ring-primary",
    outlinedFg: "text-primary",
    connectorTint: "bg-primary",
  },
  secondary: {
    filledBg: "bg-secondary",
    filledFg: "text-on-secondary",
    outlinedRing: "ring-secondary",
    outlinedFg: "text-secondary",
    connectorTint: "bg-secondary",
  },
  tertiary: {
    filledBg: "bg-tertiary",
    filledFg: "text-on-tertiary",
    outlinedRing: "ring-tertiary",
    outlinedFg: "text-tertiary",
    connectorTint: "bg-tertiary",
  },
  error: {
    filledBg: "bg-error",
    filledFg: "text-on-error",
    outlinedRing: "ring-error",
    outlinedFg: "text-error",
    connectorTint: "bg-error",
  },
  neutral: {
    filledBg: "bg-surface-container-highest",
    filledFg: "text-on-surface-variant",
    outlinedRing: "ring-outline-variant",
    outlinedFg: "text-on-surface-variant",
    connectorTint: "bg-outline-variant",
  },
};

/** Per-dot fill mode -> Tailwind classes. */
export function dotVariantClasses(
  variant: TimelineDotVariant,
  color: TimelineDotColor,
): string {
  const palette = dotColorClasses[color];
  if (variant === "outlined") {
    return [
      "bg-transparent",
      "ring-2 ring-inset",
      palette.outlinedRing,
      palette.outlinedFg,
    ].join(" ");
  }
  return [palette.filledBg, palette.filledFg].join(" ");
}

/** Per-connector emphasis class. */
export function connectorVariantClasses(
  variant: TimelineConnectorVariant,
  color: TimelineDotColor,
): string {
  const palette = dotColorClasses[color];
  switch (variant) {
    case "dashed":
      return [
        "bg-transparent",
        "border-l-2 border-dashed",
        "border-outline-variant",
        "w-0",
      ].join(" ");
    case "faded":
      return ["bg-outline-variant"].join(" ");
    case "solid":
    default:
      return [palette.connectorTint].join(" ");
  }
}
