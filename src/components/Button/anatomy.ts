import type {
  ButtonColor,
  ButtonSize,
  ButtonToggleColor,
  ButtonVariant,
} from "./types";

export const anatomy = {
  root: [
    "relative inline-flex select-none items-center justify-center",
    "rounded-shape-full font-medium outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "disabled:cursor-not-allowed data-[disabled=true]:cursor-not-allowed",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center whitespace-nowrap",
  icon: [
    "relative z-[1] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center",
    "[&>svg]:h-[18px] [&>svg]:w-[18px]",
    "[&_[data-component=material-icon]]:h-[18px]",
    "[&_[data-component=material-icon]]:w-[18px]",
    "[&_[data-slot=glyph]]:h-[18px]",
    "[&_[data-slot=glyph]]:w-[18px]",
    "[&_[data-slot=glyph]]:text-[18px]",
  ].join(" "),
} as const;

export const defaultColorClasses: Record<ButtonColor, string> = {
  filled: [
    "bg-primary text-on-primary",
    "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
    "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
    "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
  ].join(" "),
  tonal: [
    "bg-secondary-container text-on-secondary-container",
    "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
    "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
    "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
  ].join(" "),
  outlined: [
    "bg-transparent text-on-surface-variant border border-outline-variant",
    "focus-visible:border-primary",
    "disabled:text-on-surface/[0.38] disabled:border-on-surface/[0.12]",
    "data-[disabled=true]:text-on-surface/[0.38]",
    "data-[disabled=true]:border-on-surface/[0.12]",
  ].join(" "),
  text: [
    "bg-transparent text-primary",
    "disabled:text-on-surface/[0.38]",
    "data-[disabled=true]:text-on-surface/[0.38]",
  ].join(" "),
  elevated: [
    "bg-surface-container-low text-primary",
    "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
    "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
    "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
  ].join(" "),
};

/**
 * Toggle buttons don't have a text color configuration in the spec.
 */
export const toggleColorClasses: Record<
  ButtonToggleColor,
  { unselected: string; selected: string }
> = {
  elevated: {
    unselected: [
      "bg-surface-container-low text-primary",
      "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-primary text-on-primary",
      "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
    ].join(" "),
  },
  filled: {
    unselected: [
      "bg-surface-container text-on-surface-variant",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-primary text-on-primary",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
    ].join(" "),
  },
  tonal: {
    unselected: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-secondary text-on-secondary",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:shadow-elevation-0 data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:shadow-elevation-0",
    ].join(" "),
  },
  outlined: {
    unselected: [
      "bg-transparent text-on-surface-variant border border-outline-variant",
      "focus-visible:border-primary",
      "disabled:text-on-surface/[0.38] disabled:border-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38]",
      "data-[disabled=true]:border-on-surface/[0.12]",
    ].join(" "),
    selected: [
      "bg-inverse-surface text-inverse-on-surface border border-inverse-surface",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
      "disabled:border-transparent data-[disabled=true]:bg-on-surface/[0.12]",
      "data-[disabled=true]:text-on-surface/[0.38] data-[disabled=true]:border-transparent",
    ].join(" "),
  },
};

export const stateLayerClasses: Record<ButtonColor, string> = {
  filled: "bg-on-primary",
  tonal: "bg-on-secondary-container",
  outlined: "bg-on-surface-variant",
  text: "bg-primary",
  elevated: "bg-primary",
};

export const toggleStateLayerClasses: Record<ButtonToggleColor, string> = {
  elevated: "bg-primary",
  filled: "bg-on-surface-variant",
  tonal: "bg-on-secondary-container",
  outlined: "bg-on-surface-variant",
};

export const toggleSelectedStateLayerClasses: Record<
  ButtonToggleColor,
  string
> = {
  elevated: "bg-on-primary",
  filled: "bg-on-primary",
  tonal: "bg-on-secondary",
  outlined: "bg-inverse-on-surface",
};

export const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 text-label-m gap-1.5",
  md: "h-10 text-label-l gap-2",
  lg: "h-14 text-title-m gap-2.5",
};

export const radiusPx: Record<
  ButtonSize,
  Record<ButtonVariant | "pressed", number>
> = {
  sm: {
    default: 16,
    toggle: 12,
    pressed: 8,
  },
  md: {
    default: 20,
    toggle: 16,
    pressed: 12,
  },
  lg: {
    default: 28,
    toggle: 28,
    pressed: 16,
  },
};

type IconPlacement = "labelOnly" | "leadingIcon" | "trailingIcon" | "bothIcons";

const standardPadding: Record<ButtonSize, Record<IconPlacement, string>> = {
  sm: {
    labelOnly: "px-4",
    leadingIcon: "pl-3 pr-4",
    trailingIcon: "pl-4 pr-3",
    bothIcons: "px-3",
  },
  md: {
    labelOnly: "px-6",
    leadingIcon: "pl-4 pr-6",
    trailingIcon: "pl-6 pr-4",
    bothIcons: "px-4",
  },
  lg: {
    labelOnly: "px-8",
    leadingIcon: "pl-6 pr-8",
    trailingIcon: "pl-8 pr-6",
    bothIcons: "px-6",
  },
};

const textPadding: Record<ButtonSize, Record<IconPlacement, string>> = {
  sm: {
    labelOnly: "px-2",
    leadingIcon: "pl-2 pr-3",
    trailingIcon: "pl-3 pr-2",
    bothIcons: "px-2",
  },
  md: {
    labelOnly: "px-3",
    leadingIcon: "pl-3 pr-4",
    trailingIcon: "pl-4 pr-3",
    bothIcons: "px-3",
  },
  lg: {
    labelOnly: "px-4",
    leadingIcon: "pl-4 pr-5",
    trailingIcon: "pl-5 pr-4",
    bothIcons: "px-4",
  },
};

export const paddingClasses: Record<
  ButtonColor,
  Record<ButtonSize, Record<IconPlacement, string>>
> = {
  filled: standardPadding,
  tonal: standardPadding,
  outlined: standardPadding,
  elevated: standardPadding,
  text: textPadding,
};
