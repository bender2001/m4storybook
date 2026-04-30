import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs, tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  directionClasses,
  disabledClasses,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  SpeedDialAction,
  SpeedDialDirection,
  SpeedDialProps,
} from "./types";

export type {
  SpeedDialAction,
  SpeedDialDirection,
  SpeedDialProps,
  SpeedDialShape,
  SpeedDialSize,
  SpeedDialVariant,
} from "./types";

/** Default closed-state glyph (plus). */
const PlusIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
  </svg>
);

/**
 * M3-tokenized Speed Dial.
 *
 * Re-skins MUI's `<SpeedDial />` (https://mui.com/material-ui/react-speed-dial/)
 * onto M3 navigation tokens. Trigger paints as the M3 Expressive FAB
 * (https://m3.material.io/components/floating-action-button/specs);
 * actions paint as the M3 Small FAB. The trigger morphs its leading
 * icon (cross-fade + 45° rotate) when toggled, matching the MUI
 * `openIcon` swap pattern. Hover / focus / pressed paint the canonical
 * 0.08 / 0.10 / 0.10 state-layer opacities of the on-color role.
 *
 *   - 4 trigger variants : surface / primary / secondary / tertiary
 *   - 3 trigger sizes    : 40 / 56 / 96 dp containers (M3 FAB scale)
 *   - 4 directions       : up / down / left / right
 *   - 7 shapes           : full M3 corner scale on the trigger
 *   - WAI-ARIA           : aria-haspopup="menu" + aria-expanded; actions
 *                          paint as role="menuitem" with roving-tabindex
 *   - Motion             : springy press-scale on trigger; per-action
 *                          enter (medium1 emphasized-decelerate) /
 *                          exit (short4 emphasized-accelerate) stagger;
 *                          collapses under reduced motion
 *   - Keyboard           : Arrow{Up/Down/Left/Right} steps focus along
 *                          the open list; Home/End jumps; Enter/Space
 *                          activates; Escape closes and returns focus.
 */
