import type { Transition } from "motion/react";
import { easing, duration } from "@/tokens/motion";

const ms = (d: string) => Number(d.replace("ms", "")) / 1000;
const cubic = (e: string): [number, number, number, number] => {
  const m = e.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return [0.2, 0, 0, 1];
  return m[1].split(",").map((n) => Number(n.trim())) as [
    number,
    number,
    number,
    number,
  ];
};

/**
 * M3 Expressive spring physics, derived from the official M3 motion
 * spring tokens (https://m3.material.io/styles/motion/easing-and-duration/tokens-specs).
 *
 * - `spatial` is for entrance / exit / size / position changes; the
 *   damping ratio (~0.62) gives the controlled overshoot that
 *   distinguishes M3 Expressive from baseline M3.
 * - `effects` is for color / opacity / non-spatial state changes;
 *   it is critically damped (ratio ~1.0) to avoid color flicker.
 * - `default` is the everyday spring for most state transitions
 *   (slight overshoot, faster settle than spatial).
 */
export const expressiveSprings = {
  spatial: { type: "spring", stiffness: 380, damping: 24, mass: 1 },
  effects: { type: "spring", stiffness: 1600, damping: 80, mass: 1 },
  default: { type: "spring", stiffness: 500, damping: 30, mass: 1 },
} as const satisfies Record<string, Transition>;

export const expressiveSpatial: Transition = expressiveSprings.spatial;
export const expressiveEffects: Transition = expressiveSprings.effects;
export const expressiveDefault: Transition = expressiveSprings.default;

/**
 * Shorthand aliases used across components. `springy` maps to the
 * spatial preset (the M3 Expressive default for shape morph + bouncy
 * press), `gentle` maps to the everyday `default` spring, and
 * `snappy` is a high-stiffness variant for highly responsive
 * surfaces (FAB, switches, sliders).
 */
export const springs = {
  springy: expressiveSprings.spatial,
  gentle: expressiveSprings.default,
  snappy: { type: "spring", stiffness: 500, damping: 30, mass: 1 },
} as const satisfies Record<string, Transition>;

/**
 * Tween presets that map directly onto the M3 motion tokens. Use
 * these for opacity/translate/scale transitions where a spring
 * would overshoot (e.g. dialog scrim fade).
 */
export const tweens = {
  emphasized: {
    duration: ms(duration.medium4),
    ease: cubic(easing.emphasized),
  },
  emphasizedDecelerate: {
    duration: ms(duration.medium2),
    ease: cubic(easing["emphasized-decelerate"]),
  },
  emphasizedAccelerate: {
    duration: ms(duration.short4),
    ease: cubic(easing["emphasized-accelerate"]),
  },
  standard: {
    duration: ms(duration.medium2),
    ease: cubic(easing.standard),
  },
  standardDecelerate: {
    duration: ms(duration.medium2),
    ease: cubic(easing["standard-decelerate"]),
  },
  standardAccelerate: {
    duration: ms(duration.short4),
    ease: cubic(easing["standard-accelerate"]),
  },
} as const satisfies Record<string, Transition>;
