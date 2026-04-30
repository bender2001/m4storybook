import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  colorMatrix,
  shapeClasses,
  sizeClasses,
} from "./anatomy";
import type {
  PortalContainer,
  PortalDismissSource,
  PortalProps,
} from "./types";

export type {
  PortalContainer,
  PortalDismissSource,
  PortalProps,
  PortalShape,
  PortalSize,
  PortalVariant,
} from "./types";

const resolveContainer = (container: PortalContainer | undefined): HTMLElement => {
  if (typeof document === "undefined") {
    return null as unknown as HTMLElement;
  }
  if (container == null) return document.body;
  if (typeof container === "function") {
    return container() ?? document.body;
  }
  if (container instanceof HTMLElement) return container;
  // RefObject — read `.current` lazily so refs that fill in after
  // first paint resolve correctly.
  return container.current ?? document.body;
};

/**
 * M3 Portal. Re-skins the MUI Portal API
 * (https://mui.com/material-ui/react-portal/) onto an M3 surface
 * (https://m3.material.io/styles/elevation/applying-elevation).
 * Portal is the structural primitive that teleports its children
 * into a target container (defaults to `document.body`). Modal /
 * Dialog / Snackbar / Menu all sit on top of it.
 *
 * Variants:
 *
 *   - standard : surface-container-highest + elevation 1 + md shape
 *                (M3 default portal surface).
 *   - tonal    : secondary-container + elevation 1.
 *   - outlined : transparent surface + 1dp outline border + elevation 0.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis).
 *
 * Behavior:
 *   - `container` accepts `HTMLElement` / `RefObject` /
 *     `() => HTMLElement | null`. Default `document.body`.
 *   - `disablePortal` skips the teleport and renders inline (matches
 *     MUI Portal). Default false.
 *   - `surface` (default true) toggles the M3 surface wrapper. When
 *     false, Portal collapses back to the MUI primitive — children
 *     are teleported raw with no styling.
 *   - Click outside the surface fires `onDismiss('click-away')` and
 *     `onClose` (gated by `dismissOnClickAway`, default off).
 *   - Escape fires `onDismiss('escape')` and `onClose` (gated by
 *     `dismissOnEscape`, default on).
 *   - Motion: surface scales 96% -> 100% on enter and back to 96% on
 *     exit via AnimatePresence with the M3 standard tween.
 *     `useReducedMotion` collapses durations to 0.
 */
export const Portal = forwardRef<HTMLDivElement, PortalProps>(
  function Portal(
    {
      variant = "standard",
      size = "md",
      shape = "md",
      container,
      disablePortal = false,
      surface = true,
      open = true,
      leadingIcon,
      trailingIcon,
      label,
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

    // Resolve the portal target after mount so refs / functions that
    // depend on the DOM tree have a chance to populate.
    const [target, setTarget] = useState<HTMLElement | null>(null);
    useEffect(() => {
      if (disablePortal) return;
      setTarget(resolveContainer(container));
    }, [container, disablePortal]);

    const fireDismiss = useCallback(
      (source: PortalDismissSource) => {
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

    // Document-level click-away listener. Bound only while the portal
    // is open + interactive + opted in.
    useEffect(() => {
      if (!open || disabled || !dismissOnClickAway) return;
      const handlePointer = (event: PointerEvent) => {
        const node = surfaceRef.current;
        if (!node) return;
        const eventTarget = event.target as Node | null;
        if (!eventTarget) return;
        const path = (event.composedPath && event.composedPath()) as
          | EventTarget[]
          | undefined;
        if (path && path.includes(node)) return;
        if (node.contains(eventTarget)) return;
        fireDismiss("click-away");
      };
      document.addEventListener("pointerdown", handlePointer, true);
      return () => {
        document.removeEventListener("pointerdown", handlePointer, true);
      };
    }, [open, disabled, dismissOnClickAway, fireDismiss]);

    const handleSurfaceClick = (event: MouseEvent<HTMLDivElement>) => {
      // Stop the click from reaching the document so dismissOnClickAway
      // doesn't fire on clicks inside the portal.
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

    const describedBy =
      ariaDescribedBy ??
      (children !== undefined && children !== null ? bodyId : undefined);
    const resolvedRole = role ?? "presentation";

    const surfaceNode = surface ? (
      <motion.div
        ref={surfaceRef}
        role={resolvedRole}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        aria-selected={selected || undefined}
        data-component="portal"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-portal={disablePortal ? "inline" : "teleport"}
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
      </motion.div>
    ) : (
      <div data-component="portal-raw" data-portal-raw="true">
        {children}
      </div>
    );

    const tree = (
      <AnimatePresence initial={false}>
        {open ? surfaceNode : null}
      </AnimatePresence>
    );

    if (disablePortal) {
      return tree;
    }

    if (target == null) {
      // Container not resolved yet (first render before useEffect
      // commits). Render nothing — the portal will mount on the
      // next pass.
      return null;
    }

    return createPortal(tree, target);
  },
);
