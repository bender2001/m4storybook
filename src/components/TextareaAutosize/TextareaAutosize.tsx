import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { cn } from "@/lib/cn";
import {
  anatomy,
  colorMatrix,
  shapeClasses,
  sizeClasses,
} from "./anatomy";
import type { TextareaAutosizeProps } from "./types";

export type {
  TextareaAutosizeProps,
  TextareaAutosizeShape,
  TextareaAutosizeSize,
  TextareaAutosizeVariant,
} from "./types";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Reads the line-height resolved on the textarea node so the
 * minRows / maxRows clamps map to real pixels regardless of
 * inherited typography. Falls back to 1.5 * font-size when the
 * computed value is `normal` (some browsers).
 */
const measureLineHeight = (node: HTMLTextAreaElement): number => {
  const cs = window.getComputedStyle(node);
  const lineHeight = parseFloat(cs.lineHeight);
  if (Number.isFinite(lineHeight) && lineHeight > 0) return lineHeight;
  const fontSize = parseFloat(cs.fontSize) || 16;
  return fontSize * 1.5;
};

/**
 * M3 TextareaAutosize. Re-skins the MUI TextareaAutosize API
 * (https://mui.com/material-ui/react-textarea-autosize/) onto the M3
 * text-field surface (https://m3.material.io/components/text-fields/specs).
 * The textarea grows to fit its content between a `minRows` floor
 * (default 1) and a `maxRows` ceiling (default unbounded), using a
 * `scrollHeight` measurement on every value change.
 *
 * Variants:
 *
 *   - standard : surface-container-highest + elevation 0 + xs shape
 *                (M3 filled text-field default).
 *   - tonal    : secondary-container + elevation 0.
 *   - outlined : transparent + 1dp outline border, morphs to 2dp
 *                primary on focus / 2dp error on error.
 *   - text     : transparent fill + no border + elevation 0.
 *   - elevated : surface-container-low + elevation 3 (high-emphasis).
 *
 * Behavior:
 *   - Autosize: textarea height is reset to `auto`, then read from
 *     `scrollHeight`, then clamped to `minRows * lineHeight` /
 *     `maxRows * lineHeight` and applied as inline `height`.
 *   - Controlled (`value`) and uncontrolled (`defaultValue`) usage
 *     mirror the native textarea contract.
 *   - State layer fades on hover (0.08) and focus (0.10) over the
 *     tray. Disabled blocks pointer events and dims to 0.38.
 *   - Outlined / standard borders morph to primary on focus and to
 *     error on error.
 */
export const TextareaAutosize = forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>(function TextareaAutosize(
  {
    variant = "standard",
    size = "md",
    shape = "xs",
    minRows = 1,
    maxRows,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    disabled = false,
    error = false,
    selected = false,
    label,
    helperText,
    leadingIcon,
    trailingIcon,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    id,
    className,
    placeholder,
    readOnly,
    required,
    name,
    autoFocus,
    style,
    ...rest
  },
  ref,
) {
  const colors = colorMatrix[variant];
  const sizes = sizeClasses[size];
  const reactId = useId();
  const fieldId = id ?? `textarea-autosize-${reactId.replace(/[:]/g, "")}`;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const labelId = label ? `${fieldId}-label` : undefined;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? "",
  );
  const currentValue = isControlled ? (value ?? "") : internalValue;

  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement, []);

  const [focused, setFocused] = useState(false);

  const resize = useCallback(() => {
    const node = innerRef.current;
    if (!node) return;
    // Reset height so the next scrollHeight read reflects content
    // shrinkage (otherwise the textarea would only grow).
    node.style.height = "auto";
    const lineHeight = measureLineHeight(node);
    const cs = window.getComputedStyle(node);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBottom = parseFloat(cs.paddingBottom) || 0;
    const borderTop = parseFloat(cs.borderTopWidth) || 0;
    const borderBottom = parseFloat(cs.borderBottomWidth) || 0;
    const verticalChrome = padTop + padBottom + borderTop + borderBottom;
    const minHeight = lineHeight * minRows + verticalChrome;
    const maxHeight =
      maxRows !== undefined ? lineHeight * maxRows + verticalChrome : Infinity;
    const intrinsic = node.scrollHeight + borderTop + borderBottom;
    const clamped = Math.min(Math.max(intrinsic, minHeight), maxHeight);
    node.style.height = `${clamped}px`;
    node.style.overflowY =
      maxRows !== undefined && intrinsic > maxHeight ? "auto" : "hidden";
  }, [minRows, maxRows]);

  useIsoLayoutEffect(() => {
    resize();
  }, [resize, currentValue, size, variant]);

  // Re-measure on resize so wrapping changes drive growth.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => resize();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [resize]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const handleFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  const fillBg = error
    ? colors.errorBg
    : selected
      ? colors.selected
      : colors.bg;

  const fillFg = error
    ? colors.errorFg
    : selected
      ? colors.selectedFg
      : colors.fg;

  const focusBorder =
    !disabled && focused && !error
      ? "!border-primary [box-shadow:inset_0_0_0_1px_var(--md-sys-color-primary)]"
      : "";

  const errorBorder = error
    ? "!border-error [box-shadow:inset_0_0_0_1px_var(--md-sys-color-error)]"
    : "";

  const describedBy =
    ariaDescribedBy ?? helperId ?? undefined;
  const labelledBy = ariaLabelledBy ?? labelId;

  const restingOpacity = disabled ? 0.38 : 1;

  return (
    <div
      data-component="textarea-autosize"
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-selected={selected || undefined}
      data-focused={focused || undefined}
      className={cn(anatomy.root, sizes.rowGap, className)}
      style={{ opacity: restingOpacity }}
    >
      {label !== undefined && label !== null ? (
        <label
          id={labelId}
          htmlFor={fieldId}
          data-slot="label"
          className={anatomy.label}
        >
          {label}
        </label>
      ) : null}
      <div
        data-slot="tray"
        className={cn(
          anatomy.tray,
          sizes.pad,
          sizes.minH,
          shapeClasses[shape],
          fillBg,
          fillFg,
          colors.border,
          colors.elevation,
          focusBorder,
          errorBorder,
          disabled && anatomy.disabled,
        )}
      >
        <span
          data-slot="state-layer"
          aria-hidden="true"
          className={anatomy.stateLayer}
        />
        {leadingIcon !== undefined && leadingIcon !== null ? (
          <span
            data-slot="icon-leading"
            aria-hidden="true"
            className={cn(anatomy.leadingIcon, colors.iconColor)}
          >
            {leadingIcon}
          </span>
        ) : null}
        <textarea
          {...rest}
          ref={innerRef}
          id={fieldId}
          name={name}
          data-slot="textarea"
          className={cn(anatomy.textarea, sizes.typography)}
          value={isControlled ? currentValue : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-multiline="true"
          aria-disabled={disabled || undefined}
          aria-invalid={error || undefined}
          aria-selected={selected || undefined}
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          rows={minRows}
          style={style}
        />
        {trailingIcon !== undefined && trailingIcon !== null ? (
          <span
            data-slot="icon-trailing"
            aria-hidden="true"
            className={cn(anatomy.trailingIcon, colors.iconColor)}
          >
            {trailingIcon}
          </span>
        ) : null}
      </div>
      {helperText !== undefined && helperText !== null ? (
        <span
          id={helperId}
          data-slot="helper"
          className={cn(
            anatomy.helperText,
            error && "text-error",
          )}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
});
