import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  disabledClasses,
  errorClasses,
  sizeSpec,
  variantClasses,
} from "./anatomy";
import type { SwitchProps } from "./types";

export type { SwitchProps, SwitchSize, SwitchVariant } from "./types";

/**
 * M3 Expressive Switch — pill-shaped toggle with a handle that slides
 * and morphs between states.
 *
 * Spec at https://m3.material.io/components/switch/specs.
 *
 * Track: 52dp × 32dp (md), shape-full pill. Selected paints primary,
 * unselected paints surface-container-highest with an outline border.
 * Handle: 16dp circle when off → 24dp when on → 28dp when pressed
 * (the M3 Expressive shape morph). State-layer is a 40dp circle that
 * paints around the handle at the M3 opacities.
 *
 * The visually-hidden native `<input type="checkbox">` owns the
 * keyboard model (Space toggles) and form value. The visible track +
 * handle paint everything else with M3 tokens.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(
    {
      checked,
      defaultChecked = false,
      onChange,
      size = "md",
      variant = "filled",
      label,
      labelPlacement = "end",
      helperText,
      selectedIcon,
      unselectedIcon,
      error = false,
      disabled = false,
      id,
      name,
      className,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const reactId = useId();
    const inputId = id ?? `switch-${reactId}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const isControlled = checked !== undefined;
    const [internal, setInternal] = useState<boolean>(defaultChecked);
    const isOn = isControlled ? Boolean(checked) : internal;

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.checked;
        if (!isControlled) setInternal(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const sz = sizeSpec[size];

    // Resolve which class set wins. Disabled overrides everything.
    const variantStyles = error ? errorClasses : variantClasses[variant];

    const trackBg = disabled
      ? isOn
        ? disabledClasses.trackSelected
        : disabledClasses.trackUnselected
      : isOn
        ? variantStyles.trackSelected
        : variantStyles.trackUnselected;

    const trackBorder = disabled
      ? isOn
        ? disabledClasses.borderSelected
        : disabledClasses.borderUnselected
      : isOn
        ? variantStyles.borderSelected
        : variantStyles.borderUnselected;

    const handleFill = disabled
      ? isOn
        ? disabledClasses.handleSelected
        : disabledClasses.handleUnselected
      : isOn
        ? variantStyles.handleSelected
        : variantStyles.handleUnselected;

    const iconColor = isOn ? variantStyles.iconSelected : variantStyles.iconUnselected;

    const stateLayerBg = isOn
      ? variantStyles.stateLayerSelected
      : variantStyles.stateLayerUnselected;

    // M3 state-layer per spec: hover 0.08, focus 0.10, pressed 0.10.
    const layerOpacity = disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    // Compute handle position + size in px. The handle slides between
    // the inner-padding edges of the track. Pressed grows the handle
    // outward, anchored to whichever side it's currently on.
    const handleSize = pressed
      ? sz.handle.pressed
      : isOn
        ? sz.handle.selected
        : sz.handle.unselected;
    const handleLeft = isOn
      ? sz.trackWidth - sz.innerPadding - handleSize - 2 /* border */ * 2
      : sz.innerPadding;

    const labelColor = disabled
      ? disabledClasses.label
      : error
        ? "text-error"
        : "text-on-surface";

    const control = (
      <span
        data-switch-control
        data-checked={isOn || undefined}
        data-pressed={pressed || undefined}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        data-variant={variant}
        data-size={size}
        className={cn(
          anatomy.control,
          sz.track,
          trackBg,
          trackBorder,
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
        <motion.span
          aria-hidden
          data-switch-handle
          className={cn(anatomy.handle, handleFill)}
          initial={false}
          animate={{
            left: handleLeft,
            width: handleSize,
            height: handleSize,
            y: "-50%",
          }}
          transition={reduced ? { duration: 0 } : springs.snappy}
        >
          <span
            aria-hidden
            data-switch-state-layer
            className={cn(anatomy.stateLayer, stateLayerBg)}
            style={{
              opacity: layerOpacity,
              width: sz.stateLayer,
              height: sz.stateLayer,
            }}
          />
          {(isOn ? selectedIcon : unselectedIcon) ? (
            <span
              aria-hidden
              data-switch-icon
              className={cn(anatomy.icon, sz.icon, iconColor)}
            >
              {isOn ? selectedIcon : unselectedIcon}
            </span>
          ) : null}
        </motion.span>
        <input
          ref={innerRef}
          id={inputId}
          type="checkbox"
          role="switch"
          name={name}
          aria-checked={isOn}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy ?? helperId}
          aria-invalid={error || undefined}
          disabled={disabled}
          checked={isOn}
          onChange={handleChange}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setPressed(false);
            onBlur?.(e);
          }}
          className={anatomy.input}
          data-switch-input
          {...rest}
        />
      </span>
    );

    const labelNode =
      label !== undefined || helperText !== undefined ? (
        <span className={anatomy.labelColumn}>
          {label !== undefined ? (
            <span className={cn(anatomy.label, sz.label, labelColor)}>
              {label}
            </span>
          ) : null}
          {helperText !== undefined ? (
            <span id={helperId} className={anatomy.helper}>
              {helperText}
            </span>
          ) : null}
        </span>
      ) : null;

    return (
      <label
        htmlFor={inputId}
        data-switch-root
        data-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          labelPlacement === "start" && "flex-row-reverse",
          disabled && "cursor-not-allowed",
          className,
        )}
      >
        {control}
        {labelNode}
      </label>
    );
  },
);
