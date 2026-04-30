import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Backdrop } from "@/components/Backdrop";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  placementAlignment,
  placementOffsetAxis,
  placementOrigin,
  positionClasses,
  shapeClasses,
  sizeClasses,
} from "./anatomy";
import type {
  PopoverDismissSource,
  PopoverPlacement,
  PopoverProps,
} from "./types";

export type {
  PopoverDismissSource,
  PopoverPlacement,
  PopoverProps,
  PopoverShape,
  PopoverSize,
  PopoverVariant,
} from "./types";

const offsetStyle = (
  placement: PopoverPlacement,
  offset: number,
): CSSProperties => {
  const axis = placementOffsetAxis[placement];
  if (axis === "none") return {};
  return { [`padding${axis[0].toUpperCase()}${axis.slice(1)}`]: `${offset}px` };
};

/**
 * M3 Popover. Re-skins the MUI Popover API onto the M3 menu/popover
 * surface (https://m3.material.io/components/menus/specs). Popover is
 * the floating, anchor-aligned primitive that powers Menu / picker
 * dropdowns. The surface is a flex column with three slots:
 *
 *   - header  : optional leading icon + title + trailing icon
 *   - body    : children render here
 *   - actions : trailing action row aligned to the end
 *
 * Variants:
 *
 *   - standard : surface-container + elevation 2 + xs shape
 *                (M3 default popover surface).
 *   - tonal    : secondary-container + elevation 1.
 *   - outlined : transparent surface + 1dp outline border + elevation 0.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis).
 *
 * Behavior:
 *   - Optional scrim (default off — popovers are non-modal).
 *   - Click outside the surface fires `onDismiss('click-away')` and
 *     `onClose` (gated by `dismissOnClickAway`).
 *   - Escape fires `onDismiss('escape')` and `onClose` (gated by
 *     `dismissOnEscape`).
 *   - Motion: surface scales 95% -> 100% on enter and back to 95% on
 *     exit via AnimatePresence with the M3 emphasized tween, with
 *     placement-aware transform-origin so the surface grows out of
 *     the anchor edge. `useReducedMotion` collapses durations to 0.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(
    {
      variant = "standard",
      size = "md",
      shape = "xs",
      placement = "bottom-start",
      offset = 8,
      open = true,
      title,
      label,
      leadingIcon,
      trailingIcon,
      actions,
      scrim = false,
      contained = true,
      disabled = false,
      selected = false,
      error = false,
      dismissOnEscape = true,
      dismissOnClickAway = true,
      onClose,
      onDismiss,
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
  ) {
    const colors = colorMatrix[variant];
    const sizes = sizeClasses[size];
    const reduce = useReducedMotion();
    const reactId = useId();
    const titleId = `${reactId.replace(/[:]/g, "")}-title`;

    const surfaceRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => surfaceRef.current as HTMLDivElement, []);

    const fireDismiss = useCallback(
      (source: PopoverDismissSource) => {
        if (disabled) return;
        onDismiss?.(source);
        onClose?.();
      },
      [disabled, onClose, onDismiss],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (!dismissOnEscape) return;
      if (event.key !== "Escape") return;
      event.stopPropagation();
      fireDismiss("escape");
    };

    // Document-level click-away listener. Bound only while the popover
    // is open + interactive so background clicks don't fire dismissals
    // at unmounted / disabled popovers.
    useEffect(() => {
      if (!open || disabled || !dismissOnClickAway) return;
      const handlePointer = (event: PointerEvent) => {
        const node = surfaceRef.current;
        if (!node) return;
        const target = event.target as Node | null;
        if (!target) return;
        const path = (event.composedPath && event.composedPath()) as
          | EventTarget[]
          | undefined;
        if (path && path.includes(node)) return;
        if (node.contains(target)) return;
        fireDismiss("click-away");
      };
      document.addEventListener("pointerdown", handlePointer, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointer, true);
      };
    }, [open, disabled, dismissOnClickAway, fireDismiss]);

    const handleSurfaceClick = (event: MouseEvent<HTMLDivElement>) => {
      // Stop the click from reaching the scrim so clicks inside the
      // popover never trigger dismiss.
      event.stopPropagation();
    };

    const handleScrimClose = () => {
      if (disabled) return;
      onDismiss?.("scrim");
      onClose?.();
    };

    const transition = reduce ? { duration: 0 } : tweens.standard;
    const labelledBy =
      ariaLabelledBy ?? (title !== undefined ? titleId : undefined);
    const restingOpacity = disabled ? 0.38 : 1;

    const fillBg = error
      ? colors.errorBg
      : selected
        ? colors.selected
        : colors.bg;

    const fillFg = error
      ? colors.errorFg
      : selected
        ? colors.selectedFg
        : colors.fg;

    const hasHeader =
      title !== undefined ||
      label !== undefined ||
      leadingIcon !== undefined ||
      trailingIcon !== undefined;

    const surface = (
      <motion.div
        ref={surfaceRef}
        role={roleProp ?? "dialog"}
        aria-modal={scrim ? "true" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        aria-selected={selected || undefined}
        data-component="popover"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-placement={placement}
        data-open={open || undefined}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        data-selected={selected || undefined}
        onClick={handleSurfaceClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        className={cn(
          anatomy.surface,
          sizes.pad,
          sizes.gap,
          sizes.minW,
          sizes.maxW,
          sizes.minH,
          shapeClasses[shape],
          fillBg,
          fillFg,
          colors.border,
          colors.elevation,
          disabled && anatomy.disabled,
          className,
        )}
        initial={
          reduce
            ? { opacity: 0, scale: 1 }
            : { opacity: 0, scale: 0.95 }
        }
        animate={{ opacity: restingOpacity, scale: 1 }}
        exit={
          reduce
            ? { opacity: 0, scale: 1 }
            : { opacity: 0, scale: 0.95 }
        }
        transition={transition}
        style={
          reduce
            ? undefined
            : { transformOrigin: placementOrigin[placement] }
        }
        {...rest}
      >
        {hasHeader ? (
          <div data-slot="header" className={anatomy.header}>
            {leadingIcon !== undefined ? (
              <span
                data-slot="icon-leading"
                aria-hidden="true"
                className={cn(anatomy.leadingIcon, colors.iconColor)}
              >
                {leadingIcon}
              </span>
            ) : null}
            {title !== undefined ? (
              <h2 id={titleId} data-slot="title" className={anatomy.title}>
                {title}
              </h2>
            ) : label !== undefined ? (
              <span data-slot="label" className={anatomy.label}>
                {label}
              </span>
            ) : (
              <span className="flex-1" aria-hidden="true" />
            )}
            {trailingIcon !== undefined ? (
              <span
                data-slot="icon-trailing"
                aria-hidden="true"
                className={cn(anatomy.trailingIcon, colors.iconColor)}
              >
                {trailingIcon}
              </span>
            ) : null}
          </div>
        ) : null}
        {children !== undefined && children !== null ? (
          <div data-slot="body" className={anatomy.body}>
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

    const positioner = (
      <div
        data-component="popover-positioner"
        data-placement={placement}
        className={cn(
          anatomy.positioner,
          contained ? positionClasses.absolute : positionClasses.fixed,
          placementAlignment[placement],
        )}
        style={offsetStyle(placement, offset)}
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
                variant="filled"
                size="md"
                contained={contained}
                onClose={disabled ? undefined : handleScrimClose}
                closeOnEscape={false}
                data-role="popover-scrim"
              />
            ) : null}
            {positioner}
          </>
        ) : null}
      </AnimatePresence>
    );
  },
);
