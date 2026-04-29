import { forwardRef, useId, type ReactElement } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  circularSizeClasses,
  colorMatrix,
  defaultShapeFor,
  errorColors,
  linearSizeClasses,
  shapeClasses,
} from "./anatomy";
import type { ProgressProps } from "./types";

export type {
  ProgressMode,
  ProgressProps,
  ProgressShape,
  ProgressSize,
  ProgressType,
  ProgressVariant,
} from "./types";

/**
 * M3 Progress. Re-skins the MUI LinearProgress + CircularProgress
 * APIs onto the M3 progress-indicator surface
 * (https://m3.material.io/components/progress-indicators/specs).
 *
 *   linear   -> 4 / 8 / 12 dp horizontal track + sweeping indicator
 *   circular -> 24 / 48 / 64 dp SVG track + sweeping arc
 *
 * Variants paint the active indicator + track via M3 tokens (filled /
 * tonal / outlined / text). Determinate honors a 0..100 value;
 * indeterminate sweeps via motion/react with the M3 emphasized tween
 * and respects the user's reduced-motion preference. The error prop
 * flips the active indicator to the M3 error color role; disabled
 * applies the 0.38 opacity wash.
 *
 * Accessibility: role="progressbar" with aria-valuenow / valuemin /
 * valuemax for determinate progress. Indeterminate omits aria-valuenow
 * per ARIA 1.2 guidance. The label slot is wired via aria-labelledby.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  function Progress(
    {
      type = "linear",
      variant = "filled",
      size = "md",
      shape,
      mode = "determinate",
      value = 0,
      valueMin = 0,
      valueMax = 100,
      label,
      leadingIcon,
      trailingIcon,
      showStop = true,
      disabled = false,
      error = false,
      className,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const colors = colorMatrix[variant];
    const indicatorClass = error ? errorColors.indicator : colors.indicator;
    const indicatorStroke = error
      ? errorColors.indicatorStroke
      : colors.indicatorStroke;
    const resolvedShape = shape ?? defaultShapeFor[type];

    const labelId = useId();
    const labelledBy = label ? labelId : ariaLabelledBy;
    const range = valueMax - valueMin;
    const clamped = Math.min(
      Math.max(value, valueMin),
      valueMax,
    );
    const pct = range > 0 ? ((clamped - valueMin) / range) * 100 : 0;

    const ariaProps =
      mode === "determinate"
        ? {
            "aria-valuenow": clamped,
            "aria-valuemin": valueMin,
            "aria-valuemax": valueMax,
          }
        : {
            "aria-valuemin": valueMin,
            "aria-valuemax": valueMax,
          };

    const labelNode = label ? (
      <span id={labelId} data-slot="label" className={anatomy.label}>
        {label}
      </span>
    ) : null;

    const leadingNode = leadingIcon ? (
      <span data-slot="leading-icon" className={anatomy.icon} aria-hidden>
        {leadingIcon}
      </span>
    ) : null;
    const trailingNode = trailingIcon ? (
      <span data-slot="trailing-icon" className={anatomy.icon} aria-hidden>
        {trailingIcon}
      </span>
    ) : null;

    if (type === "circular") {
      return renderCircular({
        ref,
        rest,
        size,
        variant,
        mode,
        pct,
        clamped,
        ariaProps,
        ariaLabel,
        labelledBy,
        reduce,
        disabled,
        error,
        colors,
        indicatorStroke,
        resolvedShape,
        leadingNode,
        trailingNode,
        labelNode,
        className,
      });
    }

    const sizes = linearSizeClasses[size];

    return (
      <motion.div
        ref={ref}
        data-component="progress"
        data-type="linear"
        data-variant={variant}
        data-size={size}
        data-shape={resolvedShape}
        data-mode={mode}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        role="progressbar"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        {...ariaProps}
        animate={{ opacity: disabled ? 0.38 : 1 }}
        transition={reduce ? { duration: 0 } : tweens.standard}
        className={cn(
          anatomy.root,
          "w-full",
          disabled && anatomy.disabled,
          className,
        )}
        {...rest}
      >
        {leadingNode}
        {labelNode}
        <span
          data-slot="track"
          className={cn(
            anatomy.linearTrack,
            sizes.height,
            shapeClasses[resolvedShape],
            colors.track,
            colors.border,
          )}
        >
          {mode === "determinate" ? (
            <span
              data-slot="indicator"
              className={cn(
                anatomy.linearIndicator,
                shapeClasses[resolvedShape],
                indicatorClass,
              )}
              style={{ width: `${pct}%` }}
            />
          ) : (
            <motion.span
              data-slot="indicator"
              className={cn(
                anatomy.linearIndicator,
                shapeClasses[resolvedShape],
                indicatorClass,
              )}
              style={{ width: "40%" }}
              initial={{ x: "-100%" }}
              animate={
                reduce
                  ? { x: "30%" }
                  : { x: ["-100%", "250%"] }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      duration: 1.6,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }
              }
            />
          )}
          {showStop && mode === "determinate" ? (
            <span
              data-slot="stop"
              aria-hidden
              className={cn(
                anatomy.linearStop,
                sizes.stop,
                sizes.stopGap,
                indicatorClass,
              )}
            />
          ) : null}
        </span>
        {trailingNode}
      </motion.div>
    );
  },
);

type CircularRenderArgs = {
  ref: React.Ref<HTMLDivElement>;
  rest: Record<string, unknown>;
  size: ProgressProps["size"];
  variant: ProgressProps["variant"];
  mode: NonNullable<ProgressProps["mode"]>;
  pct: number;
  clamped: number;
  ariaProps: Record<string, number | undefined>;
  ariaLabel?: string;
  labelledBy?: string;
  reduce: boolean | null;
  disabled: boolean;
  error: boolean;
  colors: (typeof colorMatrix)[keyof typeof colorMatrix];
  indicatorStroke: string;
  resolvedShape: ProgressProps["shape"];
  leadingNode: ReactElement | null;
  trailingNode: ReactElement | null;
  labelNode: ReactElement | null;
  className?: string;
};

function renderCircular(args: CircularRenderArgs): ReactElement {
  const {
    ref,
    rest,
    size = "md",
    variant,
    mode,
    pct,
    ariaProps,
    ariaLabel,
    labelledBy,
    reduce,
    disabled,
    error,
    colors,
    indicatorStroke,
    resolvedShape,
    leadingNode,
    trailingNode,
    labelNode,
    className,
  } = args;
  const metrics = circularSizeClasses[size];
  const radius = (metrics.size - metrics.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <motion.div
      ref={ref}
      data-component="progress"
      data-type="circular"
      data-variant={variant}
      data-size={size}
      data-shape={resolvedShape}
      data-mode={mode}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      role="progressbar"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      {...ariaProps}
      animate={{ opacity: disabled ? 0.38 : 1 }}
      transition={reduce ? { duration: 0 } : tweens.standard}
      className={cn(
        anatomy.root,
        disabled && anatomy.disabled,
        className,
      )}
      {...rest}
    >
      {leadingNode}
      <span className={cn(anatomy.circularRoot, metrics.container)}>
        {mode === "determinate" ? (
          <svg
            data-slot="svg"
            className={anatomy.circularSvg}
            width={metrics.size}
            height={metrics.size}
            viewBox={`0 0 ${metrics.size} ${metrics.size}`}
          >
            <circle
              data-slot="track"
              cx={metrics.size / 2}
              cy={metrics.size / 2}
              r={radius}
              fill="none"
              strokeWidth={metrics.stroke}
              className={colors.trackStroke}
            />
            <circle
              data-slot="indicator"
              cx={metrics.size / 2}
              cy={metrics.size / 2}
              r={radius}
              fill="none"
              strokeWidth={metrics.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={indicatorStroke}
              style={{
                transition: reduce
                  ? "none"
                  : "stroke-dashoffset 300ms cubic-bezier(0.2, 0, 0, 1)",
              }}
            />
          </svg>
        ) : (
          <motion.svg
            data-slot="svg"
            className={anatomy.circularSvg}
            width={metrics.size}
            height={metrics.size}
            viewBox={`0 0 ${metrics.size} ${metrics.size}`}
            animate={reduce ? { rotate: -90 } : { rotate: [-90, 270] }}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 1.4, ease: "linear", repeat: Infinity }
            }
            style={{ originX: "50%", originY: "50%" }}
          >
            <circle
              data-slot="track"
              cx={metrics.size / 2}
              cy={metrics.size / 2}
              r={radius}
              fill="none"
              strokeWidth={metrics.stroke}
              className={colors.trackStroke}
            />
            <circle
              data-slot="indicator"
              cx={metrics.size / 2}
              cy={metrics.size / 2}
              r={radius}
              fill="none"
              strokeWidth={metrics.stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.25} ${circumference}`}
              strokeDashoffset={0}
              className={indicatorStroke}
            />
          </motion.svg>
        )}
        {labelNode ? (
          <span data-slot="circular-label" className={anatomy.circularLabel}>
            {labelNode}
          </span>
        ) : null}
      </span>
      {trailingNode}
    </motion.div>
  );
}
