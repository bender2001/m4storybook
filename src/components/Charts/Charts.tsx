import { forwardRef, useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  AXIS_STROKE,
  AXIS_TEXT,
  anatomy,
  seriesColors,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  ChartsProps,
  ChartsSeries,
  ChartsSeriesColor,
  ChartsSlice,
} from "./types";

export type {
  ChartsProps,
  ChartsSeries,
  ChartsSeriesColor,
  ChartsShape,
  ChartsSize,
  ChartsSlice,
  ChartsType,
  ChartsVariant,
} from "./types";

/** Plot inset (axis labels live in the gutter). */
const PLOT_PADDING_X = 32;
const PLOT_PADDING_Y = 16;
const PLOT_AXIS_GUTTER = 24;

const DEFAULT_VIEW_W = 360;

const safe = (n: number) => (Number.isFinite(n) ? n : 0);

/**
 * M3-tokenized Charts surface. Re-skins MUI X-Charts with the M3
 * surface / shape / elevation / motion tokens.
 *
 *   - Card host paints variant + shape + elevation
 *   - Series paint primary / secondary / tertiary / error roles
 *   - Axis + grid paint `outline-variant`
 *   - Title rides title-l/m/s per density
 *   - Draw-in motion uses the M3 emphasized tween (medium2)
 *   - Reduced-motion collapses the draw-in to a static plot
 */
