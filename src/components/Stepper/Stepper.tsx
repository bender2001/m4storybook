import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs, tweens } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  errorClasses,
  orientationClasses,
  shapeClasses,
  sizeClasses,
  stepDisabledClasses,
  variantClasses,
} from "./anatomy";
import type {
  StepperProps,
  StepperShape,
  StepperStep,
  StepperStepState,
  StepperVariant,
} from "./types";

export type {
  StepperOrientation,
  StepperProps,
  StepperShape,
  StepperSize,
  StepperStep,
  StepperStepState,
  StepperVariant,
} from "./types";

/** Default completed-step glyph. */
const CheckIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="62%"
    height="62%"
    fill="currentColor"
  >
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z" />
  </svg>
);

/** Default error-step glyph. */
const ErrorIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="62%"
    height="62%"
    fill="currentColor"
  >
    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
  </svg>
);

/**
 * M3-tokenized Stepper.
 *
 * Re-skins MUI's `<Stepper />` (https://mui.com/material-ui/react-stepper/)
 * onto M3 navigation tokens. The active-step container morphs from
 * `shape-full` (circle) to the selected `shape` token via a springy
 * motion/react transition — the same M3 Expressive selection pattern
 * used by Pagination + Navigation Rail. Connector segments fill from
 * `outline-variant` to `primary` via a width/height transition.
 *
 *   - 5 variants     : filled / tonal / outlined / text / elevated
 *   - 3 sizes        : 24 / 28 / 36 dp icon containers
 *   - 2 orientations : horizontal / vertical
 *   - 7 shapes       : full M3 corner scale on the active morph
 *   - WAI-ARIA       : `<ol>` host with role="list" semantics; each
 *                      step has `aria-current="step"` when active +
 *                      `aria-disabled` for unreachable steps; non-linear
 *                      mode wires roving-tabindex over Arrow keys
 *   - Motion         : springy shape morph on active step; emphasized
 *                      connector fill; emphasized vertical content
 *                      collapse; collapses under reduced motion
 *   - Keyboard       : ArrowLeft/Right/Up/Down step focus along the
 *                      step list; Home/End jumps; Enter/Space activates
 */
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  function Stepper(
    {
      steps,
      activeStep,
      defaultActiveStep = 0,
      onStepChange,
      variant = "filled",
      size = "md",
      orientation = "horizontal",
      shape = "md",
      linear = true,
      alternativeLabel = false,
      disabled = false,
      ariaLabel,
      renderStepIcon,
      className,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();

    const isControlled = activeStep !== undefined;
    const [uncontrolledActive, setUncontrolledActive] =
      useState<number>(defaultActiveStep);
    const active = isControlled ? Number(activeStep) : uncontrolledActive;

    const setActive = useCallback(
      (next: number) => {
        if (next < 0 || next >= steps.length) return;
        if (steps[next]?.disabled) return;
        if (!isControlled) setUncontrolledActive(next);
        onStepChange?.(next, steps[next].key);
      },
      [isControlled, onStepChange, steps],
    );

    const variantStyles = variantClasses[variant];
    const orient = orientationClasses[orientation];
    const useAlt = alternativeLabel && orientation === "horizontal";

    const stepRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const setStepRef = useCallback(
      (key: string, node: HTMLButtonElement | null) => {
        stepRefs.current[key] = node;
      },
      [],
    );

    const reachableKeys = useMemo(
      () =>
        steps
          .map((s, i) => ({ key: s.key, i, disabled: s.disabled }))
          .filter(({ i, disabled: stepDisabled }) => {
            if (stepDisabled) return false;
            if (linear) return i <= active;
            return true;
          })
          .map(({ key }) => key),
      [steps, active, linear],
    );

    const [focusedKey, setFocusedKey] = useState<string | null>(null);

    useEffect(() => {
      if (focusedKey == null && reachableKeys.length > 0) {
        const activeKey = steps[active]?.key;
        setFocusedKey(
          activeKey && reachableKeys.includes(activeKey)
            ? activeKey
            : reachableKeys[0],
        );
      } else if (
        focusedKey != null &&
        !reachableKeys.includes(focusedKey)
      ) {
        setFocusedKey(reachableKeys[0] ?? null);
      }
    }, [active, focusedKey, reachableKeys, steps]);

    const moveFocus = useCallback(
      (delta: 1 | -1) => {
        if (reachableKeys.length === 0) return;
        const current = focusedKey ?? reachableKeys[0];
        const idx = reachableKeys.indexOf(current);
        const nextIdx =
          (idx + delta + reachableKeys.length) % reachableKeys.length;
        const nextKey = reachableKeys[nextIdx];
        setFocusedKey(nextKey);
        stepRefs.current[nextKey]?.focus({ preventScroll: true });
      },
      [focusedKey, reachableKeys],
    );

    const handleStepKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>, step: StepperStep) => {
        if (disabled) return;
        const fwdKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
        const backKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
        if (event.key === fwdKey) {
          event.preventDefault();
          moveFocus(1);
          return;
        }
        if (event.key === backKey) {
          event.preventDefault();
          moveFocus(-1);
          return;
        }
        if (event.key === "Home") {
          event.preventDefault();
          if (reachableKeys[0]) {
            setFocusedKey(reachableKeys[0]);
            stepRefs.current[reachableKeys[0]]?.focus({ preventScroll: true });
          }
          return;
        }
        if (event.key === "End") {
          event.preventDefault();
          if (reachableKeys.length > 0) {
            const lastKey = reachableKeys[reachableKeys.length - 1];
            setFocusedKey(lastKey);
            stepRefs.current[lastKey]?.focus({ preventScroll: true });
          }
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const idx = steps.findIndex((s) => s.key === step.key);
          if (idx >= 0) setActive(idx);
        }
      },
      [
        disabled,
        moveFocus,
        orientation,
        reachableKeys,
        setActive,
        steps,
      ],
    );

    return (
      <motion.ol
        ref={ref}
        role="list"
        data-component="stepper"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        data-shape={shape}
        data-linear={linear || undefined}
        data-alternative-label={useAlt || undefined}
        data-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        className={cn(
          anatomy.root,
          orient.flow,
          orientation === "horizontal" && (useAlt ? "items-start" : "items-center"),
          variantStyles.host,
          disabled && anatomy.disabled,
          className,
        )}
        {...rest}
      >
        {steps.map((step, index) => {
          const state = resolveState(step, index, active);
          const isLast = index === steps.length - 1;
          const isFocused = focusedKey === step.key;
          const reachable = reachableKeys.includes(step.key);
          const isDisabledStep =
            step.disabled || (linear && index > active);

          return (
            <li
              key={step.key}
              role="listitem"
              data-component="stepper-step"
              data-key={step.key}
              data-index={index}
              data-state={state}
              data-active={state === "active" || undefined}
              data-completed={state === "completed" || undefined}
              data-error={state === "error" || undefined}
              data-disabled={isDisabledStep || undefined}
              aria-current={state === "active" ? "step" : undefined}
              aria-disabled={isDisabledStep || undefined}
              className={cn(
                anatomy.step,
                orient.stepFlow,
                orientation === "horizontal" && !useAlt && "items-center",
                orientation === "horizontal" && !isLast && "flex-1",
                orientation === "vertical" && "flex-col w-full",
              )}
            >
              <StepRow
                step={step}
                index={index}
                state={state}
                variant={variant}
                shape={shape}
                size={size}
                orientation={orientation}
                useAlt={useAlt}
                isFocused={isFocused}
                isReachable={reachable}
                isLast={isLast}
                reduced={Boolean(reduced)}
                renderStepIcon={renderStepIcon}
                onActivate={() => setActive(index)}
                onKeyDown={handleStepKeyDown}
                onFocus={() => {
                  if (reachable) setFocusedKey(step.key);
                }}
                registerRef={setStepRef}
              />

              {orientation === "vertical" ? (
                <AnimatePresence initial={false}>
                  {state === "active" && step.content ? (
                    <motion.div
                      key="content"
                      data-slot="stepper-content"
                      role="region"
                      className={anatomy.content}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduced ? { duration: 0 } : tweens.standard}
                    >
                      <div className="py-3 pr-4">{step.content}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              ) : null}

              {!isLast ? (
                <Connector
                  state={state}
                  orientation={orientation}
                  size={size}
                  reduced={Boolean(reduced)}
                />
              ) : null}
            </li>
          );
        })}
      </motion.ol>
    );
  },
);

