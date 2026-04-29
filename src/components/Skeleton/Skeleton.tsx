import { forwardRef, type ReactElement } from "react";
import { motion, useReducedMotion, type MotionStyle } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  defaultShapeFor,
  errorColors,
  shapeClasses,
  sizeMatrix,
} from "./anatomy";
import type { SkeletonProps, SkeletonType } from "./types";

export type {
  SkeletonAnimation,
  SkeletonProps,
  SkeletonShape,
  SkeletonSize,
  SkeletonType,
  SkeletonVariant,
} from "./types";

/**
 * M3 Skeleton. Re-skins the MUI Skeleton API onto the M3 surface
 * tonal step (`surface-container-high`) so loading states read as a
 * tonal recess, not a disabled control.
 *
 *   text        -> a single line of text-shaped placeholder.
 *   rectangular -> a sharp rectangle (cards, images).
 *   rounded     -> a rectangle with shape-md radius.
 *   circular    -> a perfect circle (avatars, FABs).
 *
 * Variants paint the body via M3 tokens (filled / tonal / outlined /
 * text). Animation = pulse | wave | none, where pulse oscillates
 * opacity 1 → 0.4 via the M3 emphasized tween and wave sweeps a
 * gradient highlight left → right. Both honor reduced motion.
 *
 * Accessibility: role="status" + aria-busy="true" + aria-live="polite"
 * so assistive tech announces the loading state. The `aria-label`
 * defaults to "Loading…" but can be overridden per skeleton.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    {
      type = "text",
      variant = "filled",
      size = "md",
      shape,
      animation = "pulse",
      width,
      height,
      lines = 1,
      leadingIcon,
      trailingIcon,
      disabled = false,
      error = false,
      className,
      style,
      "aria-label": ariaLabel = "Loading…",
      children,
      ...rest
    },
    ref,
  ) {
    const reduce = useReducedMotion();
    const colors = error ? errorColors : colorMatrix[variant];
    const resolvedShape =
      type === "circular" ? "full" : shape ?? defaultShapeFor[type];
    const metrics = sizeMatrix[type][size];

    const sizeStyle: MotionStyle = {
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
      ...style,
    };

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

    if (type === "text" && lines > 1) {
      return (
        <motion.div
          ref={ref}
          data-component="skeleton"
          data-type="text"
          data-variant={variant}
          data-size={size}
          data-shape={resolvedShape}
          data-animation={animation}
          data-disabled={disabled || undefined}
          data-error={error || undefined}
          data-lines={lines}
          role="status"
          aria-busy="true"
          aria-live="polite"
          aria-label={ariaLabel}
          animate={{ opacity: disabled ? 0.38 : 1 }}
          transition={reduce ? { duration: 0 } : tweens.standard}
          className={cn(
            anatomy.root,
            "w-full",
            disabled && anatomy.disabled,
            className,
          )}
          style={sizeStyle}
          {...rest}
        >
          {leadingNode}
          <span className={anatomy.textStack}>
            {Array.from({ length: lines }).map((_, idx) => {
              const isLast = idx === lines - 1;
              return (
                <SkeletonBody
                  key={idx}
                  type="text"
                  shape={resolvedShape}
                  animation={animation}
                  reduce={reduce}
                  colors={colors}
                  metrics={metrics}
                  className={isLast ? "w-[70%]" : undefined}
                  dataLine={idx + 1}
                />
              );
            })}
          </span>
          {trailingNode}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        data-component="skeleton"
        data-type={type}
        data-variant={variant}
        data-size={size}
        data-shape={resolvedShape}
        data-animation={animation}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={ariaLabel}
        animate={{ opacity: disabled ? 0.38 : 1 }}
        transition={reduce ? { duration: 0 } : tweens.standard}
        className={cn(
          anatomy.root,
          type !== "circular" && "w-full",
          disabled && anatomy.disabled,
          className,
        )}
        style={sizeStyle}
        {...rest}
      >
        {leadingNode}
        <SkeletonBody
          type={type}
          shape={resolvedShape}
          animation={animation}
          reduce={reduce}
          colors={colors}
          metrics={metrics}
        >
          {children}
        </SkeletonBody>
        {trailingNode}
      </motion.div>
    );
  },
);

type SkeletonBodyProps = {
  type: SkeletonType;
  shape: NonNullable<SkeletonProps["shape"]>;
  animation: NonNullable<SkeletonProps["animation"]>;
  reduce: boolean | null;
  colors: { bg: string; border: string; wave: string };
  metrics: { height: string; width: string };
  className?: string;
  dataLine?: number;
  children?: SkeletonProps["children"];
};

function SkeletonBody({
  type,
  shape,
  animation,
  reduce,
  colors,
  metrics,
  className,
  dataLine,
  children,
}: SkeletonBodyProps): ReactElement {
  const sizeOnly = !children;
  const shouldAnimate = animation !== "none" && !reduce;

  return (
    <motion.span
      data-slot="body"
      data-line={dataLine}
      className={cn(
        anatomy.body,
        sizeOnly && metrics.height,
        sizeOnly && metrics.width,
        shapeClasses[shape],
        colors.bg,
        colors.border,
        type === "circular" && "shrink-0",
        className,
      )}
      animate={
        shouldAnimate && animation === "pulse"
          ? { opacity: [1, 0.4, 1] }
          : { opacity: 1 }
      }
      transition={
        shouldAnimate && animation === "pulse"
          ? {
              duration: 1.6,
              ease: "easeInOut",
              repeat: Infinity,
            }
          : { duration: 0 }
      }
    >
      {shouldAnimate && animation === "wave" ? (
        <motion.span
          data-slot="wave"
          aria-hidden
          className={anatomy.wave}
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${colors.wave} 50%, transparent 100%)`,
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ) : null}
      {children ? (
        <span data-slot="children" className={anatomy.children}>
          {children}
        </span>
      ) : null}
    </motion.span>
  );
}
