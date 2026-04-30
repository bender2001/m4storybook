import type { HTMLAttributes, ReactNode } from "react";

/**
 * MUI Charts (X-Charts) has no first-party M3 Expressive component, so
 * this Charts surface is the MUI API re-skinned with the M3 token
 * layer. The component renders an SVG plot inside an M3 surface card
 * (variant + shape + elevation) with M3 color roles for the data
 * series and the M3 emphasized motion envelope for the draw-in.
 *
 * Variants drive the *card host* treatment that wraps the plot:
 *
 *   - text     : transparent host, plot only.
 *   - filled   : `surface-container-highest` host (default lift).
 *   - tonal    : `secondary-container` host.
 *   - outlined : transparent host with a 1dp `outline-variant` border.
 *   - elevated : `surface-container-low` host + elevation-1.
 */
export type ChartsVariant =
  | "text"
  | "filled"
  | "tonal"
  | "outlined"
  | "elevated";

/** Density. Plot height steps lockstep with the M3 type scale. */
export type ChartsSize = "sm" | "md" | "lg";

/** Corner shape scale. Default `lg` so the card reads as M3 surface. */
export type ChartsShape =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "full";

/** Plot kind. */
export type ChartsType = "bar" | "line" | "area" | "pie";

/**
 * Color role token for a series. We expose the M3 secondary palette so
 * a chart can render four mutually accessible series without leaving
 * the token system.
 */
export type ChartsSeriesColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "error";

/** A single series. `data` is an array of numeric values per index. */
export interface ChartsSeries {
  /** Stable identity (used as React key + legend label fallback). */
  id: string;
  /** Display label (legend + a11y). */
  label?: string;
  /** Numeric values for each x-axis tick. */
  data: number[];
  /** M3 color role for the series. Defaults to `primary`. */
  color?: ChartsSeriesColor;
}

/** A pie slice. Pie charts use slices instead of series. */
export interface ChartsSlice {
  id: string;
  label?: string;
  value: number;
  color?: ChartsSeriesColor;
}

type ChartsOwnKey =
  | "type"
  | "variant"
  | "size"
  | "shape"
  | "series"
  | "slices"
  | "xAxis"
  | "title"
  | "leadingIcon"
  | "trailingIcon"
  | "legend"
  | "showGrid"
  | "showAxis"
  | "disabled"
  | "error"
  | "loading"
  | "emptyState";

export interface ChartsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, ChartsOwnKey> {
  /** Plot kind. Defaults to `bar`. */
  type?: ChartsType;
  variant?: ChartsVariant;
  size?: ChartsSize;
  shape?: ChartsShape;
  /** Required for bar / line / area. Each series renders one line/bar set. */
  series?: ChartsSeries[];
  /** Required for `pie`. */
  slices?: ChartsSlice[];
  /** X-axis tick labels (bar / line / area). Indexed alongside series data. */
  xAxis?: string[];
  /** Optional title above the plot. */
  title?: ReactNode;
  /** Optional leading 18dp icon next to the title. */
  leadingIcon?: ReactNode;
  /** Optional trailing 18dp icon (e.g. an action). */
  trailingIcon?: ReactNode;
  /** Show a legend chip row beneath the plot. Defaults to true. */
  legend?: boolean;
  /** Paint the gridlines. Defaults to true (false for pie). */
  showGrid?: boolean;
  /** Render the axis ticks/labels. Defaults to true (false for pie). */
  showAxis?: boolean;
  /** Disabled wash (0.38 opacity, no pointer events). */
  disabled?: boolean;
  /** Error state — paints `error` series + an aria-invalid annotation. */
  error?: boolean;
  /** Skeleton-like loading state in place of the plot body. */
  loading?: boolean;
  /** Replacement node for the empty-data state. */
  emptyState?: ReactNode;
}
