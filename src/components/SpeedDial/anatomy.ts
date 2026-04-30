import type {
  SpeedDialDirection,
  SpeedDialShape,
  SpeedDialSize,
  SpeedDialVariant,
} from "./types";

/**
 * Speed Dial anatomy + token bindings.
 *
 * Spec references:
 *   - M3 Floating Action Button (used for trigger + actions)
 *     https://m3.material.io/components/floating-action-button/specs
 *   - color roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 *   - shape scale
 *     https://m3.material.io/styles/shape/shape-scale-tokens
 *   - elevation tokens
 *     https://m3.material.io/styles/elevation/tokens
 *   - state-layer opacities
 *     https://m3.material.io/foundations/interaction/states
 *
 * The trigger transitions ride `medium2` / `emphasized` (300ms) — the
 * same envelope as the rest of the navigation slice (Drawer / Menu /
 * BottomNavigation / Pagination). Action enter/exit ride `medium1` /
 * `emphasized-decelerate` opening, `short4` / `emphasized-accelerate`
 * closing, with a per-item stagger driven from React state (motion/
 * react variants).
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer positioning host (caller controls anchor placement). */
  root: [
    "relative isolate inline-flex w-fit",
    "outline-none",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Backdrop scrim: covers the viewport while open. */
  backdrop: [
    "fixed inset-0 z-[1]",
    "bg-scrim",
    "pointer-events-none",
    "transition-opacity duration-medium1 ease-standard",
  ].join(" "),
  /** Trigger FAB host (paints `motion.button`). */
  trigger: [
    "relative inline-flex shrink-0 items-center justify-center select-none",
    "border-0 outline-none z-[2]",
    "transition-[box-shadow,background-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  /** State-layer overlay on the trigger — opacity is React-driven. */
  triggerStateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Trigger icon slot. */
  triggerIcon: "relative z-[1] inline-flex items-center justify-center",
  /** Action list (column / row, depends on direction). */
  actions: [
    "absolute z-[2] flex w-fit",
    "pointer-events-auto",
  ].join(" "),
  /** A single action FAB host. */
  action: [
    "relative inline-flex h-10 w-10 shrink-0 items-center justify-center",
    "border-0 outline-none select-none",
    "rounded-shape-md",
    "shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
    "transition-[box-shadow,background-color,color]",
    "duration-short4 ease-standard",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  /** State-layer overlay on a single action. */
  actionStateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Action icon slot (24dp — M3 Small FAB). */
  actionIcon: "relative z-[1] inline-flex h-6 w-6 items-center justify-center",
  /** Action tooltip label container (rendered on the side). */
  tooltip: [
    "absolute z-[3] inline-flex items-center whitespace-nowrap",
    "rounded-shape-xs px-2 py-1",
    "bg-inverse-surface text-inverse-on-surface",
    "text-label-m",
    "shadow-elevation-2",
    "pointer-events-none select-none",
  ].join(" "),
} as const;

interface VariantStyles {
  /** Trigger container background + content color. */
  trigger: string;
  /** Trigger state-layer base color. M3 paints in the on-color role. */
  triggerStateLayer: string;
  /** Action container background + content color. */
  action: string;
  /** Action state-layer base color. */
  actionStateLayer: string;
}

/**
 * Variant matrix.
 *
 * Trigger paints follow the FAB role-pair conventions; actions always
 * paint as the M3 Small FAB on `surface-container-high` for legibility
 * over the dim backdrop, regardless of the trigger variant. This is
 * the same role pairing MUI uses by default.
 */
export const variantClasses: Record<SpeedDialVariant, VariantStyles> = {
  surface: {
    trigger: "bg-surface-container-high text-primary",
    triggerStateLayer: "bg-primary",
    action: "bg-surface-container-high text-primary",
    actionStateLayer: "bg-primary",
  },
  primary: {
    trigger: "bg-primary-container text-on-primary-container",
    triggerStateLayer: "bg-on-primary-container",
    action: "bg-surface-container-high text-primary",
    actionStateLayer: "bg-primary",
  },
  secondary: {
    trigger: "bg-secondary-container text-on-secondary-container",
    triggerStateLayer: "bg-on-secondary-container",
    action: "bg-surface-container-high text-secondary",
    actionStateLayer: "bg-secondary",
  },
  tertiary: {
    trigger: "bg-tertiary-container text-on-tertiary-container",
    triggerStateLayer: "bg-on-tertiary-container",
    action: "bg-surface-container-high text-tertiary",
    actionStateLayer: "bg-tertiary",
  },
};

interface SizeBlock {
  /** Trigger height + width. */
  trigger: string;
  /** Trigger corner radius (resting). */
  triggerRadius: string;
  /** Trigger icon dimensions (24dp on sm/md, 36dp on lg). */
  triggerIcon: string;
  /** Resting elevation classes for the trigger. */
  triggerElevation: string;
  /** Gap between actions and the trigger anchor. */
  anchorGap: string;
  /** Gap between adjacent actions. */
  actionGap: string;
}

/**
 * Trigger density scale. Container heights track the FAB spec
 * exactly (40 / 56 / 96 dp).
 *
 *   sm : 40dp trigger / shape-md / 24dp icon
 *   md : 56dp trigger / shape-lg / 24dp icon   (M3 default)
 *   lg : 96dp trigger / shape-xl / 36dp icon
 */
export const sizeClasses: Record<SpeedDialSize, SizeBlock> = {
  sm: {
    trigger: "h-10 w-10",
    triggerRadius: "rounded-shape-md",
    triggerIcon: "h-6 w-6",
    triggerElevation:
      "shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
    anchorGap: "gap-2",
    actionGap: "gap-2",
  },
  md: {
    trigger: "h-14 w-14",
    triggerRadius: "rounded-shape-lg",
    triggerIcon: "h-6 w-6",
    triggerElevation:
      "shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
    anchorGap: "gap-3",
    actionGap: "gap-2",
  },
  lg: {
    trigger: "h-24 w-24",
    triggerRadius: "rounded-shape-xl",
    triggerIcon: "h-9 w-9",
    triggerElevation:
      "shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
    anchorGap: "gap-4",
    actionGap: "gap-2",
  },
};

interface DirectionBlock {
  /** Action list flex direction. */
  flow: string;
  /** Action list anchor: which edge of the trigger does it attach to. */
  anchor: string;
  /** Default tooltip placement for that direction. */
  tooltipDefault: "top" | "bottom" | "left" | "right";
}

/**
 * Direction matrix. The action list is absolutely positioned against
 * the trigger; per-direction transforms collapse / expand on the
 * matching axis under motion/react.
 */
export const directionClasses: Record<SpeedDialDirection, DirectionBlock> = {
  up: {
    flow: "flex-col-reverse",
    anchor: "bottom-full left-1/2 -translate-x-1/2 mb-3",
    tooltipDefault: "left",
  },
  down: {
    flow: "flex-col",
    anchor: "top-full left-1/2 -translate-x-1/2 mt-3",
    tooltipDefault: "left",
  },
  left: {
    flow: "flex-row-reverse",
    anchor: "right-full top-1/2 -translate-y-1/2 mr-3",
    tooltipDefault: "top",
  },
  right: {
    flow: "flex-row",
    anchor: "left-full top-1/2 -translate-y-1/2 ml-3",
    tooltipDefault: "top",
  },
};

/** Shape token map for the *trigger* in its resting (closed) state. */
export const shapeClasses: Record<SpeedDialShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Disabled wash applied to the trigger + actions. M3 spec calls for an
 * on-surface@12% container with on-surface@38% content; we approximate
 * with the surface-variant role plus a 38% opacity fade so the dial
 * still has a visible container shape (token-driven, no rgba literals).
 */
export const disabledClasses = [
  "bg-surface-variant text-on-surface-variant",
  "opacity-[0.38]",
  "shadow-elevation-0 hover:shadow-elevation-0 active:shadow-elevation-0",
].join(" ");
