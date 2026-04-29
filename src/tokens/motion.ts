/**
 * M3 Expressive motion tokens. Easings and durations follow the
 * spec at https://m3.material.io/styles/motion. Spring presets at
 * the bottom are consumed directly by motion/react Transition props.
 */
export type EasingRole =
  | "emphasized"
  | "emphasized-decelerate"
  | "emphasized-accelerate"
  | "standard"
  | "standard-decelerate"
  | "standard-accelerate"
  | "linear";

export const easing: Record<EasingRole, string> = {
  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
  "emphasized-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1)",
  "emphasized-accelerate": "cubic-bezier(0.3, 0, 0.8, 0.15)",
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  "standard-decelerate": "cubic-bezier(0, 0, 0, 1)",
  "standard-accelerate": "cubic-bezier(0.3, 0, 1, 1)",
  linear: "linear",
};

export type DurationRole =
  | "short1"
  | "short2"
  | "short3"
  | "short4"
  | "medium1"
  | "medium2"
  | "medium3"
  | "medium4"
  | "long1"
  | "long2"
  | "long3"
  | "long4";

export const duration: Record<DurationRole, string> = {
  short1: "50ms",
  short2: "100ms",
  short3: "150ms",
  short4: "200ms",
  medium1: "250ms",
  medium2: "300ms",
  medium3: "350ms",
  medium4: "400ms",
  long1: "450ms",
  long2: "500ms",
  long3: "550ms",
  long4: "600ms",
};

/**
 * State-layer opacity tokens per M3 spec. Used by ripple/state-layer
 * components and verified by Playwright design-parity tests.
 */
export const stateLayerOpacity = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
} as const;
