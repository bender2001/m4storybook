import { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  labelAlignToFlex,
  orientationClasses,
  sizeClasses,
  variantInset,
} from "./anatomy";
import type { DividerProps } from "./types";

export type {
  DividerOrientation,
  DividerProps,
  DividerSize,
  DividerVariant,
} from "./types";

/**
 * M3 Expressive Divider. Renders a 1dp (sm) / 2dp (md) / 4dp (lg)
 * outline-variant rule. Three inset variants (full / inset / middle)
 * mirror the M3 spec; the optional inline label slot wraps the rule
 * in two halves (start / center / end aligned). Vertical orientation
 * is supported. Decorative dividers expose role="separator" and the
 * appropriate aria-orientation.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  {
    variant = "full",
    size = "sm",
    orientation = "horizontal",
    label,
    leadingIcon,
    trailingIcon,
    labelAlign = "center",
    children,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const sizes = sizeClasses[size];
  const insetClass =
    orientation === "horizontal"
      ? variantInset[variant].horizontal
      : variantInset[variant].vertical;
  const orient = orientationClasses[orientation];
  const labelContent = label ?? children;

  // M3 emphasized opacity fade-in. Static after mount; honored by
  // reduced motion via the duration:0 escape hatch.
  const motionTransition = reduced ? { duration: 0 } : tweens.standard;

  if (!labelContent) {
    return (
      <motion.div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        aria-label={ariaLabel}
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={motionTransition}
        className={cn(
          anatomy.rule,
          orientation === "horizontal"
            ? sizes.horizontal.thickness
            : sizes.vertical.thickness,
          orient.rule,
          insetClass,
          className,
        )}
        {...rest}
      />
    );
  }

  // Labelled divider — paint two flex rules around the label box.
  const align = labelAlignToFlex[labelAlign];
  const ruleClass = cn(
    anatomy.rule,
    orientation === "horizontal"
      ? sizes.horizontal.thickness
      : sizes.vertical.thickness,
  );

  const rootClass =
    orientation === "horizontal"
      ? cn(anatomy.labeledRoot, align.gap, orient.root, insetClass, className)
      : cn(
          anatomy.labeledRootVertical,
          align.gap,
          orient.root,
          insetClass,
          className,
        );

  return (
    <motion.div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      data-label-align={labelAlign}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={motionTransition}
      className={rootClass}
      {...rest}
    >
      <span
        aria-hidden
        data-slot="rule-leading"
        className={cn(ruleClass, align.leading)}
      />
      <span data-slot="label" className={anatomy.label}>
        {leadingIcon ? (
          <span aria-hidden data-slot="leading-icon" className={anatomy.icon}>
            {leadingIcon}
          </span>
        ) : null}
        {labelContent}
        {trailingIcon ? (
          <span aria-hidden data-slot="trailing-icon" className={anatomy.icon}>
            {trailingIcon}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        data-slot="rule-trailing"
        className={cn(ruleClass, align.trailing)}
      />
    </motion.div>
  );
});