interface StepRowProps {
  step: StepperStep;
  index: number;
  state: StepperStepState;
  variant: StepperVariant;
  shape: StepperShape;
  size: keyof typeof sizeClasses;
  orientation: "horizontal" | "vertical";
  useAlt: boolean;
  isFocused: boolean;
  isReachable: boolean;
  isLast: boolean;
  reduced: boolean;
  renderStepIcon?: (
    step: StepperStep,
    state: StepperStepState,
    index: number,
  ) => ReactNode;
  onActivate: () => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    step: StepperStep,
  ) => void;
  onFocus: () => void;
  registerRef: (key: string, node: HTMLButtonElement | null) => void;
}

function StepRow({
  step,
  index,
  state,
  variant,
  shape,
  size,
  orientation,
  useAlt,
  isFocused,
  isReachable,
  isLast,
  reduced,
  renderStepIcon,
  onActivate,
  onKeyDown,
  onFocus,
  registerRef,
}: StepRowProps) {
  const variantStyles = variantClasses[variant];
  const sizes = sizeClasses[size];
  const isError = state === "error";
  const isActive = state === "active";
  const isCompleted = state === "completed";

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  const stateLayer =
    !isReachable || state === "disabled"
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

  const iconBg = isError
    ? variant === "outlined"
      ? errorClasses.iconOutlined
      : errorClasses.icon
    : isActive || isCompleted
      ? variantStyles.activeIcon
      : variantStyles.upcomingIcon;

  const iconStateLayerColor = isError
    ? errorClasses.iconStateLayer
    : isActive || isCompleted
      ? variantStyles.activeStateLayer
      : variantStyles.upcomingStateLayer;

  const iconOutline =
    variant === "outlined"
      ? isActive || isCompleted
        ? variantStyles.outlinedActive
        : variantStyles.outlinedUpcoming
      : "";

  const iconShape = isActive ? shapeClasses[shape] : "rounded-shape-full";

  const labelColor = isError
    ? errorClasses.label
    : isActive
      ? variantStyles.activeLabel
      : isCompleted
        ? variantStyles.activeLabel
        : variantStyles.upcomingLabel;

  const isDisabledStep = state === "disabled";
  const interactive = isReachable && !isDisabledStep;

  const renderedIcon = (() => {
    if (renderStepIcon) return renderStepIcon(step, state, index);
    if (step.icon) return step.icon;
    if (state === "completed") return <CheckIcon />;
    if (state === "error") return <ErrorIcon />;
    return <span>{index + 1}</span>;
  })();

  const iconNode = (
    <motion.span
      data-slot="step-icon"
      data-state={state}
      className={cn(
        anatomy.icon,
        sizes.iconBox,
        iconBg,
        iconOutline,
        iconShape,
      )}
      animate={{
        scale: isActive ? 1.04 : 1,
      }}
      transition={reduced ? { duration: 0 } : springs.springy}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(anatomy.iconStateLayer, iconStateLayerColor)}
        style={{ opacity: stateLayer }}
      />
      <span aria-hidden className={cn(anatomy.iconGlyph, sizes.glyph)}>
        {renderedIcon}
      </span>
    </motion.span>
  );

  const labelNode = (
    <span
      data-slot="step-label-stack"
      className={cn(
        anatomy.labelStack,
        useAlt && "items-center text-center mt-2",
      )}
    >
      <span
        data-slot="step-label"
        className={cn(anatomy.label, sizes.label, labelColor)}
      >
        {step.label}
      </span>
      {step.optional ? (
        <span data-slot="step-optional" className={anatomy.description}>
          {step.optional}
        </span>
      ) : null}
      {step.description ? (
        <span data-slot="step-description" className={anatomy.description}>
          {step.description}
        </span>
      ) : null}
    </span>
  );

  const innerContent = useAlt ? (
    <span className="flex flex-col items-center">
      {iconNode}
      {labelNode}
    </span>
  ) : (
    <span className={cn("inline-flex items-center", sizes.iconLabelGap)}>
      {iconNode}
      {labelNode}
    </span>
  );

  const buttonClasses = cn(
    anatomy.button,
    isDisabledStep && stepDisabledClasses,
    !interactive && "cursor-default",
    orientation === "vertical" && "w-full justify-start",
    orientation === "horizontal" && !isLast && "pr-1",
  );

  if (interactive) {
    return (
      <button
        ref={(node) => registerRef(step.key, node)}
        type="button"
        data-slot="step-button"
        data-state={state}
        data-focused={isFocused || undefined}
        aria-disabled={isDisabledStep || undefined}
        tabIndex={isDisabledStep ? -1 : isFocused ? 0 : -1}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onFocus={() => {
          setFocused(true);
          onFocus();
        }}
        onBlur={() => {
          setFocused(false);
          setPressed(false);
        }}
        onClick={onActivate}
        onKeyDown={(event) => onKeyDown(event, step)}
        className={buttonClasses}
      >
        {innerContent}
      </button>
    );
  }
  return (
    <span
      data-slot="step-button"
      data-state={state}
      data-disabled={isDisabledStep || undefined}
      aria-disabled={isDisabledStep || undefined}
      className={buttonClasses}
    >
      {innerContent}
    </span>
  );
}