export const SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>(
  function SpeedDial(
    {
      variant = "primary",
      size = "md",
      direction = "up",
      shape = "lg",
      actions,
      open,
      defaultOpen = false,
      onOpenChange,
      icon,
      openIcon,
      ariaLabel,
      disabled = false,
      hideBackdrop = false,
      renderAction,
      tooltipPlacement,
      className,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const reactId = useId();
    const menuId = `speed-dial-${reactId}`;

    const isControlled = open !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
    const isOpen = (isControlled ? Boolean(open) : uncontrolledOpen) && !disabled;

    const setOpen = useCallback(
      (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange],
    );

    const variantStyles = variantClasses[variant];
    const sizes = sizeClasses[size];
    const triggerRadius = isOpen ? "rounded-shape-md" : shapeClasses[shape];
    const dir = directionClasses[direction];
    const placement = tooltipPlacement ?? dir.tooltipDefault;

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const actionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const setActionRef = useCallback((key: string, node: HTMLButtonElement | null) => {
      actionRefs.current[key] = node;
    }, []);

    const focusableActionKeys = useMemo(
      () => actions.filter((a) => !a.disabled).map((a) => a.key),
      [actions],
    );

    const [focusedKey, setFocusedKey] = useState<string | null>(null);

    useEffect(() => {
      if (!isOpen) {
        setFocusedKey(null);
        return;
      }
      if (focusedKey == null && focusableActionKeys[0]) {
        setFocusedKey(focusableActionKeys[0]);
      } else if (focusedKey != null && !focusableActionKeys.includes(focusedKey)) {
        setFocusedKey(focusableActionKeys[0] ?? null);
      }
    }, [isOpen, focusableActionKeys, focusedKey]);

    useEffect(() => {
      if (!isOpen || focusedKey == null) return;
      const node = actionRefs.current[focusedKey];
      if (node && document.activeElement !== node) {
        node.focus({ preventScroll: true });
      }
    }, [focusedKey, isOpen]);

    const moveFocus = useCallback(
      (delta: 1 | -1) => {
        if (focusableActionKeys.length === 0) return;
        const current = focusedKey ?? focusableActionKeys[0];
        const idx = focusableActionKeys.indexOf(current);
        const nextIdx =
          (idx + delta + focusableActionKeys.length) %
          focusableActionKeys.length;
        setFocusedKey(focusableActionKeys[nextIdx]);
      },
      [focusableActionKeys, focusedKey],
    );

    const handleTriggerKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled) return;
        if (
          (direction === "up" && event.key === "ArrowUp") ||
          (direction === "down" && event.key === "ArrowDown") ||
          (direction === "left" && event.key === "ArrowLeft") ||
          (direction === "right" && event.key === "ArrowRight")
        ) {
          event.preventDefault();
          if (!isOpen) setOpen(true);
          if (focusableActionKeys[0]) setFocusedKey(focusableActionKeys[0]);
          return;
        }
        if (event.key === "Escape" && isOpen) {
          event.preventDefault();
          setOpen(false);
        }
      },
      [direction, disabled, focusableActionKeys, isOpen, setOpen],
    );

    const handleActionKeyDown = useCallback(
      (
        event: KeyboardEvent<HTMLButtonElement>,
        action: SpeedDialAction,
      ) => {
        if (disabled || action.disabled) return;
        const stepDelta: 1 | -1 | null = (() => {
          if (direction === "up") {
            if (event.key === "ArrowUp") return -1;
            if (event.key === "ArrowDown") return 1;
            return null;
          }
          if (direction === "down") {
            if (event.key === "ArrowDown") return -1;
            if (event.key === "ArrowUp") return 1;
            return null;
          }
          if (direction === "left") {
            if (event.key === "ArrowLeft") return -1;
            if (event.key === "ArrowRight") return 1;
            return null;
          }
          if (direction === "right") {
            if (event.key === "ArrowRight") return -1;
            if (event.key === "ArrowLeft") return 1;
            return null;
          }
          return null;
        })();
        if (stepDelta != null) {
          event.preventDefault();
          moveFocus(stepDelta);
          return;
        }
        if (event.key === "Home") {
          event.preventDefault();
          if (focusableActionKeys[0]) setFocusedKey(focusableActionKeys[0]);
          return;
        }
        if (event.key === "End") {
          event.preventDefault();
          if (focusableActionKeys.length > 0) {
            setFocusedKey(focusableActionKeys[focusableActionKeys.length - 1]);
          }
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          action.onClick?.(event, action.key);
          setOpen(false);
        }
      },
      [direction, disabled, focusableActionKeys, moveFocus, setOpen],
    );

    const handleAction = useCallback(
      (event: unknown, action: SpeedDialAction) => {
        if (disabled || action.disabled) return;
        action.onClick?.(event, action.key);
        setOpen(false);
      },
      [disabled, setOpen],
    );

    const enterTransition = reduced ? { duration: 0 } : tweens.emphasizedDecelerate;
    const exitTransition = reduced ? { duration: 0 } : tweens.emphasizedAccelerate;

    return (
      <motion.div
        ref={ref}
        data-component="speed-dial"
        data-variant={variant}
        data-size={size}
        data-direction={direction}
        data-shape={shape}
        data-open={isOpen || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          disabled && anatomy.disabled,
          className,
        )}
        {...rest}
      >
        <AnimatePresence>
          {isOpen && !hideBackdrop ? (
            <motion.div
              key="backdrop"
              data-slot="backdrop"
              aria-hidden
              className={anatomy.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.32 }}
              exit={{ opacity: 0 }}
              transition={reduced ? { duration: 0 } : tweens.standard}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen ? (
            <motion.ul
              key="actions"
              role="menu"
              id={menuId}
              aria-label={ariaLabel}
              data-slot="actions"
              data-direction={direction}
              className={cn(
                anatomy.actions,
                dir.flow,
                dir.anchor,
                sizes.actionGap,
              )}
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  transition: reduced
                    ? { staggerChildren: 0 }
                    : { staggerChildren: 0.04, delayChildren: 0.02 },
                },
                closed: {
                  transition: reduced
                    ? { staggerChildren: 0 }
                    : { staggerChildren: 0.03, staggerDirection: -1 },
                },
              }}
            >
              {actions.map((action, index) => (
                <li
                  key={action.key}
                  role="none"
                  data-slot="action-item"
                  data-key={action.key}
                  className="relative inline-flex items-center justify-center"
                >
                  {renderAction ? (
                    renderAction(action, index)
                  ) : (
                    <SpeedDialActionButton
                      action={action}
                      placement={placement}
                      direction={direction}
                      isFocused={focusedKey === action.key}
                      reduced={Boolean(reduced)}
                      enterTransition={enterTransition}
                      exitTransition={exitTransition}
                      variantAction={variantStyles.action}
                      variantStateLayer={variantStyles.actionStateLayer}
                      onActivate={handleAction}
                      onKeyDown={handleActionKeyDown}
                      onFocus={() => {
                        if (!action.disabled) setFocusedKey(action.key);
                      }}
                      registerRef={setActionRef}
                    />
                  )}
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>

        <SpeedDialTrigger
          ref={triggerRef}
          ariaLabel={ariaLabel}
          ariaControls={menuId}
          isOpen={isOpen}
          disabled={disabled}
          icon={icon}
          openIcon={openIcon}
          radius={triggerRadius}
          dimensions={sizes.trigger}
          iconBox={sizes.triggerIcon}
          variantTrigger={variantStyles.trigger}
          variantStateLayer={variantStyles.triggerStateLayer}
          elevation={sizes.triggerElevation}
          reduced={Boolean(reduced)}
          onToggle={() => setOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
        />
      </motion.div>
    );
  },
);

interface TriggerProps {
  ariaLabel: string;
  ariaControls: string;
  isOpen: boolean;
  disabled: boolean;
  icon: ReactNode;
  openIcon?: ReactNode;
  radius: string;
  dimensions: string;
  iconBox: string;
  variantTrigger: string;
  variantStateLayer: string;
  elevation: string;
  reduced: boolean;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

const SpeedDialTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  function SpeedDialTrigger(
    {
      ariaLabel,
      ariaControls,
      isOpen,
      disabled,
      icon,
      openIcon,
      radius,
      dimensions,
      iconBox,
      variantTrigger,
      variantStateLayer,
      elevation,
      reduced,
      onToggle,
      onKeyDown,
    },
    ref,
  ) {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const stateLayer = disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    const closedIcon = openIcon ? (isOpen ? openIcon : icon) : icon;
    const morphRotate = openIcon ? 0 : isOpen ? 45 : 0;

    return (
      <motion.button
        ref={ref}
        type="button"
        data-slot="trigger"
        data-open={isOpen || undefined}
        data-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={ariaControls}
        disabled={disabled}
        whileHover={disabled || reduced ? undefined : { scale: 1.04 }}
        whileTap={disabled || reduced ? undefined : { scale: 0.94 }}
        transition={reduced ? { duration: 0 } : springs.springy}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className={cn(
          anatomy.trigger,
          radius,
          dimensions,
          disabled ? disabledClasses : variantTrigger,
          !disabled && elevation,
        )}
      >
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.triggerStateLayer, variantStateLayer)}
          style={{ opacity: stateLayer }}
        />
        <motion.span
          aria-hidden
          data-slot="trigger-icon"
          className={cn(anatomy.triggerIcon, iconBox)}
          animate={{ rotate: morphRotate }}
          transition={reduced ? { duration: 0 } : springs.springy}
        >
          {closedIcon ?? <PlusIcon />}
        </motion.span>
      </motion.button>
    );
  },
);

