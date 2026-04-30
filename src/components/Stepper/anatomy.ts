import type {
  StepperOrientation,
  StepperShape,
  StepperSize,
  StepperVariant,
} from "./types";

/**
 * Stepper anatomy + token bindings.
 *
 * Spec references (re-skinned MUI Stepper onto M3):
 *   - MUI Stepper             https://mui.com/material-ui/react-stepper/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * The active-step container morphs `shape-full` -> selected `shape`
 * token via motion/react springs (the same M3 Expressive selection
 * pattern used by Pagination + Navigation Rail). Connector segments
 * fill `outline-variant` -> `primary` via a width/height transition.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer `<ol>` host. */
  root: [
    "relative isolate flex w-full",
    "outline-none",
    "transition-[background-color,box-shadow,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Wrapper around a single step (icon + label + connector). */
  step: [
    "relative inline-flex shrink-0",
    "outline-none",
  ].join(" "),
  /**
   * Step button host. In linear mode, only completed + active steps
   * receive a real `<button>`; upcoming steps render a `<div>`.
   */
  button: [
    "relative inline-flex shrink-0 items-center select-none",
    "border-0 bg-transparent outline-none",
    "transition-[color] duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "rounded-shape-sm",
  ].join(" "),
  /** Step icon wrap (paints the M3 Expressive squircle / circle). */
  icon: [
    "relative inline-flex shrink-0 items-center justify-center",
    "transition-[background-color,color,border-color,border-radius]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** State-layer overlay sitting on top of the icon container. */
  iconStateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Numeric / glyph container inside the icon. */
  iconGlyph: [
    "relative z-[1] inline-flex items-center justify-center",
    "leading-none",
  ].join(" "),
  /** Label column (paints `text-on-surface`). */
  labelStack: [
    "relative inline-flex flex-col items-start",
    "select-none",
  ].join(" "),
  /** Primary label text. */
  label: [
    "block whitespace-nowrap",
    "transition-[color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Optional / secondary description text. */
  description: [
    "block text-label-s text-on-surface-variant",
  ].join(" "),
  /** Connector line between adjacent steps. */
  connector: [
    "relative pointer-events-none",
    "overflow-hidden",
    "bg-outline-variant",
  ].join(" "),
  /** Connector progress fill (motion-driven). */
  connectorProgress: [
    "absolute inset-0 origin-left",
    "bg-primary",
  ].join(" "),
  /** Vertical-mode collapsible content beneath the active step. */
  content: [
    "block overflow-hidden",
    "text-body-m text-on-surface",
    "pl-[44px]",
  ].join(" "),
} as const;

interface VariantStyles {
  /** Outer host paint (only `elevated` paints a host surface). */
  host: string;
  /** Active-step container background + content color. */
  activeIcon: string;
  /** Active-step state-layer base color. */
  activeStateLayer: string;
  /** Completed-step container background + content color. */
  completedIcon: string;
  /** Completed-step state-layer base color. */
  completedStateLayer: string;
  /** Upcoming-step container background + content color. */
  upcomingIcon: string;
  /** Upcoming-step state-layer base color. */
  upcomingStateLayer: string;
  /** Optional border applied to upcoming/active icons (outlined variant). */
  outlinedActive: string;
  outlinedUpcoming: string;
  /** Active label color. */
  activeLabel: string;
  /** Upcoming label color. */
  upcomingLabel: string;
}

/** Variant matrix. */
export const variantClasses: Record<StepperVariant, VariantStyles> = {
  filled: {
    host: "bg-transparent",
    activeIcon: "bg-primary text-on-primary",
    activeStateLayer: "bg-on-primary",
    completedIcon: "bg-primary text-on-primary",
    completedStateLayer: "bg-on-primary",
    upcomingIcon: "bg-surface-variant text-on-surface-variant",
    upcomingStateLayer: "bg-on-surface-variant",
    outlinedActive: "",
    outlinedUpcoming: "",
    activeLabel: "text-on-surface",
    upcomingLabel: "text-on-surface-variant",
  },
  tonal: {
    host: "bg-transparent",
    activeIcon: "bg-secondary-container text-on-secondary-container",
    activeStateLayer: "bg-on-secondary-container",
    completedIcon: "bg-secondary-container text-on-secondary-container",
    completedStateLayer: "bg-on-secondary-container",
    upcomingIcon: "bg-surface-container-high text-on-surface-variant",
    upcomingStateLayer: "bg-on-surface-variant",
    outlinedActive: "",
    outlinedUpcoming: "",
    activeLabel: "text-on-surface",
    upcomingLabel: "text-on-surface-variant",
  },
  outlined: {
    host: "bg-transparent",
    activeIcon: "bg-transparent text-primary",
    activeStateLayer: "bg-primary",
    completedIcon: "bg-transparent text-primary",
    completedStateLayer: "bg-primary",
    upcomingIcon: "bg-transparent text-on-surface-variant",
    upcomingStateLayer: "bg-on-surface-variant",
    outlinedActive: "border border-primary",
    outlinedUpcoming: "border border-outline",
    activeLabel: "text-on-surface",
    upcomingLabel: "text-on-surface-variant",
  },
  text: {
    host: "bg-transparent",
    activeIcon: "bg-transparent text-primary",
    activeStateLayer: "bg-primary",
    completedIcon: "bg-transparent text-primary",
    completedStateLayer: "bg-primary",
    upcomingIcon: "bg-transparent text-on-surface-variant",
    upcomingStateLayer: "bg-on-surface-variant",
    outlinedActive: "",
    outlinedUpcoming: "",
    activeLabel: "text-on-surface",
    upcomingLabel: "text-on-surface-variant",
  },
  elevated: {
    host: "bg-surface-container-low rounded-shape-md p-4 shadow-elevation-1",
    activeIcon: "bg-primary text-on-primary",
    activeStateLayer: "bg-on-primary",
    completedIcon: "bg-primary text-on-primary",
    completedStateLayer: "bg-on-primary",
    upcomingIcon: "bg-surface-container-high text-on-surface-variant",
    upcomingStateLayer: "bg-on-surface-variant",
    outlinedActive: "",
    outlinedUpcoming: "",
    activeLabel: "text-on-surface",
    upcomingLabel: "text-on-surface-variant",
  },
};

interface SizeBlock {
  /** Step icon dimensions. */
  iconBox: string;
  /** Glyph type role (label-m / label-l / title-m). */
  glyph: string;
  /** Primary label type role. */
  label: string;
  /** Gap between the icon and the label stack. */
  iconLabelGap: string;
  /** Gap between adjacent steps along the main axis. */
  stepGap: string;
  /** Connector thickness (border width along the cross axis). */
  connectorThickness: string;
  /** Connector margin (away from icon edge). */
  connectorMargin: string;
}

/**
 * Density scale.
 *
 *   sm : 24dp icon / label-m
 *   md : 28dp icon / label-l   (M3 default)
 *   lg : 36dp icon / title-m
 */
export const sizeClasses: Record<StepperSize, SizeBlock> = {
  sm: {
    iconBox: "h-6 w-6",
    glyph: "text-label-m",
    label: "text-label-m",
    iconLabelGap: "gap-2",
    stepGap: "gap-2",
    connectorThickness: "h-[2px] min-w-[24px]",
    connectorMargin: "mx-2",
  },
  md: {
    iconBox: "h-7 w-7",
    glyph: "text-label-l",
    label: "text-label-l",
    iconLabelGap: "gap-3",
    stepGap: "gap-3",
    connectorThickness: "h-[2px] min-w-[32px]",
    connectorMargin: "mx-2",
  },
  lg: {
    iconBox: "h-9 w-9",
    glyph: "text-title-m",
    label: "text-title-m",
    iconLabelGap: "gap-4",
    stepGap: "gap-4",
    connectorThickness: "h-[2px] min-w-[40px]",
    connectorMargin: "mx-3",
  },
};

interface OrientationBlock {
  /** Outer flex direction. */
  flow: string;
  /** Single-step inner flex direction. */
  stepFlow: string;
  /** Connector axis sizing classes. */
  connectorAxis: string;
}

/** Orientation matrix. */
export const orientationClasses: Record<StepperOrientation, OrientationBlock> = {
  horizontal: {
    flow: "flex-row items-start",
    stepFlow: "flex-row items-center",
    connectorAxis: "h-[2px] flex-1 min-w-[16px]",
  },
  vertical: {
    flow: "flex-col items-stretch",
    stepFlow: "flex-row items-start",
    connectorAxis: "absolute left-[13px] top-[28px] h-[calc(100%-32px)] w-[2px] min-h-[24px]",
  },
};

/** Active-step morph target (rest is shape-full / circle). */
export const shapeClasses: Record<StepperShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Error wash applied to icon + label of a step in error state. Paints
 * the canonical M3 error / on-error role pair.
 */
export const errorClasses = {
  icon: "bg-error text-on-error",
  iconStateLayer: "bg-on-error",
  iconOutlined: "bg-transparent text-error border border-error",
  label: "text-error",
} as const;

/**
 * Disabled wash for a single step.
 */
export const stepDisabledClasses = "opacity-[0.38] cursor-not-allowed";
