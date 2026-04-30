import type { Transition, Variants } from "motion/react";
import { easing, duration } from "@/tokens/motion";
import { shapeScale, type ShapeRole } from "@/tokens/shape";

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

/**
 * Numeric pixel values for the M3 shape tokens. motion/react needs
 * numeric values to interpolate `borderRadius`, so the Tailwind
 * `rounded-shape-*` strings are mirrored here for shape-morph
 * animations driven by motion springs (M3 Expressive shape morph
 * spec: https://m3.material.io/styles/shape/overview).
 *
 * Values are sourced from `src/tokens/shape.ts` (the same map that
 * feeds Tailwind), so a token edit propagates here automatically.
 */
export const shapePx: Record<ShapeRole, number> = Object.fromEntries(
  (Object.keys(shapeScale) as ShapeRole[]).map((role) => [
    role,
    Number.parseFloat(shapeScale[role]),
  ]),
) as Record<ShapeRole, number>;

/**
 * One-step-down lookup used by interactive components that morph
 * their corner radius on press: the spec says the container should
 * "round further" / square up on press, which in our token scale
 * means stepping down one notch (full → lg, lg → md, …).
 *
 * `none` and `xs` clamp at the floor (xs) so a pressed shape never
 * disappears entirely. `full` collapses to `lg` rather than `xl`
 * because pill-shaped surfaces (Button, FAB extended) need a clearly
 * visible squarer pressed state.
 */
export const shapePressedStep: Record<ShapeRole, ShapeRole> = {
  none: "none",
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
  full: "lg",
};

/**
 * Shape-morph transition. M3 Expressive shape morphs (Button /
 * IconButton / FAB / Chip / ToggleButton / Card) ride the medium2
 * (300ms) emphasized easing token rather than a spring — the radius
 * changes between fixed shape tokens, so a tween settles cleanly on
 * the target value, while a spring would overshoot a near-pill
 * (9999px) into a long-tailed oscillation. The press-feedback scale
 * still uses the spatial spring; only the radius is tweened.
 */
export const shapeMorphTransition: Transition = {
  duration: ms(duration.medium2),
  ease: cubic(easing.emphasized),
};

/**
 * M3 Expressive bouncy press feedback. The interactive surfaces
 * called out by the spec — Button, IconButton, FAB, Chip,
 * ToggleButton, Switch — scale slightly inward on press
 * (`whileTap={{ scale: 0.92–0.97 }}`) and snap back on release with
 * a small overshoot. A critically-damped spring (or linear tween)
 * makes the release feel dead; the M3 Expressive press feedback
 * pattern (https://m3.material.io/styles/motion/transitions/transition-patterns)
 * calls for an underdamped spring that lands quickly with a single
 * visible bounce.
 *
 * Tuning: stiffness 600 + damping 25 (mass 1) → damping ratio
 * ~0.51, natural frequency ~24.5 rad/s. The release overshoots
 * by ~3–4% and settles within ~300ms — snappy, not floppy. Apply
 * per-channel via `transition={{ scale: bouncyPress, ... }}` so
 * the existing spatial spring keeps driving the other animated
 * channels (borderRadius / y / box-shadow) without being pulled
 * into the press oscillation.
 */
export const bouncyPress = {
  type: "spring",
  stiffness: 600,
  damping: 25,
  mass: 1,
} as const satisfies Transition;

/**
 * M3 Expressive stagger entrance. The Expressive motion guidance for
 * lists / menus / radial action groups / queued snackbars calls for
 * children to fade-and-rise in sequence on the `emphasized-decelerate`
 * easing token, with a 30ms inter-child delay (small enough to read as
 * one synchronized gesture, large enough to perceive the cascade).
 *
 * The variants are authored in the parent/child split required by
 * motion/react's `staggerChildren`: the parent owns the schedule, the
 * child owns the animated properties. Consumers wire them as
 *
 *   <motion.ul variants={parent} initial="closed" animate="open" exit="closed">
 *     {items.map(it => <motion.li variants={child} ... />)}
 *   </motion.ul>
 *
 * Reduced-motion: pass `reduced=true` to {@link staggerVariants} and
 * the `staggerChildren` collapses to 0 plus the child y-offset
 * collapses to 0, so the cascade plays back instantly while leaving
 * the AnimatePresence enter/exit hooks intact.
 */
export const STAGGER_DELAY_S = 0.03;
export const STAGGER_DELAY_INITIAL_S = 0.02;
export const STAGGER_CHILD_OFFSET_PX = 6;

const childTween: Transition = {
  duration: ms(duration.medium2),
  ease: cubic(easing["emphasized-decelerate"]),
};

export const staggerParent: Variants = {
  closed: {
    transition: {
      staggerChildren: STAGGER_DELAY_S,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      staggerChildren: STAGGER_DELAY_S,
      delayChildren: STAGGER_DELAY_INITIAL_S,
    },
  },
};

export const staggerChild: Variants = {
  closed: {
    opacity: 0,
    y: STAGGER_CHILD_OFFSET_PX,
    transition: {
      duration: ms(duration.short4),
      ease: cubic(easing["emphasized-accelerate"]),
    },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: childTween,
  },
};

const instantParent: Variants = {
  closed: { transition: { staggerChildren: 0 } },
  open: { transition: { staggerChildren: 0 } },
};

const instantChild: Variants = {
  closed: { opacity: 0, y: 0, transition: { duration: 0 } },
  open: { opacity: 1, y: 0, transition: { duration: 0 } },
};

/**
 * Returns the stagger parent + child variant pair, collapsing to
 * instant when the reduced-motion preference is on. Components that
 * already gate on `useReducedMotion()` should hand the boolean
 * straight to this helper rather than reimplementing the collapse.
 */
export function staggerVariants(
  reduced: boolean | null | undefined,
): { parent: Variants; child: Variants } {
  if (reduced) return { parent: instantParent, child: instantChild };
  return { parent: staggerParent, child: staggerChild };
}
