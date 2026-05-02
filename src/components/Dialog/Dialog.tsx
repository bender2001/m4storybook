import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Backdrop } from "@/components/Backdrop";
import { MaterialIcon } from "@/components/MaterialIcons";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  FOCUSABLE_SELECTOR,
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
 *                  Equivalent to MUI's `fullScreen` flag, with a
 *                  56dp header for close / title / action slots.
 *
 * Motion: surface and scrim fade via the M3 enter / exit transition
 * tokens. The internal Backdrop owns scrim opacity and dismissal.
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
    disableAutoFocus = false,
    disableFocusTrap = false,
    closeIcon,
    closeLabel = "Close",
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
  const hasIcon = icon !== undefined && icon !== null;
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => surfaceRef.current as HTMLDivElement, []);

  const fireClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open || disableAutoFocus) return;
    const node = surfaceRef.current;
    if (!node) return;
    const focusables = node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      node.focus();
    }
  }, [open, disableAutoFocus]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (!disableEscapeClose && event.key === "Escape" && onClose) {
      event.stopPropagation();
      fireClose();
      return;
    }

    if (disableFocusTrap) return;
    if (event.key !== "Tab") return;

    const node = surfaceRef.current;
    if (!node) return;
    const focusables = Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
      event.preventDefault();
      node.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (event.shiftKey) {
      if (active === first || !node.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSurfaceClick = (event: MouseEvent<HTMLDivElement>) => {
    // Stop the click from reaching the scrim so clicks inside the
    // dialog never trigger onClose.
    event.stopPropagation();
  };

  const enterTransition = reduce
    ? { duration: 0 }
    : tweens.emphasizedDecelerate;
  const exitTransition = reduce
    ? { duration: 0 }
    : tweens.emphasizedAccelerate;

  const labelledBy =
    ariaLabelledBy ?? (title !== undefined ? titleId : undefined);
  const describedBy =
    ariaDescribedBy ??
    (supportingText !== undefined ? descId : undefined);

  const surface = (
    <motion.div
      ref={surfaceRef}
      role={roleProp ?? (isFullscreen ? "dialog" : "alertdialog")}
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
        anatomy.focusRing,
        isFullscreen
          ? fullscreenSurface
          : `${sizes.pad} ${sizes.gap} ${sizes.minW} ${sizes.maxW}`,
        isFullscreen
          ? shapeClasses.none
          : shapeClasses[shape],
        colors.bg,
        colors.fg,
        colors.border,
        colors.elevation,
        className,
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: enterTransition }}
      exit={{ opacity: 0, transition: exitTransition }}
      tabIndex={-1}
      {...rest}
    >
      {isFullscreen ? (
        <>
          <div data-slot="header" className={anatomy.fullscreenHeader}>
            {onClose ? (
              <button
                type="button"
                data-slot="close-button"
                aria-label={closeLabel}
                className={anatomy.fullscreenCloseButton}
                onClick={(event) => {
                  event.stopPropagation();
                  fireClose();
                }}
              >
                {closeIcon ?? (
                  <MaterialIcon name="close" size="md" decorative />
                )}
              </button>
            ) : null}
            {title !== undefined ? (
              <h2
                id={titleId}
                data-slot="title"
                className={anatomy.fullscreenTitle}
              >
                {title}
              </h2>
            ) : (
              <span className="flex-1" aria-hidden="true" />
            )}
            {actions ? (
              <div data-slot="actions" className={anatomy.fullscreenActions}>
                {actions}
              </div>
            ) : null}
          </div>
          {supportingText !== undefined ? (
            <p
              id={descId}
              data-slot="supporting-text"
              className={cn(anatomy.supportingText, "px-6 pt-6")}
            >
              {supportingText}
            </p>
          ) : null}
          {children !== undefined && children !== null ? (
            <div data-slot="content" className={cn(anatomy.content, "p-6")}>
              {children}
            </div>
          ) : null}
        </>
      ) : (
        <>
          {hasIcon ? (
            <span
              data-slot="icon"
              aria-hidden="true"
              className={cn(anatomy.iconRow, sizes.iconBox)}
            >
              {icon}
            </span>
          ) : null}
          {title !== undefined ? (
            <h2
              id={titleId}
              data-slot="title"
              className={cn(anatomy.title, hasIcon && anatomy.iconAlignedText)}
            >
              {title}
            </h2>
          ) : null}
          {supportingText !== undefined ? (
            <p
              id={descId}
              data-slot="supporting-text"
              className={cn(
                anatomy.supportingText,
                hasIcon && anatomy.iconAlignedText,
              )}
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
        </>
      )}
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
