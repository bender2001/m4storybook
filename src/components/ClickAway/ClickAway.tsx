import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  ClickAwayMouseEvent,
  ClickAwayProps,
  ClickAwayTouchEvent,
} from "./types";

export type {
  ClickAwayDismissSource,
  ClickAwayMouseEvent,
  ClickAwayProps,
  ClickAwayShape,
  ClickAwaySize,
  ClickAwayTouchEvent,
  ClickAwayVariant,
} from "./types";

const DEFAULT_MOUSE: ClickAwayMouseEvent = "onPointerDown";
const DEFAULT_TOUCH: ClickAwayTouchEvent = "onTouchStart";

const mouseEventName: Record<Exclude<ClickAwayMouseEvent, false>, keyof DocumentEventMap> = {
  onClick: "click",
  onMouseDown: "mousedown",
  onMouseUp: "mouseup",
  onPointerDown: "pointerdown",
  onPointerUp: "pointerup",
};

const touchEventName: Record<Exclude<ClickAwayTouchEvent, false>, keyof DocumentEventMap> = {
  onTouchStart: "touchstart",
  onTouchEnd: "touchend",
};

/**
 * M3-tokenized Click-Away Listener.
 *
 *   - Wraps a *dismissable panel* whose surface uses M3 surface roles,
 *     elevation, and shape tokens.
 *   - Listens on the document for the configured pointer / touch event
 *     and fires `onClickAway` + `onDismiss("pointer")` when the event
 *     target is outside the panel root.
 *   - Optional Escape-key dismissal fires `onDismiss("escape")`.
 *   - Open/close animation rides M3 Expressive `springs.gentle`
 *     (or the standard tween under reduced motion).
 *   - Container transitions ride `medium2` (300ms) on `emphasized`.
 */
export const ClickAway = forwardRef<HTMLDivElement, ClickAwayProps>(
  function ClickAway(
    {
      variant = "elevated",
      size = "md",
      shape = "lg",
      open = true,
      selected = false,
      disabled = false,
      error = false,
      leadingIcon,
      trailingIcon,
      label,
      mouseEvent = DEFAULT_MOUSE,
      touchEvent = DEFAULT_TOUCH,
      dismissOnEscape = true,
      onClickAway,
      onDismiss,
      onKeyDown,
      className,
      children,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const panelRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => panelRef.current as HTMLDivElement);

    const colors = variantClasses[variant];
    const sizes = sizeClasses[size];
    const radius = shapeClasses[shape];

    const fillClass = error
      ? colors.error
      : selected
        ? colors.selected
        : colors.rest;

    const showHeader = Boolean(label || leadingIcon || trailingIcon);

    // Document-level click-away listener. Bound only while the panel is
    // open + interactive so background clicks don't fire dismissals at
    // unmounted / disabled panels.
    useEffect(() => {
      if (!open || disabled) return;
      if (mouseEvent === false && touchEvent === false) return;

      const handlePointer = (event: MouseEvent | TouchEvent) => {
        const root = panelRef.current;
        if (!root) return;
        const target = event.target as Node | null;
        if (!target) return;
        // Composed-path-aware contains check so clicks on portalled
        // children of the panel still count as "inside".
        const path = (event.composedPath && event.composedPath()) as
          | EventTarget[]
          | undefined;
        if (path && path.includes(root)) return;
        if (root.contains(target)) return;
        onClickAway?.(event);
        onDismiss?.("pointer");
      };

      const listeners: Array<() => void> = [];
      if (mouseEvent !== false) {
        const name = mouseEventName[mouseEvent];
        document.addEventListener(name, handlePointer as EventListener, true);
        listeners.push(() =>
          document.removeEventListener(
            name,
            handlePointer as EventListener,
            true,
          ),
        );
      }
      if (touchEvent !== false) {
        const name = touchEventName[touchEvent];
        document.addEventListener(name, handlePointer as EventListener, true);
        listeners.push(() =>
          document.removeEventListener(
            name,
            handlePointer as EventListener,
            true,
          ),
        );
      }
      return () => listeners.forEach((dispose) => dispose());
    }, [open, disabled, mouseEvent, touchEvent, onClickAway, onDismiss]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (!dismissOnEscape || disabled) return;
        if (event.key === "Escape") {
          event.stopPropagation();
          onDismiss?.("escape");
        }
      },
      [dismissOnEscape, disabled, onDismiss, onKeyDown],
    );

    return (
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal={false}
            aria-label={ariaLabel}
            aria-disabled={disabled || undefined}
            aria-invalid={error || undefined}
            aria-selected={selected || undefined}
            data-component="click-away"
            data-variant={variant}
            data-size={size}
            data-shape={shape}
            data-open={open || undefined}
            data-selected={selected || undefined}
            data-error={error || undefined}
            data-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            initial={
              reduced
                ? { opacity: disabled ? 0.38 : 1, scale: 1 }
                : { opacity: 0, scale: 0.96 }
            }
            animate={{ opacity: disabled ? 0.38 : 1, scale: 1 }}
            exit={
              reduced
                ? { opacity: 0, scale: 1 }
                : { opacity: 0, scale: 0.96 }
            }
            transition={reduced ? { duration: 0 } : springs.gentle}
            onKeyDown={handleKeyDown}
            className={cn(
              anatomy.root,
              sizes.pad,
              sizes.gap,
              sizes.minH,
              radius,
              fillClass,
              colors.border,
              colors.elevation,
              disabled && anatomy.disabled,
              className,
            )}
            style={reduced ? undefined : { transformOrigin: "center top" }}
            {...rest}
          >
            {showHeader ? (
              <div data-slot="header" className={cn(anatomy.header, sizes.headerType)}>
                {leadingIcon ? (
                  <span
                    aria-hidden
                    data-slot="icon-leading"
                    className={cn(anatomy.icon, colors.iconColor)}
                  >
                    {leadingIcon}
                  </span>
                ) : null}
                {label ? <span data-slot="label">{label}</span> : null}
                {trailingIcon ? (
                  <span
                    aria-hidden
                    data-slot="icon-trailing"
                    className={cn(anatomy.icon, colors.iconColor, "ml-auto")}
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  },
);
