import {
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import {
  anatomy,
  defaultHideDelay,
  placementClass,
  plainSize,
  richSize,
} from "./anatomy";
import type { TooltipProps } from "./types";

export type {
  TooltipPlacement,
  TooltipProps,
  TooltipSize,
  TooltipVariant,
} from "./types";

/**
 * M3 Tooltip. Two variants:
 *  - plain : single-line `inverse-surface` chip used for terse
 *            descriptors. Triggered on hover (500ms dwell) or focus.
 *  - rich  : `surface-container` panel with optional subhead,
 *            supporting body, and trailing action slot. Stays open
 *            while the pointer is inside the panel.
 *
 * The trigger is wrapped in a focusable inline-flex span so the
 * tooltip can position relative to it without polluting the
 * trigger's own className. Keyboard focus + blur drive the same
 * open state as hover, matching M3 + WCAG 1.4.13.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  {
    variant = "plain",
    size = "md",
    placement = "top",
    label,
    subhead,
    supportingText,
    action,
    open: openProp,
    defaultOpen,
    onOpenChange,
    showDelayMs = 500,
    hideDelayMs,
    disabled,
    children,
    className,
    id,
    ...rest
  },
  ref,
) {
  const reduced = useReducedMotion();
  const reactId = useId();
  const tooltipId = id ?? `tooltip-${reactId.replace(/[:]/g, "")}`;

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
  const open = isControlled ? Boolean(openProp) : internalOpen;

  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const scheduleShow = useCallback(() => {
    if (disabled) return;
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (open) return;
    if (showDelayMs <= 0) {
      setOpen(true);
      return;
    }
    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      setOpen(true);
    }, showDelayMs);
  }, [disabled, open, setOpen, showDelayMs]);

  const scheduleHide = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    const delay = hideDelayMs ?? defaultHideDelay[variant];
    if (delay <= 0) {
      setOpen(false);
      return;
    }
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      setOpen(false);
    }, delay);
  }, [hideDelayMs, setOpen, variant]);

  const handleTriggerEnter = useCallback(() => {
    scheduleShow();
  }, [scheduleShow]);

  const handleTriggerLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleTriggerFocus = useCallback(() => {
    if (disabled) return;
    clearTimers();
    setOpen(true);
  }, [clearTimers, disabled, setOpen]);

  const handleTriggerBlur = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers, setOpen]);

  // Escape closes the tooltip. Bound while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimers();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearTimers, open, setOpen]);

  // Forward aria-describedby to the trigger child without losing
  // any aria-describedby it may already carry.
  const trigger = useMemo(() => {
    if (!isValidElement(children)) return children;
    const child = children as ReactElement<{
      "aria-describedby"?: string;
    }>;
    const existing = child.props["aria-describedby"];
    return cloneElement(child, {
      "aria-describedby": existing
        ? `${existing} ${tooltipId}`
        : tooltipId,
    });
  }, [children, tooltipId]);

  const panelClass =
    variant === "plain"
      ? cn(anatomy.plain, plainSize[size].padding, plainSize[size].minHeight)
      : cn(anatomy.rich, richSize[size].padding, richSize[size].maxWidth);

  const enterTransition = reduced ? { duration: 0 } : tweens.emphasizedDecelerate;
  const exitTransition = reduced ? { duration: 0 } : tweens.standardAccelerate;

  const onPanelEnter = useCallback(
    (_e: PointerEvent<HTMLDivElement>) => {
      if (variant !== "rich") return;
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    },
    [variant],
  );

  const onPanelLeave = useCallback(
    (_e: PointerEvent<HTMLDivElement>) => {
      if (variant !== "rich") return;
      scheduleHide();
    },
    [scheduleHide, variant],
  );

  const onWrapperFocus = useCallback(
    (event: FocusEvent<HTMLSpanElement>) => {
      // Focus reaching the trigger child OR the panel content (rich).
      // The wrapper handles both via React's bubbling synthetic event.
      if (event.target === event.currentTarget) return;
      handleTriggerFocus();
    },
    [handleTriggerFocus],
  );

  const onWrapperBlur = useCallback(
    (event: FocusEvent<HTMLSpanElement>) => {
      if (event.target === event.currentTarget) return;
      handleTriggerBlur();
    },
    [handleTriggerBlur],
  );

  const richPanel: ReactNode =
    variant === "rich" ? (
      <>
        {subhead ? (
          <span data-slot="subhead" className={anatomy.subhead}>
            {subhead}
          </span>
        ) : null}
        <span data-slot="label" className={anatomy.supporting}>
          {label}
        </span>
        {supportingText ? (
          <span data-slot="supporting" className={anatomy.supporting}>
            {supportingText}
          </span>
        ) : null}
        {action ? (
          <span data-slot="action" className={anatomy.action}>
            {action}
          </span>
        ) : null}
      </>
    ) : null;

  return (
    <span
      data-component="tooltip"
      data-variant={variant}
      data-size={size}
      data-placement={placement}
      data-open={open ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={anatomy.trigger}
      onPointerEnter={handleTriggerEnter}
      onPointerLeave={handleTriggerLeave}
      onFocus={onWrapperFocus}
      onBlur={onWrapperBlur}
    >
      {trigger}
      <AnimatePresence>
        {open && !disabled ? (
          <motion.div
            ref={ref}
            id={tooltipId}
            role="tooltip"
            data-slot="panel"
            data-variant={variant}
            data-size={size}
            data-placement={placement}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: enterTransition }}
            exit={{ opacity: 0, scale: 0.92, transition: exitTransition }}
            onPointerEnter={onPanelEnter}
            onPointerLeave={onPanelLeave}
            className={cn(
              anatomy.panel,
              placementClass[placement],
              variant === "rich" ? "pointer-events-auto" : null,
              panelClass,
              className,
            )}
            {...rest}
          >
            {variant === "plain" ? label : richPanel}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  );
});
