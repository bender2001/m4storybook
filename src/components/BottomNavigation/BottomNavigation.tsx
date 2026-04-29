import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { cn } from "@/lib/cn";
import { springs, tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  stateColors,
  variantClasses,
} from "./anatomy";
import type {
  BottomNavigationChangeEvent,
  BottomNavigationItem,
  BottomNavigationProps,
} from "./types";

export type {
  BottomNavigationChangeEvent,
  BottomNavigationItem,
  BottomNavigationProps,
  BottomNavigationShape,
  BottomNavigationSize,
  BottomNavigationVariant,
} from "./types";

/**
 * M3 Expressive Bottom Navigation (a.k.a. M3 Navigation Bar).
 *
 * Implements the M3 spec at
 * https://m3.material.io/components/navigation-bar/specs:
 *  - 80dp container fill in `surface-container` (filled / default)
 *  - 64×32 active-indicator pill in `secondary-container`
 *  - icon `on-surface-variant` (rest) → `on-secondary-container` (selected)
 *  - label-m typography, `on-surface-variant` (rest) → `on-surface`
 *  - state layer opacities: hover 0.08, focus 0.10, pressed 0.10
 *  - M3 Expressive springy active-indicator slide / icon swap
 *
 * Variants (`filled` / `tonal` / `outlined` / `elevated`) re-skin the
 * host surface; sizes (`sm` / `md` / `lg`) scale the bar height + the
 * indicator footprint; shape tokens morph the corners for floating
 * docked treatments.
 */
export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  function BottomNavigation(
    {
      variant = "filled",
      size = "md",
      shape = "none",
      items,
      value,
      defaultValue,
      onChange,
      showLabels = true,
      elevated = false,
      disabled = false,
      className,
      "aria-label": ariaLabel = "Bottom navigation",
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const styles = variantClasses[variant];
    const sizes = sizeClasses[size];
    const firstEnabled = useMemo(
      () => items.find((item) => !item.disabled)?.id ?? items[0]?.id,
      [items],
    );
    const [internalValue, setInternalValue] = useState<string | undefined>(
      defaultValue ?? firstEnabled,
    );
    const isControlled = value !== undefined;
    const activeId = isControlled ? value : internalValue;

    const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
    const setButtonRef = useCallback(
      (id: string) => (node: HTMLButtonElement | null) => {
        if (node) buttonsRef.current.set(id, node);
        else buttonsRef.current.delete(id);
      },
      [],
    );

    const handleSelect = useCallback(
      (item: BottomNavigationItem, event: BottomNavigationChangeEvent) => {
        if (disabled || item.disabled) return;
        if (!isControlled) setInternalValue(item.id);
        onChange?.(item.id, event);
      },
      [disabled, isControlled, onChange],
    );

    const handleKeyDown = useCallback(
      (item: BottomNavigationItem) =>
        (event: KeyboardEvent<HTMLButtonElement>) => {
          const enabledItems = items.filter((entry) => !entry.disabled);
          const currentIndex = enabledItems.findIndex(
            (entry) => entry.id === item.id,
          );
          if (currentIndex < 0) return;

          let nextIndex: number;

          switch (event.key) {
            case "ArrowRight":
              nextIndex = (currentIndex + 1) % enabledItems.length;
              break;
            case "ArrowLeft":
              nextIndex =
                (currentIndex - 1 + enabledItems.length) % enabledItems.length;
              break;
            case "Home":
              nextIndex = 0;
              break;
            case "End":
              nextIndex = enabledItems.length - 1;
              break;
            case "Enter":
            case " ": {
              event.preventDefault();
              handleSelect(item, event);
              return;
            }
            default:
              return;
          }

          event.preventDefault();
          const next = enabledItems[nextIndex];
          if (!next) return;
          buttonsRef.current.get(next.id)?.focus();
          handleSelect(next, event);
        },
      [handleSelect, items],
    );

    const indicatorTransition = reduced ? { duration: 0 } : springs.springy;
    const labelTransition = reduced ? { duration: 0 } : tweens.standardDecelerate;

    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        data-component="bottom-navigation"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-elevated={elevated || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          shapeClasses[shape],
          styles.rest,
          (elevated || variant === "elevated") && styles.elevation,
          disabled && anatomy.disabled,
          className,
        )}
        style={{ minHeight: sizes.height }}
        {...rest}
      >
        {styles.showDivider ? (
          <span data-slot="divider" aria-hidden className={anatomy.divider} />
        ) : null}
        {items.map((item) => {
          const selected = item.id === activeId && !disabled && !item.disabled;
          return (
            <BottomNavigationDestination
              key={item.id}
              item={item}
              selected={selected}
              showLabels={showLabels}
              size={size}
              indicatorTransition={indicatorTransition}
              labelTransition={labelTransition}
              reduced={reduced}
              barDisabled={disabled}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown(item)}
              setButtonRef={setButtonRef(item.id)}
            />
          );
        })}
      </nav>
    );
  },
);