interface ConnectorProps {
  state: StepperStepState;
  orientation: "horizontal" | "vertical";
  size: keyof typeof sizeClasses;
  reduced: boolean;
}

function Connector({ state, orientation, size, reduced }: ConnectorProps) {
  const sizes = sizeClasses[size];
  const orient = orientationClasses[orientation];
  const filled = state === "completed";

  return (
    <span
      aria-hidden
      data-slot="step-connector"
      data-filled={filled || undefined}
      className={cn(
        anatomy.connector,
        orientation === "horizontal" && sizes.connectorThickness,
        orientation === "horizontal" && sizes.connectorMargin,
        orient.connectorAxis,
      )}
    >
      <motion.span
        data-slot="connector-progress"
        className={anatomy.connectorProgress}
        initial={false}
        animate={{
          scaleX: orientation === "horizontal" ? (filled ? 1 : 0) : 1,
          scaleY: orientation === "vertical" ? (filled ? 1 : 0) : 1,
        }}
        style={{
          transformOrigin:
            orientation === "horizontal" ? "left center" : "top center",
        }}
        transition={reduced ? { duration: 0 } : tweens.emphasized}
      />
    </span>
  );
}

function resolveState(
  step: StepperStep,
  index: number,
  active: number,
): StepperStepState {
  if (step.error) return "error";
  if (step.disabled) return "disabled";
  if (index < active) return "completed";
  if (index === active) return "active";
  return "upcoming";
}
