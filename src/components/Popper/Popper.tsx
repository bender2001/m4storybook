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
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  placementAlignment,
  placementArrowSide,
  placementOffsetAxis,
  placementOrigin,
  positionClasses,
  shapeClasses,
  sizeClasses,
  type ArrowSide,
} from "./anatomy";
import type {
  PopperDismissSource,
  PopperPlacement,
  PopperProps,
} from "./types";

export type {
  PopperDismissSource,
  PopperPlacement,
  PopperProps,
  PopperShape,
  PopperSize,
  PopperVariant,
} from "./types";

const offsetStyle = (
  placement: PopperPlacement,
  offset: number,
): CSSProperties => {
  const axis = placementOffsetAxis[placement];
  if (axis === "none") return {};
  return { [`padding${axis[0].toUpperCase()}${axis.slice(1)}`]: `${offset}px` };
};

const arrowStyle = (
  side: ArrowSide,
  size: number,
): CSSProperties | undefined => {
  if (side === "none") return undefined;
  const half = size / 2;
  switch (side) {
    case "top":
      return {
        width: size,
        height: size,
        top: -half,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
      };
    case "bottom":
      return {
        width: size,
        height: size,
        bottom: -half,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
      };
    case "left":
      return {
        width: size,
        height: size,
        left: -half,
        top: "50%",
        transform: "translateY(-50%) rotate(45deg)",
      };
    case "right":
      return {
        width: size,
        height: size,
        right: -half,
        top: "50%",
        transform: "translateY(-50%) rotate(45deg)",
      };
    default:
      return undefined;
  }
};

/**
 * M3 Popper. Re-skins the MUI Popper API
 * (https://mui.com/material-ui/react-popper/) onto the M3 tooltip /
 * menu surface (https://m3.material.io/components/tooltips/specs).
 * Popper is the lightweight, anchor-positioned primitive that
 * powers Tooltip / Autocomplete listbox / Menu containers.
 *
 * Variants:
 *
 *   - standard : surface-container-high + elevation 2 + sm shape
 *                (M3 default popper / rich-tooltip surface).
 *   - tonal    : secondary-container + elevation 1.
 *   - outlined : transparent surface + 1dp outline border + elevation 0.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis).
 *
 * Behavior:
 *   - Optional caret arrow that points back at the anchor edge.
 *   - Modifier mirrors: `flip` and `keepInViewport` reflect the
 *     popper.js modifier defaults via data-attributes (consumers
 *     read them; the library does not actually run popper.js).
 *   - Click outside the surface fires `onDismiss('click-away')` and
 *     `onClose` (gated by `dismissOnClickAway`, default off).
 *   - Escape fires `onDismiss('escape')` and `onClose` (gated by
 *     `dismissOnEscape`, default on).
 *   - Motion: surface scales 96% -> 100% on enter and back to 96%
 *     on exit via AnimatePresence with the M3 standard tween, with
 *     placement-aware transform-origin so the surface grows out of
 *     the anchor edge. `useReducedMotion` collapses durations to 0.
 */
export const Popper = forwardRef<HTMLDivElement, PopperProps>(
  function Popper(
    {
      variant = "standard",
      size = "sm",
      shape = "sm",
      placement = "bottom",
      offset = 12,
      arrow = false,
      arrowSize = 8,
      leadingIcon,
      trailingIcon,
      label,
      open = true,
      flip = true,
      keepInViewport = true,
      contained = true,
      disabled = false,
      selected = false,
      error = false,
      dismissOnEscape = true,
      dismissOnClickAway = false,
      onClose,
      onDismiss,
      ariaLabel,
      ariaLabelledBy,
      ariaDescribedBy,
      role,
      children,
      className,
      onKeyDown,
      ...rest
    },
    ref,
  ) {
    const colors = colorMatrix[variant];
    const sizes = sizeClasses[size];
    const reduce = useReducedMotion();
    const reactId = useId();
    const bodyId = `${reactId.replace(/[:]/g, "")}-body`;

    const surfaceRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => surfaceRef.current as HTMLDivElement, []);

    const fireDismiss = useCallback(
      (source: PopperDismissSource) => {
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

    // Document-level click-away listener. Bound only while the popper
    // is open + interactive + opted in.
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
      // Stop the click from reaching the document (prevents
      // dismissOnClickAway from immediately firing on the open click).
      event.stopPropagation();
    };

    const transition = reduce ? { duration: 0 } : tweens.standard;
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

    const arrowSide = placementArrowSide[placement];
    const showArrow = arrow && arrowSide !== "none";
    const describedBy =
      ariaDescribedBy ??
      (children !== undefined && children !== null ? bodyId : undefined);
    const resolvedRole = role ?? "tooltip";

    const surface = (
      <motion.div
        ref={surfaceRef}
        role={resolvedRole}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        aria-selected={selected || undefined}
        data-component="popper"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-placement={placement}
        data-arrow={showArrow ? "true" : undefined}
        data-flip={flip ? "auto" : "off"}
        data-keep-in-viewport={keepInViewport ? "true" : "false"}
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
          reduce ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.96 }
        }
        animate={{ opacity: restingOpacity, scale: 1 }}
        exit={reduce ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.96 }}
        transition={transition}
        style={
          reduce ? undefined : { transformOrigin: placementOrigin[placement] }
        }
        {...rest}
      >
        <div data-slot="body" className={anatomy.body}>
          {leadingIcon !== undefined ? (
            <span
              data-slot="icon-leading"
              aria-hidden="true"
              className={cn(anatomy.leadingIcon, colors.iconColor)}
            >
              {leadingIcon}
            </span>
          ) : null}
          {label !== undefined ||
          (children !== undefined && children !== null) ? (
            <div className={anatomy.bodyText}>
              {label !== undefined ? (
                <span data-slot="label" className={anatomy.label}>
                  {label}
                </span>
              ) : null}
              {children !== undefined && children !== null ? (
                <div
                  id={bodyId}
                  data-slot="content"
                  className={anatomy.content}
                >
                  {children}
                </div>
              ) : null}
            </div>
          ) : null}
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
        {showArrow ? (
          <span
            data-slot="arrow"
            aria-hidden="true"
            className={cn(anatomy.arrow, colors.elevation)}
            style={arrowStyle(arrowSide, arrowSize)}
          />
        ) : null}
      </motion.div>
    );

    const positioner = (
      <div
        data-component="popper-positioner"
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
        {open ? positioner : null}
      </AnimatePresence>
    );
  },
);
