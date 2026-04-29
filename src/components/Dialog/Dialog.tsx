import {
  forwardRef,
  useId,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Backdrop } from "@/components/Backdrop";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  fullscreenSurface,
  positionClasses,
  shapeClasses,
  sizeClasses,
} from "./anatomy";
import type { DialogProps } from "./types";

export type {
  DialogProps,
  DialogShape,
  DialogSize,
  DialogVariant,
} from "./types";

/**
 * M3 Dialog. Re-skins the MUI Dialog API onto the M3 basic dialog
 * surface (https://m3.material.io/components/dialogs/specs).
 *
 * Anatomy:
 *
 *   - optional 24dp hero icon (centered)
 *   - headline-s title
 *   - body-m supporting text
 *   - inline body content (forms / lists)
 *   - trailing actions row (text buttons aligned to end)
 *
 * Variants:
 *
 *   - standard   : surface-container-high + elevation-3 + xl radius
 *                  (M3 default basic dialog).
 *   - tonal      : primary-container + elevation-1 + xl radius
 *                  (high-emphasis promotional dialogs).
 *   - outlined   : transparent fill + 1dp outline border + no
 *                  elevation (low-emphasis confirmation prompts).
 *   - fullscreen : edge-to-edge surface, no radius / elevation.
 *                  Equivalent to MUI's `fullScreen` flag.
 *
 * Motion: surface scales from 95% on enter and back to 95% on exit
 * via AnimatePresence with the M3 emphasized tween. The internal
 * Backdrop owns the scrim opacity and click-to-dismiss contract.
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    variant = "standard",
    size = "md",
    shape = "xl",
    open = true,
    onClose,
    title,
    icon,
    actions,
    supportingText,
    scrim = true,
    scrimVariant = "filled",
    contained = false,
    disableEscapeClose = false,
    disableScrimClose = false,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    children,
    className,
    onKeyDown,
    role: roleProp,
    ...rest
  },
  ref,
): ReactElement {
  const colors = colorMatrix[variant];
  const sizes = sizeClasses[size];
  const reduce = useReducedMotion();
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descId = `${reactId}-description`;
  const isFullscreen = variant === "fullscreen";

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (disableEscapeClose) return;
    if (event.key === "Escape" && onClose) {
      event.stopPropagation();
      onClose();
    }
  };

  const handleSurfaceClick = (event: MouseEvent<HTMLDivElement>) => {
    // Stop the click from reaching the scrim so clicks inside the
    // dialog never trigger onClose.
    event.stopPropagation();
  };

  const transition = reduce ? { duration: 0 } : tweens.standard;

  const labelledBy =
    ariaLabelledBy ?? (title !== undefined ? titleId : undefined);
  const describedBy =
    ariaDescribedBy ??
    (supportingText !== undefined ? descId : undefined);

  const surface = (
    <motion.div
      ref={ref}
      role={roleProp ?? "dialog"}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      data-component="dialog"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-fullscreen={isFullscreen || undefined}
      onClick={handleSurfaceClick}
      onKeyDown={handleKeyDown}
      className={cn(
        anatomy.surface,
        sizes.pad,
        sizes.gap,
        isFullscreen ? fullscreenSurface : `${sizes.minW} ${sizes.maxW}`,
        isFullscreen
          ? shapeClasses.none
          : shapeClasses[shape],
        colors.bg,
        colors.fg,
        colors.border,
        colors.elevation,
        className,
      )}
      initial={{ opacity: 0, scale: isFullscreen ? 1 : 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: isFullscreen ? 1 : 0.95 }}
      transition={transition}
      tabIndex={-1}
      {...rest}
    >
      {icon ? (
        <span
          data-slot="icon"
          aria-hidden="true"
          className={cn(anatomy.iconRow, sizes.iconBox)}
        >
          {icon}
        </span>
      ) : null}
      {title !== undefined ? (
        <h2 id={titleId} data-slot="title" className={anatomy.title}>
          {title}
        </h2>
      ) : null}
      {supportingText !== undefined ? (
        <p
          id={descId}
          data-slot="supporting-text"
          className={anatomy.supportingText}
        >
          {supportingText}
        </p>
      ) : null}
      {children !== undefined && children !== null ? (
        <div data-slot="content" className={anatomy.content}>
          {children}
        </div>
      ) : null}
      {actions ? (
        <div data-slot="actions" className={anatomy.actions}>
          {actions}
        </div>
      ) : null}
    </motion.div>
  );

  const inner = (
    <div
      data-component="dialog-positioner"
      className={cn(
        anatomy.positioner,
        contained ? positionClasses.contained : positionClasses.fixed,
        isFullscreen && "p-0",
      )}
    >
      {surface}
    </div>
  );

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <>
          {scrim ? (
            <Backdrop
              variant={scrimVariant}
              size="md"
              contained={contained}
              onClose={
                disableScrimClose ? undefined : onClose ?? undefined
              }
              closeOnEscape={false}
              data-role="dialog-scrim"
            />
          ) : null}
          {inner}
        </>
      ) : null}
    </AnimatePresence>
  );
});
