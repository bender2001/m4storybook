import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
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
import type { CheckboxProps } from "./types";

export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
} from "./types";

const isIndeterminate = (
  v: boolean | "indeterminate" | undefined,
): boolean => v === "indeterminate";

const isChecked = (v: boolean | "indeterminate" | undefined): boolean =>
  v === true || v === "indeterminate";

/**
 * M3 Expressive Checkbox. Spec lives at
 * https://m3.material.io/components/checkbox/specs.
 *
 * - 18dp box with 2dp shape-xs corner radius.
 * - State-layer is a 40dp circle that paints at the M3 opacities.
 * - Selected fill = primary, glyph stroke = on-primary; error variant
 *   swaps both to the error role.
 * - Indeterminate renders a horizontal bar; the SVG morphs with a
 *   springy motion preset (collapses to no transition under reduced
 *   motion).
 *
 * Structure: an outer `<label>` wraps the control + label so clicking
 * anywhere inside toggles the native input. The control div hosts the
 * state-layer, the visual 18dp box, and the (visually-hidden) native
 * input.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked = false,
      onChange,
      size = "md",
      variant = "default",
      label,
      labelPlacement = "end",
      helperText,
      startIcon,
      endIcon,
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
    const inputId = id ?? `checkbox-${reactId}`;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const isControlled = checked !== undefined;
    const [internal, setInternal] = useState<boolean | "indeterminate">(
      defaultChecked,
    );
    const value = isControlled ? checked : internal;

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    // Native input does not honor "indeterminate" via attributes —
    // sync it imperatively whenever the value changes.
    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.indeterminate = isIndeterminate(value);
    }, [value]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.checked;
        if (!isControlled) {
          setInternal(next);
        }
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const checkedNow = isChecked(value);
    const indeterminate = isIndeterminate(value);
    const variantStyles = variantClasses[variant];

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

    const boxStateClass = checkedNow
      ? disabled
        ? disabledClasses.selectedBox
        : variantStyles.selected
      : disabled
        ? disabledClasses.box
        : variantStyles.rest;

    const glyphColor = disabled ? disabledClasses.glyph : variantStyles.glyph;

    const labelColor = disabled
      ? disabledClasses.label
      : variant === "error"
        ? variantStyles.label
        : "text-on-surface";

    const control = (
      <div
        data-checkbox-control
        data-checked={checkedNow || undefined}
        data-indeterminate={indeterminate || undefined}
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
          data-checkbox-box
          className={cn(anatomy.box, sizes.box, boxStateClass)}
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
          <span
            className={cn(
              anatomy.glyphWrapper,
              sizes.glyph,
              "m-auto",
              glyphColor,
            )}
          >
            <AnimatePresence initial={false} mode="wait">
              {indeterminate ? (
                <motion.svg
                  key="indeterminate"
                  data-checkbox-glyph="indeterminate"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-full w-full"
                  initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={reduced ? { duration: 0 } : springs.springy}
                >
                  <line
                    x1="6"
                    y1="12"
                    x2="18"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </motion.svg>
              ) : checkedNow ? (
                <motion.svg
                  key="check"
                  data-checkbox-glyph="check"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-full w-full"
                  initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
                  transition={reduced ? { duration: 0 } : springs.springy}
                >
                  <motion.path
                    d="M5 12.5 10 17 19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              ) : null}
            </AnimatePresence>
          </span>
        </motion.span>
        <input
          ref={innerRef}
          type="checkbox"
          id={inputId}
          name={name}
          aria-checked={
            indeterminate ? "mixed" : checkedNow ? "true" : "false"
          }
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy ?? helperId}
          aria-invalid={variant === "error" || undefined}
          disabled={disabled}
          checked={checkedNow}
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
          {...rest}
        />
      </div>
    );

    const labelNode =
      label !== undefined || helperText !== undefined ? (
        <span className={anatomy.labelColumn}>
          {label !== undefined ? (
            <span className={cn(anatomy.label, sizes.label, labelColor)}>
              {startIcon ? (
                <span aria-hidden className={cn(anatomy.icon, "mr-1.5")}>
                  {startIcon}
                </span>
              ) : null}
              {label}
              {endIcon ? (
                <span aria-hidden className={cn(anatomy.icon, "ml-1.5")}>
                  {endIcon}
                </span>
              ) : null}
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
        data-checkbox-root
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
