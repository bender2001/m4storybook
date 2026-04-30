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
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  FOCUSABLE_SELECTOR,
  positionClasses,
  shapeClasses,
  sizeClasses,
} from "./anatomy";
import type { ModalProps } from "./types";

export type {
  ModalProps,
  ModalShape,
  ModalSize,
  ModalVariant,
} from "./types";

/**
 * M3 Modal. Re-skins the MUI Modal API onto the M3 modal surface
 * (https://m3.material.io/components/dialogs/specs — Modal is the
 * primitive that powers Dialog / Drawer / Bottom Sheet). The surface
 * is a flex column with three slots:
 *
 *   - header  : optional leading icon + title + trailing icon
 *   - content : body content (forms / lists / inline media)
 *   - actions : trailing action row aligned to the end
 *
 * Variants:
 *
 *   - standard : surface-container-high + elevation 3 + xl shape
 *                (M3 default modal surface).
 *   - tonal    : primary-container + elevation 1 + xl shape.
 *   - outlined : surface + 1dp outline border + no elevation.
 *   - text     : transparent fill + no border + no elevation.
 *   - elevated : surface-container-low + elevation 4 + xl shape.
 *
 * Behavior:
 *   - Scrim click + Escape both fire `onClose` (gated by the
 *     `disableScrimClose` / `disableEscapeClose` flags).
 *   - On open the surface auto-focuses (skip with `disableAutoFocus`).
 *   - Tab + Shift+Tab cycle through focusable descendants of the
 *     modal surface (skip with `disableFocusTrap`).
 *   - Motion: surface scales 95% -> 100% on enter and back to 95% on
 *     exit via AnimatePresence with the M3 emphasized tween.
 *     `useReducedMotion` collapses durations to 0.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    variant = "standard",
    size = "md",
    shape = "xl",
    open = true,
    onClose,
    title,
    leadingIcon,
    trailingIcon,
    actions,
    scrim = true,
    scrimVariant = "filled",
    contained = false,
    disabled = false,
    disableEscapeClose = false,
    disableScrimClose = false,
    disableAutoFocus = false,
    disableFocusTrap = false,
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

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => surfaceRef.current as HTMLDivElement, []);

  const fireClose = useCallback(() => {
    if (disabled) return;
    onClose?.();
  }, [disabled, onClose]);

  // Auto-focus the surface on open so keyboard users land inside
  // the modal immediately (matches the M3 dialog focus contract).
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
      // No focusables — pin focus on the surface itself so Tab
      // doesn't escape into the page.
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
    // modal never trigger onClose.
    event.stopPropagation();
  };

  const handleTrailingIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    fireClose();
  };

  const transition = reduce ? { duration: 0 } : tweens.standard;

  const labelledBy =
    ariaLabelledBy ?? (title !== undefined ? titleId : undefined);

  const restingOpacity = disabled ? 0.38 : 1;

  const hasHeader =
    title !== undefined ||
    leadingIcon !== undefined ||
    trailingIcon !== undefined;

  const surface = (
    <motion.div
      ref={surfaceRef}
      role={roleProp ?? "dialog"}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || undefined}
      data-component="modal"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled || undefined}
      onClick={handleSurfaceClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className={cn(
        anatomy.surface,
        anatomy.focusRing,
        sizes.pad,
        sizes.gap,
        sizes.minW,
        sizes.maxW,
        sizes.minH,
        shapeClasses[shape],
        colors.bg,
        colors.fg,
        colors.border,
        colors.elevation,
        disabled && anatomy.disabled,
        className,
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: restingOpacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={transition}
      {...rest}
    >
      {hasHeader ? (
        <div data-slot="header" className={anatomy.header}>
          {leadingIcon !== undefined ? (
            <span
              data-slot="leading-icon"
              aria-hidden="true"
              className={anatomy.leadingIcon}
            >
              {leadingIcon}
            </span>
          ) : null}
          {title !== undefined ? (
            <h2 id={titleId} data-slot="title" className={anatomy.title}>
              {title}
            </h2>
          ) : (
            <span className="flex-1" aria-hidden="true" />
          )}
          {trailingIcon !== undefined ? (
            <button
              type="button"
              data-slot="trailing-icon"
              aria-label="Close"
              onClick={handleTrailingIconClick}
              className={anatomy.trailingIcon}
              disabled={disabled}
            >
              {trailingIcon}
            </button>
          ) : null}
        </div>
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
      data-component="modal-positioner"
      className={cn(
        anatomy.positioner,
        contained ? positionClasses.contained : positionClasses.fixed,
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
                disableScrimClose || disabled ? undefined : onClose ?? undefined
              }
              closeOnEscape={false}
              data-role="modal-scrim"
            />
          ) : null}
          {inner}
        </>
      ) : null}
    </AnimatePresence>
  );
});
