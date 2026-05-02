import type {
  ButtonGroupButtonColor,
  ButtonGroupShape,
  ButtonGroupSize,
  ButtonGroupVariant,
  ButtonGroupWidth,
} from "./types";

export const anatomy = {
  root: "relative isolate select-none items-center",
  item: [
    "group relative inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0",
    "outline-none disabled:cursor-not-allowed",
    "focus-visible:z-[2] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  button: [
    "relative inline-flex w-full items-center justify-center overflow-hidden font-medium",
    "transition-[box-shadow,background-color,border-color,color,border-radius,width]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center",
  icon: "relative z-[1] inline-flex items-center justify-center",
} as const;

export const rootVariantClasses: Record<ButtonGroupVariant, string> = {
  standard: "inline-flex",
  connected: "flex w-full",
};

export const buttonActionColorClasses: Record<
  ButtonGroupButtonColor,
  {
    rest: string;
    stateLayer: string;
  }
> = {
  filled: {
    rest: [
      "bg-primary text-on-primary",
      "shadow-elevation-0 group-hover:shadow-elevation-1 group-active:shadow-elevation-0",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38] group-disabled:shadow-elevation-0",
    ].join(" "),
    stateLayer: "bg-on-primary",
  },
  tonal: {
    rest: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-0 group-hover:shadow-elevation-1 group-active:shadow-elevation-0",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38]",
    ].join(" "),
    stateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: [
      "border border-outline-variant bg-transparent text-on-surface-variant",
      "group-hover:border-primary",
      "group-disabled:border-on-surface/[0.12] group-disabled:text-on-surface/[0.38]",
    ].join(" "),
    stateLayer: "bg-on-surface-variant",
  },
  elevated: {
    rest: [
      "bg-surface-container-low text-primary shadow-elevation-1",
      "group-hover:shadow-elevation-2 group-active:shadow-elevation-1",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38] group-disabled:shadow-elevation-0",
    ].join(" "),
    stateLayer: "bg-primary",
  },
};

export const buttonToggleColorClasses: Record<
  ButtonGroupButtonColor,
  {
    rest: string;
    selected: string;
    restStateLayer: string;
    selectedStateLayer: string;
  }
> = {
  filled: {
    rest: [
      "bg-surface-container text-on-surface-variant",
      "shadow-elevation-0 group-hover:shadow-elevation-1 group-active:shadow-elevation-0",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38] group-disabled:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-primary text-on-primary",
      "shadow-elevation-0 group-hover:shadow-elevation-1 group-active:shadow-elevation-0",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38] group-disabled:shadow-elevation-0",
    ].join(" "),
    restStateLayer: "bg-on-surface-variant",
    selectedStateLayer: "bg-on-primary",
  },
  tonal: {
    rest: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-0 group-hover:shadow-elevation-1 group-active:shadow-elevation-0",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38]",
    ].join(" "),
    selected: [
      "bg-secondary text-on-secondary",
      "shadow-elevation-0 group-hover:shadow-elevation-1 group-active:shadow-elevation-0",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38]",
    ].join(" "),
    restStateLayer: "bg-on-secondary-container",
    selectedStateLayer: "bg-on-secondary",
  },
  outlined: {
    rest: [
      "border border-outline-variant bg-transparent text-on-surface-variant",
      "group-hover:border-primary",
      "group-disabled:border-on-surface/[0.12] group-disabled:text-on-surface/[0.38]",
    ].join(" "),
    selected: [
      "border border-inverse-surface bg-inverse-surface text-inverse-on-surface",
      "group-disabled:border-transparent group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38]",
    ].join(" "),
    restStateLayer: "bg-on-surface-variant",
    selectedStateLayer: "bg-inverse-on-surface",
  },
  elevated: {
    rest: [
      "bg-surface-container-low text-primary shadow-elevation-1",
      "group-hover:shadow-elevation-2 group-active:shadow-elevation-1",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38] group-disabled:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-primary text-on-primary shadow-elevation-1",
      "group-hover:shadow-elevation-2 group-active:shadow-elevation-1",
      "group-disabled:bg-on-surface/[0.12] group-disabled:text-on-surface/[0.38] group-disabled:shadow-elevation-0",
    ].join(" "),
    restStateLayer: "bg-primary",
    selectedStateLayer: "bg-on-primary",
  },
};

interface SizeSpec {
  height: number;
  hitTarget: number;
  standardSpace: number;
  connectedSpace: number;
  innerRadius: number;
  pressedInnerRadius: number;
  selectedInnerRadius: string;
  textClass: string;
  iconSize: string;
  minWidth: number;
  widths: Record<ButtonGroupWidth, number>;
}

export const sizeSpec: Record<ButtonGroupSize, SizeSpec> = {
  xs: {
    height: 32,
    hitTarget: 48,
    standardSpace: 18,
    connectedSpace: 2,
    innerRadius: 8,
    pressedInnerRadius: 4,
    selectedInnerRadius: "9999px",
    textClass: "text-label-m",
    iconSize: "h-4 w-4",
    minWidth: 48,
    widths: { narrow: 48, default: 64, wide: 88 },
  },
  s: {
    height: 40,
    hitTarget: 48,
    standardSpace: 12,
    connectedSpace: 2,
    innerRadius: 8,
    pressedInnerRadius: 4,
    selectedInnerRadius: "9999px",
    textClass: "text-label-l",
    iconSize: "h-5 w-5",
    minWidth: 48,
    widths: { narrow: 48, default: 80, wide: 112 },
  },
  m: {
    height: 56,
    hitTarget: 56,
    standardSpace: 8,
    connectedSpace: 2,
    innerRadius: 8,
    pressedInnerRadius: 4,
    selectedInnerRadius: "9999px",
    textClass: "text-title-m",
    iconSize: "h-6 w-6",
    minWidth: 56,
    widths: { narrow: 56, default: 104, wide: 144 },
  },
  l: {
    height: 96,
    hitTarget: 96,
    standardSpace: 8,
    connectedSpace: 2,
    innerRadius: 16,
    pressedInnerRadius: 12,
    selectedInnerRadius: "9999px",
    textClass: "text-title-m",
    iconSize: "h-7 w-7",
    minWidth: 96,
    widths: { narrow: 96, default: 144, wide: 192 },
  },
  xl: {
    height: 136,
    hitTarget: 136,
    standardSpace: 8,
    connectedSpace: 2,
    innerRadius: 20,
    pressedInnerRadius: 16,
    selectedInnerRadius: "9999px",
    textClass: "text-title-l",
    iconSize: "h-8 w-8",
    minWidth: 136,
    widths: { narrow: 136, default: 184, wide: 240 },
  },
};

export const squareOuterRadius: Record<ButtonGroupSize, number> = {
  xs: 4,
  s: 8,
  m: 8,
  l: 16,
  xl: 20,
};

export const rootRadius = (shape: ButtonGroupShape, size: ButtonGroupSize) =>
  shape === "round" ? "9999px" : `${squareOuterRadius[size]}px`;
