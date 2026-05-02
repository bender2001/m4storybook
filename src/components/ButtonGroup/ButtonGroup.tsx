import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { cn } from "@/lib/cn";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  buttonActionColorClasses,
  buttonToggleColorClasses,
  rootRadius,
  rootVariantClasses,
  sizeSpec,
  squareOuterRadius,
} from "./anatomy";
import type {
  ButtonGroupOption,
  ButtonGroupProps,
  ButtonGroupShape,
  ButtonGroupSize,
  ButtonGroupVariant,
  ButtonGroupWidth,
} from "./types";

export type {
  ButtonGroupButtonColor,
  ButtonGroupButtonVariant,
  ButtonGroupOption,
  ButtonGroupProps,
  ButtonGroupSelectionMode,
  ButtonGroupShape,
  ButtonGroupSize,
  ButtonGroupVariant,
  ButtonGroupWidth,
} from "./types";

const expressiveSpring: Transition = {
  type: "spring",
  stiffness: 1400,
  damping: 40,
  mass: 1,
};

const isMulti = (
  mode: "none" | "single" | "multi",
  v: string | string[] | null | undefined,
): v is string[] => mode === "multi" && Array.isArray(v);

const normalize = (
  mode: "none" | "single" | "multi",
  v: string | string[] | null | undefined,
): string[] => {
  if (mode === "none") return [];
  if (v == null) return [];
  if (mode === "multi") return Array.isArray(v) ? v : [v];
  return Array.isArray(v) ? v.slice(0, 1) : [v];
};

const optionWidth = (option: ButtonGroupOption): ButtonGroupWidth => {
  if (option.width) return option.width;
  if (option.label === undefined) return "narrow";
  return "default";
};

const standardRadius = (
  shape: ButtonGroupShape,
  size: ButtonGroupSize,
  active: boolean,
) => {
  const square = `${squareOuterRadius[size]}px`;
  if (!active) return shape === "round" ? "9999px" : square;
  return shape === "round" ? square : "9999px";
};

const connectedRadius = ({
  index,
  total,
  shape,
  size,
  selected,
  pressed,
}: {
  index: number;
  total: number;
  shape: ButtonGroupShape;
  size: ButtonGroupSize;
  selected: boolean;
  pressed: boolean;
}) => {
  const sz = sizeSpec[size];

  if (selected) return sz.selectedInnerRadius;
  if (pressed) return `${sz.pressedInnerRadius}px`;
  if (total === 1) return rootRadius(shape, size);

  const outer = rootRadius(shape, size);
  const inner = shape === "round" ? `${sz.innerRadius}px` : "0px";

  if (index === 0) {
    return `${outer} ${inner} ${inner} ${outer}`;
  }

  if (index === total - 1) {
    return `${inner} ${outer} ${outer} ${inner}`;
  }

  return inner;
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      options,
      variant = "standard",
      buttonColor,
      buttonVariant,
      selectionMode = "single",
      selectionRequired = false,
      value,
      defaultValue = selectionRequired ? options[0]?.value ?? null : null,
      onChange,
      size = "m",
      shape = "round",
      disabled = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const defaultButtonColor = buttonColor ?? buttonVariant ?? "filled";

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<
      string | string[] | null
    >(defaultValue);
    const currentValue = isControlled ? value ?? null : internalValue;

    const selectedValues = useMemo(
      () => normalize(selectionMode, currentValue),
      [selectionMode, currentValue],
    );
    const selectedSet = useMemo(
      () => new Set(selectedValues),
      [selectedValues],
    );

    const [pressedIndex, setPressedIndex] = useState<number | null>(null);

    const commit = useCallback(
      (next: string | string[] | null) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const handleSelect = (option: ButtonGroupOption) => {
      if (disabled || option.disabled) return;

      if (selectionMode === "none") {
        onChange?.(option.value);
        return;
      }

      if (selectionMode === "multi") {
        const current = isMulti(selectionMode, currentValue)
          ? currentValue
          : [];
        const has = current.includes(option.value);
        if (has && selectionRequired && current.length === 1) return;
        const next = has
          ? current.filter((v) => v !== option.value)
          : [...current, option.value];
        commit(next);
        return;
      }

      const isActive = selectedSet.has(option.value);
      if (isActive && selectionRequired) return;
      commit(isActive ? null : option.value);
    };

    const sz = sizeSpec[size];
    const activeIndexes =
      pressedIndex !== null
        ? [pressedIndex]
        : options
            .map((option, index) =>
              selectedSet.has(option.value) ? index : -1,
            )
            .filter((index) => index >= 0);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        data-button-group-root
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-selection-required={selectionRequired || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          rootVariantClasses[variant],
          className,
        )}
        style={{
          gap:
            variant === "standard"
              ? sz.standardSpace
              : sz.connectedSpace,
        }}
        {...rest}
      >
        {options.map((opt, index) => {
          const selected = selectedSet.has(opt.value);
          const isPressed = pressedIndex === index;
          const scale =
            variant === "standard"
              ? activeIndexes.includes(index)
                ? 1.15
                : activeIndexes.some((activeIndex) =>
                    Math.abs(activeIndex - index) === 1,
                  )
                  ? 0.925
                  : 1
              : 1;

          return (
            <Segment
              key={opt.value}
              option={opt}
              index={index}
              total={options.length}
              selected={selected}
              pressed={isPressed}
              disabled={disabled || !!opt.disabled}
              groupVariant={variant}
              selectable={selectionMode !== "none"}
              defaultButtonColor={defaultButtonColor}
              size={size}
              shape={shape}
              widthScale={scale}
              reduced={!!reduced}
              onPressChange={(next) => {
                setPressedIndex(next ? index : null);
              }}
              onSelect={handleSelect}
            />
          );
        })}
      </div>
    );
  },
);

