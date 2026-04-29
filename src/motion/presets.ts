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
 * M3 Expressive springs. Tuned to feel like the M3 docs:
 * `springy` is the default for shape-morph + bouncy press,
 * `gentle` for low-emphasis state changes, and `snappy` for
 * highly responsive UI surfaces (FAB, switches, sliders).
 */
export const springs = {
  springy: { type: "spring", stiffness: 380, damping: 24, mass: 1 },
  gentle: { type: "spring", stiffness: 200, damping: 26, mass: 1 },
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
