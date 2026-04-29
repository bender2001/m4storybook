import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  positionClasses,
  shapeClasses,
  sizeClasses,
  sizeOpacity,
} from "./anatomy";
import type { BackdropProps, BackdropVariant } from "./types";

export type {
  BackdropProps,
  BackdropShape,
  BackdropSize,
  BackdropVariant,
} from "./types";

/**
 * M3 Backdrop. Re-skins the MUI Backdrop API onto the M3 scrim
 * surface (https://m3.material.io/components/dialogs/specs). Variants
 * paint the surface in four ways:
 *
 *   filled     -> scrim color at the size opacity (M3 default scrim)
 *   tonal      -> surface-container-highest at the size opacity
 *   outlined   -> transparent + 1dp outline border (no veil)
 *   invisible  -> transparent + no border (still blocks pointer events)
 *
 * Sizes drive the scrim opacity per the M3 dialog spec (sm 0.16,
 * md 0.32 default, lg 0.56). Enter/exit motion uses AnimatePresence
 * with the M3 emphasized tween (medium2 / 300ms); reduced motion
 * collapses the duration to 0 while keeping the opacity step.
 */
export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop(
    {
      variant: variantProp = "filled",
      size = "md",
      shape = "none",
      open = true,
      onClose,
      invisible = false,
      contained = false,
      disabled = false,
      closeOnEscape,
      children,
      className,
      onClick,
      onKeyDown,
      role: roleProp,
      tabIndex: tabIndexProp,
      ...rest
    },
    ref,
  ) {
    const variant: BackdropVariant = invisible ? "invisible" : variantProp;
    const colors = colorMatrix[variant];
    const sizes = sizeClasses[size];
    const reduce = useReducedMotion();
    const restingOpacity =
      variant === "invisible" || variant === "outlined"
        ? 1
        : sizeOpacity[size];

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      if (event.target !== event.currentTarget) return;
      onClose?.();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (disabled) return;
      const wantsEscape = closeOnEscape ?? Boolean(onClose);
      if (wantsEscape && event.key === "Escape" && onClose) {
        event.stopPropagation();
        onClose();
      }
    };

    const transition = reduce ? { duration: 0 } : tweens.standard;

    const inner = (
      <motion.div
        ref={ref}
        data-component="backdrop"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-contained={contained || undefined}
        data-disabled={disabled || undefined}
        data-invisible={variant === "invisible" || undefined}
        role={roleProp ?? "presentation"}
        tabIndex={tabIndexProp ?? -1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          anatomy.root,
          contained ? positionClasses.contained : positionClasses.fixed,
          shapeClasses[shape],
          colors.bg,
          colors.fg,
          colors.border,
          disabled && anatomy.disabled,
          className,
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: disabled ? 0.38 : restingOpacity }}
        exit={{ opacity: 0 }}
        transition={transition}
        {...rest}
      >
        {children ? (
          <div data-slot="content" className={cn(anatomy.content, sizes.pad)}>
            {children}
          </div>
        ) : null}
      </motion.div>
    );

    return (
      <AnimatePresence initial={false}>{open ? inner : null}</AnimatePresence>
    );
  },
);
