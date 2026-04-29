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

export type { SliderProps, SliderSize, SliderVariant } from "./types";

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const roundToStep = (raw: number, min: number, step: number) => {
  if (step <= 0) return raw;
  const offset = (raw - min) / step;
  return min + Math.round(offset) * step;
};

const valueToPercent = (value: number, min: number, max: number) => {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
};

/**
 * M3 Expressive Slider — single-thumb, continuous or discrete.
 *
 * Anatomy (M3): inactive track + active track + pill handle + optional
 * stop indicators (discrete) + value bubble. Track height defaults to
 * 16dp at the medium density. Active track + handle paint the
 * `primary` role; inactive paints `secondary-container`.
 *
 * Interaction model:
 *   - Drag the handle anywhere along the track to move it.
 *   - Click the track to jump the handle to that position.
 *   - Arrow keys move ±1 step, Home / End jump to min / max,
 *     PageUp / PageDown move ±10 steps.
 *
 * A visually-hidden native `<input type="range">` owns the keyboard
 * model and form value. The custom track + handle paint everything
 * else with M3 tokens.
 *
 * Motion: handle width morphs from 4dp → 10dp on press (shape morph),
 * value bubble fades + lifts in on focus/drag through motion/react
 * with the M3 emphasized-decelerate tween. Reduced-motion collapses
 * both to 0ms.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  function Slider(
    {
      label,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      variant = "continuous",
      size = "md",
      disabled = false,
      error = false,
      helperText,
      leadingIcon,
      trailingIcon,
      showValueLabel = true,
      formatValue,
      onChange,
      onChangeCommitted,
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
      return clamp(roundToStep(seed, min, step), min, max);
    }, [defaultValue, value, min, max, step]);
    const [internal, setInternal] = useState(initial);
    const current = isControlled
      ? clamp(roundToStep(value ?? min, min, step), min, max)
      : internal;

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [dragging, setDragging] = useState(false);

    // M3 state-layer per spec: hover 0.08, focus 0.10, pressed 0.10,
    // dragged 0.16. Disabled suppresses the layer entirely.
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

    const commitValue = useCallback(
      (next: number, options: { commit?: boolean } = {}) => {
        const clamped = clamp(roundToStep(next, min, step), min, max);
        if (clamped !== current) {
          if (!isControlled) setInternal(clamped);
          onChange?.(clamped);
        }
        if (options.commit) onChangeCommitted?.(clamped);
      },
      [current, isControlled, max, min, onChange, onChangeCommitted, step],
    );

    const valueFromPointer = useCallback(
      (clientX: number) => {
        const el = trackRef.current;
        if (!el) return current;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0) return current;
        const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
        return min + ratio * (max - min);
      },
      [current, max, min],
    );

    const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);
      setDragging(true);
      setPressed(true);
      commitValue(valueFromPointer(e.clientX));
      // Bring focus to the native input so keyboard works after drag.
      inputRef.current?.focus();
    };

    const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging || disabled) return;
      commitValue(valueFromPointer(e.clientX));
    };

    const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      const target = e.currentTarget;
      if (target.hasPointerCapture(e.pointerId))
        target.releasePointerCapture(e.pointerId);
      setDragging(false);
      setPressed(false);
      commitValue(valueFromPointer(e.clientX), { commit: true });
    };

    // Keyboard model — driven by the native input change event so
    // Arrow / Home / End / PageUp / PageDown all "just work" in a
    // browser-native, accessible way.
    const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      if (Number.isFinite(next)) commitValue(next);
    };

    const handleNativeKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
      // Treat each keyboard step as a commit — the value already
      // changed on `change`, this just notifies the consumer.
      const triggers = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ];
      if (triggers.includes(e.key)) onChangeCommitted?.(current);
    };

    // Keep state-layer opacity stable when reduced-motion is requested
    // (no transition delay, but the value still applies).
    useEffect(() => {
      if (!disabled) return;
      setHovered(false);
      setFocused(false);
      setPressed(false);
      setDragging(false);
    }, [disabled]);

    const sz = sizeSpec[size];
    const percent = valueToPercent(current, min, max);
    const fmt = formatValue ?? ((v: number) => String(v));
    const displayValue = fmt(current);

    // Stop indicators for the discrete variant. Skip rendering at the
    // ends since the active track + handle already cover them.
    const stops = useMemo(() => {
      if (variant !== "discrete") return [] as number[];
      if (step <= 0) return [];
      const items: number[] = [];
      for (let v = min; v <= max + 1e-9; v += step) {
        items.push(v);
      }
      return items;
    }, [variant, step, min, max]);

    const showBubble = showValueLabel && (focused || dragging);

    return (
      <div
        className={cn(anatomy.root, className)}
        data-slider-root
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        data-variant={variant}
        data-size={size}
      >
        {label || showValueLabel ? (
          <div className={anatomy.header}>
            {label ? (
              <label htmlFor={fieldId} className={anatomy.label}>
                {label}
              </label>
            ) : (
              <span />
            )}
            {showValueLabel ? (
              <span data-slider-value-text className={anatomy.valueText}>
                {displayValue}
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(
            anatomy.field,
            sz.field,
            disabled && "opacity-[0.38] pointer-events-none",
          )}
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
            className={cn(anatomy.trackWrapper, sz.field)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => {
              setHovered(false);
              if (!dragging) setPressed(false);
            }}
          >
            <span
              aria-hidden
              data-slider-track-inactive
              className={cn(
                "absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-shape-full",
                error ? "bg-error-container" : "bg-secondary-container",
                sz.trackHeight,
              )}
            />
            <span
              aria-hidden
              data-slider-track-active
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 rounded-shape-full transition-[width] duration-short4 ease-standard",
                error ? "bg-error" : "bg-primary",
                sz.trackHeight,
              )}
              style={{ width: `${percent}%` }}
            />

            {variant === "discrete"
              ? stops.map((stop, idx) => {
                  const stopPct = valueToPercent(stop, min, max);
                  const isOnActive = stop <= current;
                  return (
                    <span
                      key={`${stop}-${idx}`}
                      aria-hidden
                      data-slider-stop
                      data-on-active={isOnActive || undefined}
                      className={cn(
                        anatomy.stop,
                        sz.stopSize,
                        isOnActive && "bg-on-primary opacity-80",
                      )}
                      style={{ left: `${stopPct}%` }}
                    />
                  );
                })
              : null}

            <motion.span
              aria-hidden
              data-slider-handle
              data-pressed={pressed || dragging || undefined}
              className={cn(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
                "rounded-shape-full outline-none focus-visible:ring-0",
                "transition-[width,height] duration-short4 ease-emphasized",
                error ? "bg-error" : "bg-primary",
                pressed || dragging ? sz.handlePressedWidth : sz.handleWidth,
                sz.handleHeight,
              )}
              style={{ left: `${percent}%` }}
              animate={{ scale: pressed || dragging ? 1.02 : 1 }}
              transition={reduced ? { duration: 0 } : tweens.standard}
            >
              <span
                aria-hidden
                data-slider-handle-state-layer
                className={cn(anatomy.handleStateLayer, sz.stateLayerSize)}
                style={{ opacity: layerOpacity }}
              />
            </motion.span>

            <AnimatePresence>
              {showBubble ? (
                <motion.span
                  key="bubble"
                  data-slider-value-bubble
                  className={anatomy.valueBubble}
                  style={{ left: `${percent}%` }}
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
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
