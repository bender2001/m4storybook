import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ChangeEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import { anatomy, sizeSpec } from "./anatomy";
import type { SliderProps } from "./types";

export type { SliderProps, SliderSize } from "./types";

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const roundToStep = (raw: number, min: number, step: number) => {
  if (step <= 0) return raw;
  const offset = (raw - min) / step;
  const rounded = min + Math.round(offset) * step;
  const decimals = step.toString().split(".")[1]?.length ?? 0;
  return Number(rounded.toFixed(decimals));
};

const normalizeValue = (raw: number, min: number, max: number, step: number) =>
  clamp(roundToStep(raw, min, step), min, max);

const valueToPercent = (value: number, min: number, max: number) => {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
};

const keysThatCommit = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
];

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  function Slider(
    {
      label,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      ticks = false,
      labeled = false,
      valueLabel,
      size = "xs",
      disabled = false,
      error = false,
      helperText,
      leadingIcon,
      trailingIcon,
      onInput,
      onChange,
      id,
      name,
      "aria-label": ariaLabel,
      className,
    },
    ref,
  ) {
    const reactId = useId();
    const fieldId = id ?? `slider-${reactId}`;
    const helperId = helperText ? `${fieldId}-helper` : undefined;

    const reduced = useReducedMotion();
    const trackRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const isControlled = value !== undefined;
    const initial = useMemo(() => {
      const seed = defaultValue ?? value ?? min;
      return normalizeValue(seed, min, max, step);
    }, [defaultValue, value, min, max, step]);
    const [internal, setInternal] = useState(initial);
    const current = isControlled
      ? normalizeValue(value ?? min, min, max, step)
      : normalizeValue(internal, min, max, step);

    const latestValueRef = useRef(current);
    latestValueRef.current = current;

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleActive = focused || pressed || dragging;

    const layerOpacity = disabled
      ? 0
      : dragging
        ? stateLayerOpacity.dragged
        : pressed
          ? stateLayerOpacity.pressed
          : focused
            ? stateLayerOpacity.focus
            : hovered
              ? stateLayerOpacity.hover
              : 0;

    const updateValue = useCallback(
      (next: number, options: { commit?: boolean } = {}) => {
        const normalized = normalizeValue(next, min, max, step);

        if (normalized !== latestValueRef.current) {
          latestValueRef.current = normalized;
          if (!isControlled) setInternal(normalized);
          onInput?.(normalized);
        }

        if (options.commit) onChange?.(normalized);
      },
      [isControlled, max, min, onChange, onInput, step],
    );

    const valueFromPointer = useCallback(
      (clientX: number) => {
        const el = trackRef.current;
        if (!el) return latestValueRef.current;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return latestValueRef.current;
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        return min + ratio * (max - min);
      },
      [max, min],
    );

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      setPressed(true);
      updateValue(valueFromPointer(e.clientX));
      inputRef.current?.focus();
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging || disabled) return;
      updateValue(valueFromPointer(e.clientX));
    };

    const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      setDragging(false);
      setPressed(false);
      updateValue(valueFromPointer(e.clientX), { commit: true });
    };

    const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      if (Number.isFinite(next)) updateValue(next);
    };

    const handleNativeKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
      if (keysThatCommit.includes(e.key)) onChange?.(latestValueRef.current);
    };

    useEffect(() => {
      if (!disabled) return;
      setHovered(false);
      setFocused(false);
      setPressed(false);
      setDragging(false);
    }, [disabled]);

    const sz = sizeSpec[size];
    const percent = valueToPercent(current, min, max);
    const displayValue =
      typeof valueLabel === "function"
        ? valueLabel(current)
        : valueLabel ?? String(current);
    const showValueIndicator = labeled && (focused || pressed || dragging);
    const activeColor = error ? "bg-error" : "bg-primary";
    const inactiveColor = error ? "bg-error-container" : "bg-secondary-container";
    const handleColor = error ? "bg-error" : "bg-primary";

    const stopValues = useMemo(() => {
      if (!ticks) return [max];
      if (step <= 0) return [min, max];

      const items: number[] = [];
      for (let v = min; v <= max + 1e-9; v += step) {
        items.push(normalizeValue(v, min, max, step));
      }

      return Array.from(new Set(items));
    }, [max, min, step, ticks]);

    return (
      <div
        className={cn(anatomy.root, className)}
        data-slider-root
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        data-ticks={ticks || undefined}
        data-labeled={labeled || undefined}
        data-size={size}
      >
        {label ? (
          <div className={anatomy.header}>
            <label htmlFor={fieldId} className={anatomy.label}>
              {label}
            </label>
          </div>
        ) : null}

        <div
          className={cn(anatomy.field, sz.fieldClass)}
          data-slider-field
        >
          {leadingIcon ? (
            <span aria-hidden className={anatomy.leadingIcon}>
              {leadingIcon}
            </span>
          ) : null}

          <div
            ref={trackRef}
            data-slider-track
            className={cn(anatomy.trackWrapper, sz.fieldClass)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => {
              setHovered(false);
              if (!dragging) setPressed(false);
            }}
          >
            <span
              aria-hidden
              data-slider-track-active
              className={cn(
                anatomy.track,
                "left-0",
                disabled ? "bg-on-surface opacity-[0.38]" : activeColor,
              )}
              style={{
                width: `max(0px, calc(${percent}% - ${sz.handleGap}px))`,
                height: sz.trackHeight,
                borderRadius: sz.trackRadius,
              }}
            />
            <span
              aria-hidden
              data-slider-track-inactive
              className={cn(
                anatomy.track,
                disabled ? "bg-on-surface opacity-[0.12]" : inactiveColor,
              )}
              style={{
                left: `calc(${percent}% + ${sz.handleGap}px)`,
                width: `max(0px, calc(${100 - percent}% - ${sz.handleGap}px))`,
                height: sz.trackHeight,
                borderRadius: sz.trackRadius,
              }}
            />

            {stopValues.map((stop, idx) => {
              const stopPct = valueToPercent(stop, min, max);
              const isSelected = stop <= current;
              return (
                <span
                  key={`${stop}-${idx}`}
                  aria-hidden
                  data-slider-stop
                  data-on-active={isSelected || undefined}
                  className={cn(
                    anatomy.stop,
                    disabled
                      ? "bg-on-surface opacity-[0.38]"
                      : isSelected
                        ? "bg-on-primary"
                        : "bg-on-secondary-container",
                  )}
                  style={{ left: `${stopPct}%` }}
                />
              );
            })}

            <span
              aria-hidden
              data-slider-handle
              data-active={handleActive || undefined}
              className={cn(
                anatomy.handle,
                disabled ? "bg-on-surface opacity-[0.38]" : handleColor,
              )}
              style={{
                left: `${percent}%`,
                width: handleActive ? sz.activeHandleWidth : sz.handleWidth,
                height: sz.handleHeight,
              }}
            >
              <span
                aria-hidden
                data-slider-handle-state-layer
                className={anatomy.handleStateLayer}
                style={{ opacity: layerOpacity }}
              />
            </span>

            <AnimatePresence>
              {showValueIndicator ? (
                <motion.span
                  key="indicator"
                  data-slider-value-indicator
                  className={anatomy.valueIndicator}
                  style={{
                    bottom: `calc(50% + ${sz.handleHeight / 2 + 12}px)`,
                    left: `clamp(24px, ${percent}%, calc(100% - 24px))`,
                  }}
                  initial={{ opacity: 0, y: 6, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.92 }}
                  transition={
                    reduced ? { duration: 0 } : tweens.emphasizedDecelerate
                  }
                >
                  {displayValue}
                </motion.span>
              ) : null}
            </AnimatePresence>

            <input
              ref={inputRef}
              id={fieldId}
              name={name}
              type="range"
              min={min}
              max={max}
              step={step}
              value={current}
              disabled={disabled}
              aria-label={ariaLabel ?? label}
              aria-describedby={helperId}
              aria-invalid={error || undefined}
              aria-valuetext={displayValue}
              data-slider-input
              className={anatomy.nativeInput}
              onChange={handleNativeChange}
              onKeyUp={handleNativeKeyUp}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false);
                setPressed(false);
              }}
            />
          </div>

          {trailingIcon ? (
            <span aria-hidden className={anatomy.trailingIcon}>
              {trailingIcon}
            </span>
          ) : null}
        </div>

        {helperText ? (
          <p
            id={helperId}
            data-slider-helper
            className={cn(anatomy.helperText, error && "text-error")}
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
