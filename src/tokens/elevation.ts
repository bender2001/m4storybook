/**
 * M3 elevation 0..5. Two-stop shadow construction following M3 spec
 * (umbra + penumbra) keyed off the `--md-sys-color-shadow` token.
 */
export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const elevation: Record<ElevationLevel, string> = {
  0: "none",
  1: "0px 1px 2px 0px rgb(0 0 0 / 0.30), 0px 1px 3px 1px rgb(0 0 0 / 0.15)",
  2: "0px 1px 2px 0px rgb(0 0 0 / 0.30), 0px 2px 6px 2px rgb(0 0 0 / 0.15)",
  3: "0px 4px 8px 3px rgb(0 0 0 / 0.15), 0px 1px 3px 0px rgb(0 0 0 / 0.30)",
  4: "0px 6px 10px 4px rgb(0 0 0 / 0.15), 0px 2px 3px 0px rgb(0 0 0 / 0.30)",
  5: "0px 8px 12px 6px rgb(0 0 0 / 0.15), 0px 4px 4px 0px rgb(0 0 0 / 0.30)",
};
