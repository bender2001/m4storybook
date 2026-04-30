import { describe, expect, it } from "vitest";
import {
  bouncyPress,
  expressiveDefault,
  expressiveEffects,
  expressiveSpatial,
  expressiveSprings,
  shapePressedStep,
  shapePx,
  springs,
  staggerChild,
  staggerParent,
  staggerVariants,
  STAGGER_DELAY_INITIAL_S,
  STAGGER_DELAY_S,
  tweens,
} from "./presets";
import { shapeScale } from "@/tokens/shape";

type ResolvedVariant = {
  opacity?: number;
  y?: number;
  transition?: { duration?: number; staggerChildren?: number };
};

describe("M3 Expressive motion presets", () => {
  it("expressiveSprings exposes the three M3 Expressive roles", () => {
    expect(Object.keys(expressiveSprings).sort()).toEqual([
      "default",
      "effects",
      "spatial",
    ]);
  });

  it("each expressive spring is a motion/react spring transition", () => {
    for (const key of ["spatial", "effects", "default"] as const) {
      const preset = expressiveSprings[key];
      expect(preset.type).toBe("spring");
      expect(typeof preset.stiffness).toBe("number");
      expect(typeof preset.damping).toBe("number");
      expect(typeof preset.mass).toBe("number");
    }
  });

  it("spatial spring is bouncy (damping ratio < 1) — matches M3 Expressive overshoot", () => {
    const { stiffness, damping, mass } = expressiveSprings.spatial;
    const ratio = damping / (2 * Math.sqrt(stiffness * mass));
    expect(ratio).toBeLessThan(1);
  });

  it("effects spring is critically damped (no overshoot) — matches M3 Expressive color/opacity guidance", () => {
    const { stiffness, damping, mass } = expressiveSprings.effects;
    const ratio = damping / (2 * Math.sqrt(stiffness * mass));
    expect(ratio).toBeGreaterThanOrEqual(1);
  });

  it("named exports point at the same objects as the map keys", () => {
    expect(expressiveSpatial).toBe(expressiveSprings.spatial);
    expect(expressiveEffects).toBe(expressiveSprings.effects);
    expect(expressiveDefault).toBe(expressiveSprings.default);
  });

  it("legacy springy/gentle aliases inherit from the expressive presets", () => {
    expect(springs.springy).toBe(expressiveSprings.spatial);
    expect(springs.gentle).toBe(expressiveSprings.default);
  });

  it("tweens map onto M3 motion duration tokens (numeric seconds)", () => {
    expect(tweens.emphasized.duration).toBeGreaterThan(0);
    expect(Array.isArray(tweens.emphasized.ease)).toBe(true);
  });

  it("shapePx mirrors the M3 shape scale as numeric pixels", () => {
    for (const role of Object.keys(shapeScale) as Array<
      keyof typeof shapeScale
    >) {
      expect(shapePx[role]).toBe(Number.parseFloat(shapeScale[role]));
    }
  });

  it("bouncyPress is an underdamped spring tuned for M3 Expressive press feedback (snappy, not floppy)", () => {
    expect(bouncyPress.type).toBe("spring");
    const { stiffness, damping, mass } = bouncyPress;
    expect(stiffness).toBeGreaterThanOrEqual(500);
    expect(stiffness).toBeLessThanOrEqual(800);
    expect(damping).toBeGreaterThanOrEqual(20);
    expect(damping).toBeLessThanOrEqual(35);
    const ratio = damping / (2 * Math.sqrt(stiffness * mass));
    expect(ratio).toBeLessThan(1);
    expect(ratio).toBeGreaterThan(0.4);
    expect(stiffness).toBeGreaterThan(expressiveSprings.spatial.stiffness);
  });

  it("staggerParent / staggerChild drive the M3 Expressive 30ms cascade", () => {
    expect(STAGGER_DELAY_S).toBeCloseTo(0.03);
    expect(STAGGER_DELAY_INITIAL_S).toBeCloseTo(0.02);

    const openParent = staggerParent.open as ResolvedVariant;
    expect(openParent.transition?.staggerChildren).toBeCloseTo(0.03);

    const openChild = staggerChild.open as ResolvedVariant;
    expect(openChild.opacity).toBe(1);
    expect(openChild.y).toBe(0);

    const closedChild = staggerChild.closed as ResolvedVariant;
    expect(closedChild.opacity).toBe(0);
    expect(closedChild.y).toBeGreaterThan(0);
  });

  it("staggerVariants(reduced=true) collapses the cascade to instant", () => {
    const { parent, child } = staggerVariants(true);
    const parentOpen = parent.open as ResolvedVariant;
    expect(parentOpen.transition?.staggerChildren).toBe(0);

    const childClosed = child.closed as ResolvedVariant;
    expect(childClosed.y).toBe(0);
    expect(childClosed.transition?.duration).toBe(0);
  });

  it("staggerVariants(reduced=false) returns the canonical M3 Expressive variants", () => {
    const { parent, child } = staggerVariants(false);
    expect(parent).toBe(staggerParent);
    expect(child).toBe(staggerChild);
  });

  it("shapePressedStep squares each shape down by one notch (no morph through 'none')", () => {
    expect(shapePressedStep.full).toBe("lg");
    expect(shapePressedStep.xl).toBe("lg");
    expect(shapePressedStep.lg).toBe("md");
    expect(shapePressedStep.md).toBe("sm");
    expect(shapePressedStep.sm).toBe("xs");
    // Floor: xs/none stay put so the press never erases the corner.
    expect(shapePressedStep.xs).toBe("xs");
    expect(shapePressedStep.none).toBe("none");
  });
});