type DestinationProps = {
  item: BottomNavigationItem;
  selected: boolean;
  showLabels: BottomNavigationProps["showLabels"];
  size: NonNullable<BottomNavigationProps["size"]>;
  indicatorTransition: Transition;
  labelTransition: Transition;
  reduced: boolean | null;
  barDisabled: boolean;
  onSelect: (
    item: BottomNavigationItem,
    event: BottomNavigationChangeEvent,
  ) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  setButtonRef: (node: HTMLButtonElement | null) => void;
};

function BottomNavigationDestination({
  item,
  selected,
  showLabels,
  size,
  indicatorTransition,
  labelTransition,
  reduced,
  barDisabled,
  onSelect,
  onKeyDown,
  setButtonRef,
}: DestinationProps) {
  const sizes = sizeClasses[size];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const itemDisabled = barDisabled || Boolean(item.disabled);
  const stateLayer = itemDisabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const labelVisible =
    showLabels === true || (showLabels === "selected" && selected);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (itemDisabled) return;
    onSelect(item, event);
  };

  const glyph = selected && item.selectedIcon ? item.selectedIcon : item.icon;

  return (
    <button
      ref={setButtonRef}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-current={selected ? "page" : undefined}
      aria-label={item["aria-label"] ?? undefined}
      aria-disabled={itemDisabled || undefined}
      disabled={itemDisabled}
      tabIndex={selected ? 0 : -1}
      data-slot="destination"
      data-id={item.id}
      data-selected={selected || undefined}
      data-disabled={itemDisabled || undefined}
      data-hovered={hovered || undefined}
      data-focused={focused || undefined}
      data-pressed={pressed || undefined}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => {
        if (!itemDisabled) setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      className={cn(
        anatomy.item,
        sizes.itemPad,
        itemDisabled && "opacity-[0.38] cursor-not-allowed",
      )}
    >
      <span
        data-slot="icon-wrap"
        className={anatomy.iconWrap}
        style={{ width: sizes.indicator.w, height: sizes.indicator.h }}
      >
        <motion.span
          aria-hidden
          data-slot="indicator"
          className={anatomy.indicator}
          initial={false}
          animate={{
            opacity: selected ? 1 : 0,
            scaleX: selected ? 1 : 0.6,
            x: "-50%",
            y: "-50%",
          }}
          transition={indicatorTransition}
          style={{ width: sizes.indicator.w, height: sizes.indicator.h }}
        />
        <span
          aria-hidden
          data-slot="state-layer"
          className={anatomy.stateLayer}
          style={{
            width: sizes.indicator.w,
            height: sizes.indicator.h,
            opacity: stateLayer,
            transform: "translate(-50%, -50%)",
          }}
        />
        {focused && !itemDisabled ? (
          <span
            aria-hidden
            data-slot="focus-ring"
            className={anatomy.focusRing}
            style={{
              width: sizes.indicator.w + 4,
              height: sizes.indicator.h + 4,
              transform: "translate(-50%, -50%)",
            }}
          />
        ) : null}
        <motion.span
          data-slot="icon"
          className={cn(
            anatomy.icon,
            sizes.iconSize,
            selected ? stateColors.iconSelected : stateColors.iconRest,
          )}
          initial={false}
          animate={{ scale: pressed && !reduced ? 0.92 : 1 }}
          transition={reduced ? { duration: 0 } : springs.snappy}
        >
          {glyph}
        </motion.span>
        {item.badge ? (
          <span data-slot="badge" className={anatomy.badge}>
            {item.badge}
          </span>
        ) : null}
      </span>
      <motion.span
        data-slot="label"
        className={cn(
          anatomy.label,
          sizes.labelType,
          selected ? stateColors.labelSelected : stateColors.labelRest,
        )}
        initial={false}
        animate={{
          opacity: labelVisible ? 1 : 0,
          height: labelVisible ? "auto" : 0,
        }}
        transition={labelTransition}
      >
        {item.label}
      </motion.span>
    </button>
  );
}
