import type {
  TabsOrientation,
  TabsShape,
  TabsSize,
  TabsVariant,
} from "./types";

/**
 * Tabs anatomy + token bindings.
 *
 * Spec references:
 *   - M3 Tabs                 https://m3.material.io/components/tabs/specs
 *   - MUI Tabs                https://mui.com/material-ui/react-tabs/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * The active indicator is a shared `layoutId` motion span that
 * springs between tabs. Its shape morphs from `shape-xs` (flat
 * 3dp bar) to the selected `shape` token via motion/react springs
 * — the same M3 Expressive selection pattern shared with
 * Pagination, Stepper, and Navigation Rail.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer host. */
  root: [
    "relative isolate flex w-full flex-col",
    "outline-none",
    "transition-[background-color,box-shadow,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** The `<div role="tablist">` row. */
  list: [
    "relative flex shrink-0",
    "outline-none",
  ].join(" "),
  /**
   * Single tab button host. Always renders as `<button role="tab">`.
   */
  tab: [
    "group relative inline-flex shrink-0 select-none items-center justify-center",
    "bg-transparent outline-none",
    "px-4",
    "transition-[color] duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "rounded-shape-sm",
    "cursor-pointer",
  ].join(" "),
  /** State-layer overlay sitting on top of the tab. */
  tabStateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Inner tab content row (icon + label + trailing). */
  tabContent: [
    "relative z-[1] inline-flex items-center justify-center",
  ].join(" "),
  /** Tab label text. */
  label: [
    "block whitespace-nowrap",
    "transition-[color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Leading icon wrap. */
  icon: [
    "relative inline-flex shrink-0 items-center justify-center",
  ].join(" "),
  /** Trailing slot wrap. */
  trailing: [
    "relative inline-flex shrink-0 items-center justify-center",
    "ml-2",
  ].join(" "),
  /** Active-tab indicator. */
  indicator: [
    "pointer-events-none absolute z-[2]",
    "bg-primary",
  ].join(" "),
  /** Divider line below the tablist. */
  divider: [
    "pointer-events-none absolute z-[1]",
    "bg-outline-variant",
  ].join(" "),
  /** Panel body (rendered when renderTabContent is provided). */
  panel: [
    "block",
    "text-body-m text-on-surface",
    "py-4",
  ].join(" "),
} as const;

interface VariantStyles {
  /** Outer host paint (only `elevated` paints a host surface). */
  host: string;
  /** Selected-tab background container paint. */
  selectedTab: string;
  /** Selected-tab state-layer base color. */
  selectedStateLayer: string;
  /** Selected-tab label text color. */
  selectedLabel: string;
  /** Inactive-tab background container paint. */
  inactiveTab: string;
  /** Inactive-tab state-layer base color. */
  inactiveStateLayer: string;
  /** Inactive-tab label text color. */
  inactiveLabel: string;
  /** Optional tab border (outlined variant). */
  tabBorder: string;
  /** Indicator background paint. */
  indicator: string;
  /** Whether to render the bottom/trailing divider. */
  showDivider: boolean;
}

/** Variant matrix. */
export const variantClasses: Record<TabsVariant, VariantStyles> = {
  filled: {
    host: "bg-transparent",
    selectedTab: "bg-transparent",
    selectedStateLayer: "bg-primary",
    selectedLabel: "text-primary",
    inactiveTab: "bg-transparent",
    inactiveStateLayer: "bg-on-surface",
    inactiveLabel: "text-on-surface-variant",
    tabBorder: "border-0",
    indicator: "bg-primary",
    showDivider: true,
  },
  tonal: {
    host: "bg-transparent",
    selectedTab: "bg-transparent",
    selectedStateLayer: "bg-on-secondary-container",
    selectedLabel: "text-on-secondary-container",
    inactiveTab: "bg-transparent",
    inactiveStateLayer: "bg-on-surface",
    inactiveLabel: "text-on-surface-variant",
    tabBorder: "border-0",
    indicator: "bg-secondary-container",
    showDivider: false,
  },
  outlined: {
    host: "bg-transparent",
    selectedTab: "bg-transparent",
    selectedStateLayer: "bg-primary",
    selectedLabel: "text-primary",
    inactiveTab: "bg-transparent",
    inactiveStateLayer: "bg-on-surface",
    inactiveLabel: "text-on-surface-variant",
    tabBorder: "border border-solid border-outline-variant",
    indicator: "bg-primary",
    showDivider: false,
  },
  text: {
    host: "bg-transparent",
    selectedTab: "bg-transparent",
    selectedStateLayer: "bg-primary",
    selectedLabel: "text-primary",
    inactiveTab: "bg-transparent",
    inactiveStateLayer: "bg-on-surface",
    inactiveLabel: "text-on-surface-variant",
    tabBorder: "border-0",
    indicator: "bg-primary",
    showDivider: true,
  },
  elevated: {
    host: "bg-surface-container-low rounded-shape-md shadow-elevation-1",
    selectedTab: "bg-transparent",
    selectedStateLayer: "bg-primary",
    selectedLabel: "text-primary",
    inactiveTab: "bg-transparent",
    inactiveStateLayer: "bg-on-surface",
    inactiveLabel: "text-on-surface-variant",
    tabBorder: "border-0",
    indicator: "bg-primary",
    showDivider: false,
  },
};

interface SizeBlock {
  /** Tab container height (M3 spec heights). */
  tabHeight: string;
  /** Label type role (label-m / title-s). */
  label: string;
  /** Icon box size. */
  iconBox: string;
  /** Indicator thickness (height for horizontal, width for vertical). */
  indicatorThickness: string;
  /** Indicator distance from the host edge. */
  indicatorOffset: string;
  /** Gap between icon and label. */
  iconLabelGap: string;
}

/**
 * Density scale.
 *
 *   sm : 40dp / label-m
 *   md : 48dp / title-s   (M3 default)
 *   lg : 64dp / title-s   (icon + label stack)
 */
export const sizeClasses: Record<TabsSize, SizeBlock> = {
  sm: {
    tabHeight: "h-10 min-h-[40px]",
    label: "text-label-m",
    iconBox: "h-4 w-4",
    indicatorThickness: "h-[3px]",
    indicatorOffset: "bottom-0",
    iconLabelGap: "gap-1.5",
  },
  md: {
    tabHeight: "h-12 min-h-[48px]",
    label: "text-title-s",
    iconBox: "h-[18px] w-[18px]",
    indicatorThickness: "h-[3px]",
    indicatorOffset: "bottom-0",
    iconLabelGap: "gap-2",
  },
  lg: {
    tabHeight: "h-16 min-h-[64px]",
    label: "text-title-s",
    iconBox: "h-6 w-6",
    indicatorThickness: "h-[3px]",
    indicatorOffset: "bottom-0",
    iconLabelGap: "gap-1.5",
  },
};

interface OrientationBlock {
  /** Outer flex direction for the tablist. */
  listFlow: string;
  /** Indicator axis sizing classes. */
  indicatorAxis: string;
  /** Divider sizing classes. */
  dividerAxis: string;
  /** Per-tab inner flex direction. */
  tabInner: string;
}

/** Orientation matrix. */
export const orientationClasses: Record<TabsOrientation, OrientationBlock> = {
  horizontal: {
    listFlow: "flex-row items-stretch",
    indicatorAxis: "h-[3px] left-0 right-0",
    dividerAxis: "h-px bottom-0 left-0 right-0",
    tabInner: "flex-row",
  },
  vertical: {
    listFlow: "flex-col items-stretch",
    indicatorAxis: "w-[3px] top-0 bottom-0",
    dividerAxis: "w-px right-0 top-0 bottom-0",
    tabInner: "flex-row",
  },
};

/** Active-indicator morph target (rest is shape-xs / 4px flat bar). */
export const shapeClasses: Record<TabsShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Error wash applied to a tab in error state. Paints the canonical
 * M3 error role for the label.
 */
export const errorClasses = {
  label: "text-error",
  stateLayer: "bg-error",
} as const;

/**
 * Disabled wash for a single tab.
 */
export const tabDisabledClasses = "opacity-[0.38] cursor-not-allowed";