interface SegmentProps {
  option: ButtonGroupOption;
  index: number;
  total: number;
  selected: boolean;
  pressed: boolean;
  disabled: boolean;
  groupVariant: ButtonGroupVariant;
  selectable: boolean;
  defaultButtonColor: NonNullable<ButtonGroupProps["buttonColor"]>;
  size: ButtonGroupSize;
  shape: ButtonGroupShape;
  widthScale: number;
  reduced: boolean;
  onPressChange: (pressed: boolean) => void;
  onSelect: (option: ButtonGroupOption) => void;
}

function Segment({
  option,
  index,
  total,
  selected,
  pressed,
  disabled,
  groupVariant,
  selectable,
  defaultButtonColor,
  size,
  shape,
  widthScale,
  reduced,
  onPressChange,
  onSelect,
}: SegmentProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visuallySelected = selectable && (selected || pressed);

  const stateLayer = disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : visuallySelected
            ? stateLayerOpacity.hover
            : 0;

  const sz = sizeSpec[size];
  const visualWidth =
    groupVariant === "connected"
      ? "100%"
      : sz.widths[optionWidth(option)] * widthScale;
  const itemWidth =
    groupVariant === "connected"
      ? undefined
      : sz.widths[optionWidth(option)] * widthScale;
  const optionColor =
    option.buttonColor ?? option.buttonVariant ?? defaultButtonColor;
  const actionColorStyles = buttonActionColorClasses[optionColor];
  const toggleColorStyles = buttonToggleColorClasses[optionColor];
  const colorClass = selectable
    ? visuallySelected
      ? toggleColorStyles.selected
      : toggleColorStyles.rest
    : actionColorStyles.rest;
  const stateLayerClass = selectable
    ? visuallySelected
      ? toggleColorStyles.selectedStateLayer
      : toggleColorStyles.restStateLayer
    : actionColorStyles.stateLayer;

  const radius =
    groupVariant === "standard"
      ? standardRadius(shape, size, visuallySelected)
      : connectedRadius({
          index,
          total,
          shape,
          size,
          selected: visuallySelected,
          pressed: false,
        });

  const accessibleName =
    option.ariaLabel ?? (typeof option.label === "string" ? option.label : undefined);

  return (
    <motion.button
      type="button"
      aria-pressed={selectable ? selected : undefined}
      aria-label={accessibleName}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-button-group-segment
      data-selected={selectable && selected ? true : undefined}
      data-pressed={pressed || undefined}
      data-segment-index={index}
      animate={
        groupVariant === "standard"
          ? { width: itemWidth }
          : { flexGrow: 1, flexBasis: 0 }
      }
      transition={reduced ? { duration: 0 } : expressiveSpring}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        onPressChange(false);
      }}
      onPointerDown={() => onPressChange(true)}
      onPointerCancel={() => onPressChange(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onPressChange(false);
      }}
      onClick={() => {
        onSelect(option);
        onPressChange(false);
      }}
      className={cn(
        anatomy.item,
        groupVariant === "connected" && "min-w-0 flex-1 basis-0",
      )}
      style={{
        height: sz.hitTarget,
        minWidth: sz.minWidth,
      }}
    >
      <span
        data-button-group-button
        className={cn(
          anatomy.button,
          sz.textClass,
          colorClass,
          option.label === undefined ? "gap-0 px-0" : "gap-2 px-4",
        )}
        style={{
          height: sz.height,
          minWidth: sz.minWidth,
          width: visualWidth,
          borderRadius: radius,
        }}
      >
        <span
          aria-hidden
          data-state-layer
          className={cn(anatomy.stateLayer, stateLayerClass)}
          style={{ opacity: stateLayer }}
        />
        {option.icon ?? option.startIcon ? (
          <span
            aria-hidden
            className={cn(anatomy.icon, sz.iconSize)}
          >
            {option.icon ?? option.startIcon}
          </span>
        ) : null}
        {option.label !== undefined ? (
          <span className={anatomy.label}>{option.label}</span>
        ) : null}
        {option.endIcon ? (
          <span aria-hidden className={cn(anatomy.icon, sz.iconSize)}>
            {option.endIcon}
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}
