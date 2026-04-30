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
  tweens,
} from "./presets";
import { shapeScale } from "@/tokens/shape";

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
