import { createContext, useContext } from "react";

/**
 * M3 Expressive variable-icon axis hints, published by an interactive
 * parent so a child {@link MaterialIcon} can tween its FILL / wght axes
 * in sync with the parent's hover + selected state.
 *
 * Reference: https://m3.material.io/styles/icons/overview
 *  - hover  → FILL axis 0 → 1 (the glyph fills as the parent hovers)
 *  - active → wght axis 400 → 700 (selected/active glyphs read heavier)
 *
 * Variable-font axes are NOT reliably animatable via CSS transitions in
 * Safari + Firefox; consumers therefore animate the axes via motion/react
 * motion values + {@link useMotionTemplate}, not CSS.
 */
export interface IconAxisHints {
  /** Parent is currently hovered (or pressed). Drives FILL axis. */
  hovered: boolean;
  /** Parent is selected / active. Drives wght axis. */
  selected: boolean;
}

export const IconAxisContext = createContext<IconAxisHints | null>(null);

export function useIconAxisHints(): IconAxisHints | null {
  return useContext(IconAxisContext);
}

/**
 * Target axis values per the M3 Expressive icon system.
 *  - FILL 0 (rest) → 1 (hover or selected)
 *  - wght 400 (rest) → 700 (selected/active)
 */
export const ICON_AXIS_REST_FILL = 0;
export const ICON_AXIS_HOVER_FILL = 1;
export const ICON_AXIS_REST_WEIGHT = 400;
export const ICON_AXIS_ACTIVE_WEIGHT = 700;