interface ActionButtonProps {
  action: SpeedDialAction;
  placement: "top" | "bottom" | "left" | "right";
  direction: SpeedDialDirection;
  isFocused: boolean;
  reduced: boolean;
  enterTransition: object;
  exitTransition: object;
  variantAction: string;
  variantStateLayer: string;
  onActivate: (event: unknown, action: SpeedDialAction) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    action: SpeedDialAction,
  ) => void;
  onFocus: () => void;
  registerRef: (key: string, node: HTMLButtonElement | null) => void;
}

function SpeedDialActionButton({
  action,
  placement,
  direction,
  isFocused,
  reduced,
  enterTransition,
  exitTransition,
  variantAction,
  variantStateLayer,
  onActivate,
  onKeyDown,
  onFocus,
  registerRef,
}: ActionButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const stateLayer = action.disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const offsetX =
    direction === "left" ? 16 : direction === "right" ? -16 : 0;
  const offsetY =
    direction === "up" ? 16 : direction === "down" ? -16 : 0;

  const variants = {
    closed: {
      opacity: 0,
      scale: 0.6,
      x: offsetX,
      y: offsetY,
      transition: exitTransition,
    },
    open: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: enterTransition,
    },
  };

  const tooltipPosition = (() => {
    switch (placement) {
      case "top":
        return "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2";
      case "bottom":
        return "top-[calc(100%+6px)] left-1/2 -translate-x-1/2";
      case "left":
        return "right-[calc(100%+8px)] top-1/2 -translate-y-1/2";
      case "right":
        return "left-[calc(100%+8px)] top-1/2 -translate-y-1/2";
    }
  })();

  const tooltipVisible = action.tooltipOpen ?? (hovered || focused);

  return (
    <motion.div
      data-component="speed-dial-action-wrap"
      className="relative inline-flex items-center justify-center"
      variants={variants}
    >
      <motion.button
        ref={(node) => registerRef(action.key, node)}
        type="button"
        data-component="speed-dial-action"
        data-key={action.key}
        data-disabled={action.disabled || undefined}
        data-focused={isFocused || undefined}
        role="menuitem"
        aria-label={action["aria-label"] ?? action.label}
        aria-disabled={action.disabled || undefined}
        disabled={action.disabled}
        tabIndex={action.disabled ? -1 : isFocused ? 0 : -1}
        whileHover={action.disabled || reduced ? undefined : { scale: 1.06 }}
        whileTap={action.disabled || reduced ? undefined : { scale: 0.92 }}
        transition={reduced ? { duration: 0 } : springs.springy}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        onClick={(event) => onActivate(event, action)}
        onKeyDown={(event) => onKeyDown(event, action)}
        className={cn(
          anatomy.action,
          action.disabled ? disabledClasses : variantAction,
        )}
      >
        <span
          aria-hidden
          data-slot="state-layer"
          className={cn(anatomy.actionStateLayer, variantStateLayer)}
          style={{ opacity: stateLayer }}
        />
        <span aria-hidden className={anatomy.actionIcon}>
          {action.icon}
        </span>
      </motion.button>
      <AnimatePresence>
        {tooltipVisible && action.label ? (
          <motion.span
            key="tooltip"
            role="tooltip"
            data-slot="tooltip"
            data-placement={placement}
            className={cn(anatomy.tooltip, tooltipPosition)}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={reduced ? { duration: 0 } : tweens.standardDecelerate}
          >
            {action.label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
