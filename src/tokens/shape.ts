/**
 * M3 shape scale. Per-corner morphing utilities are exposed for
 * Expressive components that need to shape-shift on press.
 */
export type ShapeRole = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full";

export const shapeScale: Record<ShapeRole, string> = {
  none: "0px",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "28px",
  full: "9999px",
};
