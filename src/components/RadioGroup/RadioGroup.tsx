import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, FocusEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  disabledClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { RadioGroupProps, RadioOption } from "./types";

export type {
  RadioGroupProps,
  RadioOption,
  RadioSize,
  RadioVariant,
} from "./types";

interface RadioRowProps<TValue extends string> {
  option: RadioOption<TValue>;
  name: string;
  groupId: string;
  size: NonNullable<RadioGroupProps["size"]>;
  variant: NonNullable<RadioGroupProps["variant"]>;
  labelPlacement: NonNullable<RadioGroupProps["labelPlacement"]>;
  selected: boolean;
  groupDisabled: boolean;
  reduced: boolean | null;
  onSelect: (value: TValue) => void;
  describedBy?: string;
}

function RadioRow<TValue extends string>({
  option,
  name,
  groupId,
  size,
  variant,
  labelPlacement,
  selected,
  groupDisabled,
  reduced,
  onSelect,
  describedBy,
}: RadioRowProps<TValue>): ReactNode {
  const reactId = useId();
  const inputId = `${groupId}-${reactId}`;
  const helperId = option.helperText ? `${inputId}-helper` : undefined;
  const disabled = groupDisabled || option.disabled === true;

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (event.target.checked) {
        onSelect(option.value);
      }
    },
    [disabled, onSelect, option.value],
  );

  const stateLayerOpacityValue = disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const sizes = sizeClasses[size];
  const variantStyles = variantClasses[variant];

  const circleStateClass = selected
    ? disabled
      ? disabledClasses.selectedCircle
      : variantStyles.selected
    : disabled
      ? disabledClasses.circle
      : variantStyles.rest;

  const dotColor = disabled ? disabledClasses.dot : variantStyles.dot;

  const labelColor = disabled
    ? disabledClasses.label
    : variant === "error"
      ? variantStyles.label
      : "text-on-surface";

  const dotSize =
    size === "sm" ? "h-2 w-2" : size === "md" ? "h-2.5 w-2.5" : "h-3 w-3";

  const control = (
    <div
      data-radio-control
      data-checked={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        anatomy.control,
        sizes.control,
        disabled && disabledClasses.control,
      )}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
    >
      <span
        aria-hidden
        data-state-layer
        className={cn(anatomy.stateLayer, variantStyles.stateLayer)}
        style={{ opacity: stateLayerOpacityValue }}
      />
      <motion.span
        aria-hidden
        data-radio-circle
        className={cn(anatomy.circle, sizes.circle, circleStateClass)}
        initial={false}
        animate={
          reduced
            ? { scale: 1 }
            : pressed
              ? { scale: 0.92 }
              : { scale: 1 }
        }
        transition={reduced ? { duration: 0 } : springs.springy}
      >
        <AnimatePresence initial={false} mode="wait">
          {selected ? (
            <motion.span
              key="dot"
              data-radio-dot
              className={cn(anatomy.dot, dotSize, dotColor)}
              initial={reduced ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : springs.springy}
            />
          ) : null}
        </AnimatePresence>
      </motion.span>
      <input
        type="radio"
        id={inputId}
        name={name}
        value={option.value}
        aria-checked={selected}
        aria-describedby={describedBy ?? helperId}
        aria-invalid={variant === "error" || undefined}
        disabled={disabled}
        checked={selected}
        onChange={handleChange}
        onFocus={(e: FocusEvent<HTMLInputElement>) => {
          setFocused(true);
          void e;
        }}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        className={anatomy.input}
      />
    </div>
  );

  const labelNode =
    option.label !== undefined || option.helperText !== undefined ? (
      <span className={anatomy.labelColumn}>
        {option.label !== undefined ? (
          <span className={cn(anatomy.label, sizes.label, labelColor)}>
            {option.startIcon ? (
              <span aria-hidden className={cn(anatomy.icon, "mr-1.5")}>
                {option.startIcon}
              </span>
            ) : null}
            {option.label}
            {option.endIcon ? (
              <span aria-hidden className={cn(anatomy.icon, "ml-1.5")}>
                {option.endIcon}
              </span>
            ) : null}
          </span>
        ) : null}
        {option.helperText !== undefined ? (
          <span id={helperId} className={anatomy.helper}>
            {option.helperText}
          </span>
        ) : null}
      </span>
    ) : null;

  return (
    <label
      htmlFor={inputId}
      data-radio-root
      data-disabled={disabled || undefined}
      className={cn(
        anatomy.root,
        labelPlacement === "start" && "flex-row-reverse",
        disabled && "cursor-not-allowed",
      )}
    >
      {control}
      {labelNode}
    </label>
  );
}

/**
 * M3 Expressive Radio Group. Spec lives at
 * https://m3.material.io/components/radio-button/specs.
 *
 * - 20dp ring with a 10dp inner dot when selected.
 * - State-layer is a 40dp circle that paints at the M3 opacities.
 * - Selected ring + dot = primary; error variant swaps both to the
 *   error role.
 * - Springy motion (motion/react) on press + dot enter; collapses to
 *   no transition under reduced motion.
 *
 * Structure: a `<div role="radiogroup">` wraps a column (or row) of
 * `<label htmlFor>` rows. Each label hosts the visual circle + the
 * native `<input type="radio">` (visually hidden, full size).
 */
export function RadioGroup<TValue extends string = string>(
  props: RadioGroupProps<TValue>,
) {
  const {
    name,
    options,
    value,
    defaultValue,
    onChange,
    size = "md",
    variant = "default",
    disabled = false,
    orientation = "vertical",
    labelPlacement = "end",
    legend,
    helperText,
    className,
    id,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
    ...rest
  } = props;
  const reduced = useReducedMotion();
  const reactId = useId();
  const groupId = id ?? `radiogroup-${reactId}`;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const legendId = legend ? `${groupId}-legend` : undefined;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<TValue | null>(
    defaultValue ?? null,
  );
  const current = isControlled ? value : internal;

  // Use a stable ref to avoid re-deriving onSelect identity each render.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleSelect = useCallback(
    (next: TValue) => {
      if (!isControlled) {
        setInternal(next);
      }
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  const describedBy = useMemo(() => {
    const ids = [helperId, ariaDescribedBy].filter(Boolean) as string[];
    return ids.length > 0 ? ids.join(" ") : undefined;
  }, [helperId, ariaDescribedBy]);

  return (
    <div
      {...rest}
      id={groupId}
      role="radiogroup"
      data-radio-group
      data-orientation={orientation}
      aria-label={ariaLabel}
      aria-labelledby={legendId ?? undefined}
      aria-describedby={describedBy}
      aria-disabled={disabled || undefined}
      className={cn(anatomy.group, className)}
    >
      {legend !== undefined ? (
        <span id={legendId} className={anatomy.legend}>
          {legend}
        </span>
      ) : null}
      {helperText !== undefined ? (
        <span id={helperId} className={anatomy.groupHelper}>
          {helperText}
        </span>
      ) : null}
      <div
        data-radio-options
        className={cn(
          anatomy.options,
          orientation === "horizontal" ? "flex-row gap-4" : "flex-col",
        )}
      >
        {options.map((option) => (
          <RadioRow
            key={option.value}
            option={option}
            name={name}
            groupId={groupId}
            size={size}
            variant={variant}
            labelPlacement={labelPlacement}
            selected={current === option.value}
            groupDisabled={disabled}
            reduced={reduced}
            onSelect={handleSelect}
            describedBy={helperId}
          />
        ))}
      </div>
    </div>
  );
}
