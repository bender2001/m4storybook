import { describe, expect, it } from "vitest";
import { typeScale } from "./typography";
import { lightColors, darkColors } from "./colors";
import { shapeScale } from "./shape";
import { duration, easing, stateLayerOpacity } from "./motion";

describe("M3 tokens", () => {
  it("light and dark color palettes cover the same roles", () => {
    expect(Object.keys(lightColors).sort()).toEqual(
      Object.keys(darkColors).sort(),
    );
  });

  it("type scale covers all 15 M3 roles", () => {
    expect(Object.keys(typeScale)).toHaveLength(15);
  });

  it("shape scale covers M3 roles", () => {
    expect(Object.keys(shapeScale)).toEqual([
      "none",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "full",
    ]);
  });

  it("motion durations and easings present per spec", () => {
    expect(Object.keys(duration)).toHaveLength(12);
    expect(Object.keys(easing)).toContain("emphasized");
    expect(stateLayerOpacity.hover).toBe(0.08);
    expect(stateLayerOpacity.focus).toBe(0.1);
    expect(stateLayerOpacity.pressed).toBe(0.1);
    expect(stateLayerOpacity.dragged).toBe(0.16);
  });
});