export const Charts = forwardRef<HTMLDivElement, ChartsProps>(function Charts(
  {
    type = "bar",
    variant = "filled",
    size = "md",
    shape = "lg",
    series,
    slices,
    xAxis,
    title,
    leadingIcon,
    trailingIcon,
    legend = true,
    showGrid = true,
    showAxis = true,
    disabled = false,
    error = false,
    loading = false,
    emptyState,
    className,
    "aria-label": ariaLabelProp,
    role,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const styles = variantClasses[variant];
  const sizes = sizeClasses[size];

  const ariaLabel =
    ariaLabelProp ??
    (typeof title === "string"
      ? title
      : type === "pie"
        ? "Pie chart"
        : type === "line"
          ? "Line chart"
          : type === "area"
            ? "Area chart"
            : "Bar chart");

  const hasData = useMemo(() => {
    if (type === "pie") return Boolean(slices && slices.length > 0);
    return Boolean(series && series.length > 0 && (xAxis?.length ?? 0) > 0);
  }, [series, slices, type, xAxis]);

  return (
    <div
      ref={ref}
      data-component="charts"
      data-type={type}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
      data-empty={!hasData || undefined}
      role={role ?? "figure"}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      aria-invalid={error || undefined}
      className={cn(
        anatomy.root,
        styles.rest,
        styles.border,
        styles.elevation,
        shapeClasses[shape],
        sizes.pad,
        disabled && anatomy.rootDisabled,
        className,
      )}
      {...rest}
    >
      {(title || leadingIcon || trailingIcon) ? (
        <div
          data-slot="header"
          className={cn(anatomy.header, sizes.headerGap)}
        >
          {leadingIcon ? (
            <span
              data-slot="icon-leading"
              className={cn(anatomy.icon, sizes.iconSize)}
            >
              {leadingIcon}
            </span>
          ) : null}
          {title ? (
            <span
              data-slot="title"
              className={cn(anatomy.title, sizes.titleType)}
            >
              {title}
            </span>
          ) : null}
          {trailingIcon ? (
            <span
              data-slot="icon-trailing"
              className={cn(anatomy.icon, sizes.iconSize)}
            >
              {trailingIcon}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        data-slot="plot"
        className={anatomy.plot}
        style={{ height: sizes.plotHeight }}
      >
        {loading ? (
          <span data-slot="loading" aria-hidden className={anatomy.loading} />
        ) : !hasData ? (
          <div data-slot="empty" className={anatomy.empty}>
            {emptyState ?? "No data"}
          </div>
        ) : type === "pie" ? (
          <PiePlot
            slices={slices ?? []}
            height={sizes.plotHeight}
            error={error}
            reduced={Boolean(reduced)}
          />
        ) : (
          <CartesianPlot
            type={type}
            series={series ?? []}
            xAxis={xAxis ?? []}
            height={sizes.plotHeight}
            axisFontSize={sizes.axisFontSize}
            showGrid={showGrid}
            showAxis={showAxis}
            error={error}
            reduced={Boolean(reduced)}
          />
        )}
      </div>

      {legend && hasData && !loading ? (
        <Legend
          type={type}
          series={series ?? []}
          slices={slices ?? []}
          gapClass={sizes.legendGap}
          error={error}
        />
      ) : null}
    </div>
  );
});

type CartesianPlotProps = {
  type: "bar" | "line" | "area";
  series: ChartsSeries[];
  xAxis: string[];
  height: number;
  axisFontSize: number;
  showGrid: boolean;
  showAxis: boolean;
  error: boolean;
  reduced: boolean;
};

function CartesianPlot({
  type,
  series,
  xAxis,
  height,
  axisFontSize,
  showGrid,
  showAxis,
  error,
  reduced,
}: CartesianPlotProps) {
  const viewW = DEFAULT_VIEW_W;
  const viewH = height;
  const innerLeft = PLOT_PADDING_X;
  const innerRight = viewW - PLOT_PADDING_X;
  const innerTop = PLOT_PADDING_Y;
  const innerBottom = viewH - (showAxis ? PLOT_AXIS_GUTTER : PLOT_PADDING_Y);
  const innerW = innerRight - innerLeft;
  const innerH = innerBottom - innerTop;

  const allValues = series.flatMap((s) => s.data);
  const max = Math.max(1, ...allValues.map(safe));
  const min = Math.min(0, ...allValues.map(safe));
  const range = max - min || 1;
  const ticks = xAxis.length;

  const xFor = (index: number) => {
    if (ticks <= 1) return innerLeft + innerW / 2;
    return innerLeft + (innerW * index) / (ticks - 1);
  };
  const yFor = (value: number) => {
    return innerBottom - ((safe(value) - min) / range) * innerH;
  };

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      data-slot="svg"
      role="img"
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
      className={anatomy.svg}
      style={{ height }}
    >
      {showGrid ? (
        <g data-slot="grid" aria-hidden>
          {gridLines.map((t) => {
            const y = innerTop + innerH * t;
            return (
              <line
                key={t}
                x1={innerLeft}
                x2={innerRight}
                y1={y}
                y2={y}
                stroke={AXIS_STROKE}
                strokeWidth={1}
                strokeDasharray={t === 1 ? "0" : "2 4"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>
      ) : null}

      {showAxis ? (
        <g data-slot="axis">
          <line
            x1={innerLeft}
            x2={innerRight}
            y1={innerBottom}
            y2={innerBottom}
            stroke={AXIS_STROKE}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {xAxis.map((tick, index) => (
            <text
              key={`x-${index}`}
              data-slot="axis-tick"
              x={xFor(index)}
              y={innerBottom + PLOT_AXIS_GUTTER - 8}
              fontSize={axisFontSize}
              textAnchor="middle"
              fill={AXIS_TEXT}
            >
              {tick}
            </text>
          ))}
        </g>
      ) : null}

      <g data-slot="plot-body">
        {type === "bar"
          ? renderBars({
              series,
              ticks,
              xFor,
              yFor,
              innerBottom,
              innerW,
              error,
              reduced,
            })
          : null}
        {type === "line"
          ? renderLines({ series, xFor, yFor, error, reduced })
          : null}
        {type === "area"
          ? renderArea({
              series,
              xFor,
              yFor,
              innerBottom,
              error,
              reduced,
            })
          : null}
      </g>
    </svg>
  );
}

function resolveSeriesColor(
  series: ChartsSeries | ChartsSlice,
  index: number,
  error: boolean,
): ChartsSeriesColor {
  if (error) return "error";
  if (series.color) return series.color;
  const fallback: ChartsSeriesColor[] = [
    "primary",
    "secondary",
    "tertiary",
    "error",
  ];
  return fallback[index % fallback.length];
}

type RenderArgs = {
  series: ChartsSeries[];
  ticks: number;
  xFor: (i: number) => number;
  yFor: (v: number) => number;
  innerBottom: number;
  innerW: number;
  error: boolean;
  reduced: boolean;
};

function renderBars({
  series,
  ticks,
  xFor,
  yFor,
  innerBottom,
  innerW,
  error,
  reduced,
}: RenderArgs) {
  if (ticks === 0 || series.length === 0) return null;
  const groupWidth = innerW / Math.max(1, ticks);
  const barWidth = (groupWidth * 0.7) / series.length;
  const barOffset = (groupWidth - barWidth * series.length) / 2;
  return (
    <g data-slot="bars">
      {series.map((s, sIdx) => {
        const role = resolveSeriesColor(s, sIdx, error);
        const fill = seriesColors[role].fill;
        return s.data.map((value, i) => {
          const cx = xFor(i) - groupWidth / 2;
          const x = cx + barOffset + barWidth * sIdx;
          const y = yFor(value);
          const h = innerBottom - y;
          return (
            <motion.rect
              key={`${s.id}-${i}`}
              data-slot="bar"
              data-series-id={s.id}
              data-series-color={role}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(0, h)}
              fill={fill}
              rx={4}
              initial={reduced ? false : { scaleY: 0 }}
              animate={reduced ? undefined : { scaleY: 1 }}
              style={{ transformOrigin: `${x}px ${innerBottom}px` }}
              transition={reduced ? { duration: 0 } : tweens.emphasized}
            />
          );
        });
      })}
    </g>
  );
}

type LineArgs = {
  series: ChartsSeries[];
  xFor: (i: number) => number;
  yFor: (v: number) => number;
  error: boolean;
  reduced: boolean;
};

function buildPath(values: number[], xFor: LineArgs["xFor"], yFor: LineArgs["yFor"]) {
  if (values.length === 0) return "";
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(2)},${yFor(v).toFixed(2)}`)
    .join(" ");
}

function renderLines({ series, xFor, yFor, error, reduced }: LineArgs) {
  return (
    <g data-slot="lines">
      {series.map((s, idx) => {
        const role = resolveSeriesColor(s, idx, error);
        const stroke = seriesColors[role].fill;
        const d = buildPath(s.data, xFor, yFor);
        return (
          <motion.path
            key={s.id}
            data-slot="line"
            data-series-id={s.id}
            data-series-color={role}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={reduced ? false : { pathLength: 0 }}
            animate={reduced ? undefined : { pathLength: 1 }}
            transition={reduced ? { duration: 0 } : tweens.emphasized}
          />
        );
      })}
      {series.map((s, idx) => {
        const role = resolveSeriesColor(s, idx, error);
        const fill = seriesColors[role].fill;
        return s.data.map((v, i) => (
          <motion.circle
            key={`${s.id}-${i}`}
            data-slot="line-point"
            data-series-id={s.id}
            cx={xFor(i)}
            cy={yFor(v)}
            r={3}
            fill={fill}
            initial={reduced ? false : { scale: 0 }}
            animate={reduced ? undefined : { scale: 1 }}
            transition={reduced ? { duration: 0 } : tweens.emphasized}
          />
        ));
      })}
    </g>
  );
}

type AreaArgs = LineArgs & { innerBottom: number };

function renderArea({
  series,
  xFor,
  yFor,
  innerBottom,
  error,
  reduced,
}: AreaArgs) {
  return (
    <g data-slot="areas">
      {series.map((s, idx) => {
        const role = resolveSeriesColor(s, idx, error);
        const fill = seriesColors[role].fill;
        const linePath = buildPath(s.data, xFor, yFor);
        const areaPath =
          linePath +
          ` L${xFor(s.data.length - 1).toFixed(2)},${innerBottom.toFixed(2)}` +
          ` L${xFor(0).toFixed(2)},${innerBottom.toFixed(2)} Z`;
        return (
          <g key={s.id} data-slot="area" data-series-id={s.id}>
            <motion.path
              d={areaPath}
              fill={fill}
              fillOpacity={0.18}
              initial={reduced ? false : { opacity: 0 }}
              animate={reduced ? undefined : { opacity: 1 }}
              transition={reduced ? { duration: 0 } : tweens.emphasized}
              data-slot="area-fill"
              data-series-color={role}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke={fill}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              initial={reduced ? false : { pathLength: 0 }}
              animate={reduced ? undefined : { pathLength: 1 }}
              transition={reduced ? { duration: 0 } : tweens.emphasized}
              data-slot="area-line"
            />
          </g>
        );
      })}
    </g>
  );
}

type PiePlotProps = {
  slices: ChartsSlice[];
  height: number;
  error: boolean;
  reduced: boolean;
};

function PiePlot({ slices, height, error, reduced }: PiePlotProps) {
  const viewW = DEFAULT_VIEW_W;
  const viewH = height;
  const cx = viewW / 2;
  const cy = viewH / 2;
  const r = Math.min(viewW, viewH) / 2 - 12;
  const innerR = r * 0.55;
  const total = slices.reduce((sum, s) => sum + Math.max(0, safe(s.value)), 0);

  let cursor = -Math.PI / 2;

  return (
    <svg
      data-slot="svg"
      role="img"
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid meet"
      className={anatomy.svg}
      style={{ height }}
    >
      <g data-slot="pie-body">
        {slices.map((slice, idx) => {
          const value = Math.max(0, safe(slice.value));
          const fraction = total > 0 ? value / total : 0;
          const startAngle = cursor;
          const endAngle = cursor + fraction * Math.PI * 2;
          cursor = endAngle;

          const role = resolveSeriesColor(slice, idx, error);
          const fill = seriesColors[role].fill;
          const path = describeArc(cx, cy, r, innerR, startAngle, endAngle);

          return (
            <motion.path
              key={slice.id}
              data-slot="pie-slice"
              data-series-id={slice.id}
              data-series-color={role}
              d={path}
              fill={fill}
              initial={reduced ? false : { opacity: 0, scale: 0.92 }}
              animate={reduced ? undefined : { opacity: 1, scale: 1 }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
              transition={reduced ? { duration: 0 } : tweens.emphasized}
            />
          );
        })}
      </g>
    </svg>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  innerR: number,
  start: number,
  end: number,
): string {
  if (end - start >= Math.PI * 2 - 1e-3) {
    // full ring
    return [
      `M ${cx + r} ${cy}`,
      `A ${r} ${r} 0 1 1 ${cx - r} ${cy}`,
      `A ${r} ${r} 0 1 1 ${cx + r} ${cy} Z`,
      `M ${cx + innerR} ${cy}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx - innerR} ${cy}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx + innerR} ${cy} Z`,
    ].join(" ");
  }
  const largeArc = end - start > Math.PI ? 1 : 0;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const xi1 = cx + innerR * Math.cos(end);
  const yi1 = cy + innerR * Math.sin(end);
  const xi2 = cx + innerR * Math.cos(start);
  const yi2 = cy + innerR * Math.sin(start);
  return [
    `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
    `L ${xi1.toFixed(2)} ${yi1.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi2.toFixed(2)} ${yi2.toFixed(2)}`,
    "Z",
  ].join(" ");
}

type LegendProps = {
  type: ChartsProps["type"];
  series: ChartsSeries[];
  slices: ChartsSlice[];
  gapClass: string;
  error: boolean;
};

function Legend({ type, series, slices, gapClass, error }: LegendProps) {
  const items: { id: string; label: ReactNode; role: ChartsSeriesColor }[] =
    type === "pie"
      ? slices.map((s, i) => ({
          id: s.id,
          label: s.label ?? s.id,
          role: resolveSeriesColor(s, i, error),
        }))
      : series.map((s, i) => ({
          id: s.id,
          label: s.label ?? s.id,
          role: resolveSeriesColor(s, i, error),
        }));
  if (items.length === 0) return null;
  return (
    <div
      data-slot="legend"
      role="list"
      aria-label="Legend"
      className={cn(anatomy.legend, gapClass)}
    >
      {items.map((item) => (
        <span
          key={item.id}
          role="listitem"
          data-slot="legend-item"
          data-series-id={item.id}
          data-series-color={item.role}
          className={anatomy.legendItem}
        >
          <span
            data-slot="legend-dot"
            aria-hidden
            className={cn(anatomy.legendDot, seriesColors[item.role].bg)}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
