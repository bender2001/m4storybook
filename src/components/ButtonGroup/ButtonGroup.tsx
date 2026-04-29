import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  orientationGap,
  segmentRadiusClasses,
  segmentSizeClasses,
  segmentVariantClasses,
  variantContainerClasses,
} from "./anatomy";
import type {
  ButtonGroupOption,
  ButtonGroupProps,
} from "./types";

export type {
  ButtonGroupOption,
  ButtonGroupOrientation,
  ButtonGroupProps,
  ButtonGroupSize,
  ButtonGroupVariant,
} from "./types";

const radiusFor = (
  orientation: "horizontal" | "vertical",
  total: number,
  index: number,
): string => {
  const r = segmentRadiusClasses[orientation];
  if (total === 1) return r.only;
  if (index === 0) return r.first;
  if (index === total - 1) return r.last;
  return r.middle;
};

const isMulti = (
  mode: "single" | "multi",
  v: string | string[] | null | undefined,
): v is string[] => mode === "multi" && Array.isArray(v);

const normalize = (
  mode: "single" | "multi",
  v: string | string[] | null | undefined,
): string[] => {
  if (v == null) return [];
  if (mode === "multi") return Array.isArray(v) ? v : [v];
  return Array.isArray(v) ? v.slice(0, 1) : [v];
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(
    {
      options,
      selectionMode = "single",
      value,
      defaultValue = null,
      onChange,
      variant = "outlined",
      size = "md",
      orientation = "horizontal",
      disabled = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<
      string | string[] | null
    >(defaultValue);
    const currentValue = isControlled ? value ?? null : internalValue;

    const selectedSet = useMemo(
      () => new Set(normalize(selectionMode, currentValue)),
      [selectionMode, currentValue],
    );

    const commit = useCallback(
      (next: string | string[] | null) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const handleSelect = (option: ButtonGroupOption) => {
      if (disabled || option.disabled) return;
      if (selectionMode === "multi") {
        const current = isMulti(selectionMode, currentValue)
          ? currentValue
          : [];
        const has = current.includes(option.value);
        const next = has
          ? current.filter((v) => v !== option.value)
          : [...current, option.value];
        commit(next);
        return;
      }
      // single — toggle off if pressing the active item.
      const isActive = selectedSet.has(option.value);
      commit(isActive ? null : option.value);
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        data-orientation={orientation}
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          variantContainerClasses[variant],
          orientationGap[orientation],
          "flex",
          className,
        )}
        {...rest}
      >
        {options.map((opt, index) => (
          <Segment
            key={opt.value}
            option={opt}
            index={index}
            total={options.length}
            orientation={orientation}
            selectionMode={selectionMode}
            selected={selectedSet.has(opt.value)}
            disabled={disabled || !!opt.disabled}
            variant={variant}
            size={size}
            reduced={!!reduced}
            onSelect={handleSelect}
          />
        ))}
      </div>
    );
  },
);

interface SegmentProps {
  option: ButtonGroupOption;
  index: number;
  total: number;
  orientation: "horizontal" | "vertical";
  selectionMode: "single" | "multi";
  selected: boolean;
  disabled: boolean;
  variant: NonNullable<ButtonGroupProps["variant"]>;
  size: NonNullable<ButtonGroupProps["size"]>;
  reduced: boolean;
  onSelect: (option: ButtonGroupOption) => void;
}

function Segment({
  option,
  index,
  total,
  orientation,
  selectionMode,
  selected,
  disabled,
  variant,
  size,
  reduced,
  onSelect,
}: SegmentProps) {
  const ref = useRef<HTMLButtonElement>(null);
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
          : selected
            ? stateLayerOpacity.hover
            : 0;

  const variantStyles = segmentVariantClasses[variant];

  return (
    <motion.button
      ref={ref}
      type="button"
      role={selectionMode === "single" ? "radio" : "checkbox"}
      aria-checked={selected}
      aria-label={option.ariaLabel}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-selected={selected || undefined}
      data-segment-index={index}
      whileHover={disabled || reduced ? undefined : { scale: 1.02 }}
      whileTap={disabled || reduced ? undefined : { scale: 0.97 }}
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
      onClick={() => onSelect(option)}
      className={cn(
        anatomy.segment,
        segmentSizeClasses[size],
        radiusFor(orientation, total, index),
        selected ? variantStyles.selected : variantStyles.rest,
      )}
    >
      <span
        aria-hidden
        data-state-layer
        className={cn(anatomy.stateLayer, variantStyles.stateLayer)}
        style={{ opacity: stateLayer }}
      />
      {option.startIcon ? (
        <span aria-hidden className={anatomy.icon}>
          {option.startIcon}
        </span>
      ) : null}
      <span className={anatomy.label}>{option.label}</span>
      {option.endIcon ? (
        <span aria-hidden className={anatomy.icon}>
          {option.endIcon}
        </span>
      ) : null}
    </motion.button>
  );
}
