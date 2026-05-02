import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ChangeEvent } from "react";
import { cn } from "@/lib/cn";
import { stateLayerOpacity } from "@/tokens/motion";
import { anatomy, sizeSpec, variantClasses } from "./anatomy";
import type { TextFieldProps } from "./types";

export type {
  TextFieldProps,
  TextFieldSize,
  TextFieldVariant,
} from "./types";

/**
 * M3 Text Field — `filled` (default) and `outlined` variants with a
 * floating label, leading/trailing icon slots, supporting text, error
 * state, and disabled state.
 *
 * Spec at https://m3.material.io/components/text-fields/.
 *
 *  - Filled: 56dp tray (md), rounded-t-shape-xs, bg
 *    surface-container-highest, 1dp on-surface-variant indicator that
 *    grows to 2dp primary on focus.
 *  - Outlined: 56dp tray (md), rounded-shape-xs, transparent bg, 1dp
 *    outline that grows to 2dp primary on focus and cuts through the
 *    floating label at the top edge.
 *  - State-layer (on-surface for filled, primary for outlined) paints
 *    at the M3 opacities (hover 0.08, focus 0.10, pressed 0.10).
 *  - Floating label: body-l resting → body-s floated. Float fires
 *    when the input has focus, a value, or a placeholder.
 *
 * The native `<input>` owns the keyboard model + form submission.
 * The label is connected via htmlFor; helper text via aria-describedby
 * (and aria-invalid flips on error).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      label,
      value,
      defaultValue = "",
      onChange,
      onFocus,
      onBlur,
      placeholder,
      variant = "filled",
      size = "md",
      disabled = false,
      error = false,
      supportingText,
      errorText,
      helperText,
      prefixText,
      suffixText,
      leadingIcon,
      trailingIcon,
      maxLength,
      id,
      name,
      type = "text",
      required,
      readOnly,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      className,
      ...rest
    },
    ref,
  ) {
    const reactId = useId();
    const inputId = id ?? `textfield-${reactId}`;
    const baseSupportingText = supportingText ?? helperText;
    const visibleSupportingText =
      error && errorText !== undefined && errorText !== ""
        ? errorText
        : baseSupportingText;
    const supportingId = visibleSupportingText
      ? `${inputId}-supporting`
      : undefined;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const currentValue = isControlled ? (value ?? "") : internalValue;

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange],
    );

    const stateLayer = disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    // Float when the input is focused, has a value, or has a placeholder
    // (the placeholder occupies the resting label spot, so the label
    // must lift out of the way to keep them from colliding).
    const isFloating = focused || currentValue.length > 0 || Boolean(placeholder);

    const sz = sizeSpec[size];
    const variantStyles = variantClasses[variant];

    const counter =
      typeof maxLength === "number" && maxLength >= 0
        ? `${currentValue.length} / ${maxLength}`
        : undefined;
    const showAffixes = !label || isFloating;

    const supportingColor = disabled
      ? "text-on-surface opacity-[0.38]"
      : error
        ? "text-error"
        : "text-on-surface-variant";
    const labelColor = error
      ? "text-error"
      : focused
        ? "text-primary"
        : "text-on-surface-variant";
    const disabledContentColor = "text-on-surface opacity-[0.38]";
    const labelStateColor = disabled ? disabledContentColor : labelColor;
    const affixColor = disabled
      ? disabledContentColor
      : "text-on-surface-variant";
    const leadingIconColor = disabled
      ? disabledContentColor
      : "text-on-surface-variant";
    const trailingIconColor = disabled
      ? disabledContentColor
      : error
        ? "text-error"
        : "text-on-surface-variant";
    const labelPosition = isFloating
      ? variant === "filled"
        ? sz.labelFloatingFilled
        : sz.labelFloatingOutlined
      : sz.label;
    const labelInset = leadingIcon ? sz.labelLeftWithIcon : sz.labelLeft;
    const inputPadding = label ? sz.inputPaddingWithLabel : sz.inputPadding;
    const disabledFieldStyle: CSSProperties | undefined = disabled
      ? variant === "filled"
        ? {
            backgroundColor:
              "color-mix(in srgb, var(--md-sys-color-on-surface) 4%, transparent)",
            borderBottomColor:
              "color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)",
          }
        : {
            borderColor:
              "color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)",
          }
      : undefined;

    const describedBy =
      [ariaDescribedBy, supportingId].filter(Boolean).join(" ") || undefined;

    return (
      <div
        className={cn(anatomy.root, className)}
        data-textfield-root
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        data-variant={variant}
        data-size={size}
      >
        <div
          className={cn(
            anatomy.field,
            sz.field,
            sz.paddingX,
            variantStyles.field,
            disabled && "pointer-events-none cursor-not-allowed",
            error && "border-error",
          )}
          data-textfield-field
          data-variant={variant}
          data-disabled={disabled || undefined}
          data-focused={focused || undefined}
          data-hovered={hovered || undefined}
          data-pressed={pressed || undefined}
          data-error={error || undefined}
          style={disabledFieldStyle}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => {
            setHovered(false);
            setPressed(false);
          }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onClick={(e) => {
            // Clicking anywhere in the tray (label, gutter, state-layer)
            // should focus the input — this is the M3 text-field UX.
            const target = e.target as HTMLElement;
            if (target.tagName !== "INPUT") {
              innerRef.current?.focus();
            }
          }}
        >
          <span
            aria-hidden
            data-textfield-state-layer
            className={cn(anatomy.stateLayer, variantStyles.stateLayer)}
            style={{ opacity: stateLayer }}
          />

          {leadingIcon ? (
            <span
              aria-hidden
              data-textfield-leading-icon
              className={cn(
                anatomy.leadingIcon,
                sz.iconBox,
                sz.leadingIconMargin,
                leadingIconColor,
              )}
            >
              {leadingIcon}
            </span>
          ) : null}

          {label ? (
            <label
              htmlFor={inputId}
              data-textfield-label
              data-floating={isFloating || undefined}
              className={cn(
                anatomy.label,
                labelPosition,
                labelInset,
                labelStateColor,
              )}
            >
              {label}
            </label>
          ) : null}

          {prefixText && showAffixes ? (
            <span
              aria-hidden
              data-textfield-prefix
              className={cn(
                anatomy.affixText,
                sz.affixType,
                inputPadding,
                affixColor,
              )}
            >
              {prefixText}
            </span>
          ) : null}

          <input
            ref={innerRef}
            id={inputId}
            name={name}
            type={type}
            value={isControlled ? (value ?? "") : undefined}
            defaultValue={isControlled ? undefined : defaultValue}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            disabled={disabled}
            maxLength={maxLength}
            aria-label={ariaLabel}
            aria-describedby={describedBy}
            aria-invalid={error || undefined}
            data-textfield-input
            className={cn(anatomy.input, inputPadding, sz.inputType)}
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
            {...rest}
          />

          {suffixText && showAffixes ? (
            <span
              aria-hidden
              data-textfield-suffix
              className={cn(
                anatomy.affixText,
                sz.affixType,
                inputPadding,
                affixColor,
              )}
            >
              {suffixText}
            </span>
          ) : null}

          {trailingIcon ? (
            <span
              aria-hidden
              data-textfield-trailing-icon
              className={cn(
                anatomy.trailingIcon,
                sz.iconBox,
                sz.trailingIconMargin,
                trailingIconColor,
              )}
            >
              {trailingIcon}
            </span>
          ) : null}
        </div>

        {visibleSupportingText || counter ? (
          <div
            data-textfield-supporting-row
            className={cn(
              anatomy.supportingRow,
              disabled && "text-on-surface opacity-[0.38]",
            )}
          >
            {visibleSupportingText ? (
              <p
                id={supportingId}
                data-textfield-helper
                data-textfield-supporting-text
                className={cn(anatomy.supportingText, supportingColor)}
              >
                {visibleSupportingText}
              </p>
            ) : (
              <span className="min-w-0 flex-1" />
            )}
            {counter ? (
              <span
                aria-hidden
                data-textfield-counter
                className={cn(
                  anatomy.counter,
                  disabled && "text-on-surface opacity-[0.38]",
                )}
              >
                {counter}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
