import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/cn";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  errorText,
  selectedBg,
  selectedText,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type { ListItemProps, ListProps, ListSize, ListVariant } from "./types";

export type {
  ListItemProps,
  ListProps,
  ListSize,
  ListVariant,
} from "./types";

interface ListContextValue {
  variant: ListVariant;
  size: ListSize;
}

const ListContext = createContext<ListContextValue>({
  variant: "standard",
  size: "md",
});

/**
 * M3 List container. Renders a `<ul>` (or `<ol>` when `ordered`) with
 * three M3 variants (standard / filled / outlined) and three line
 * densities (sm = 1-line, md = 2-line, lg = 3-line). The variant +
 * size are propagated to children via context so a `<ListItem>` can
 * be authored without repeating the props on every row.
 */
export const List = forwardRef<HTMLUListElement, ListProps>(function List(
  {
    variant = "standard",
    size = "md",
    ordered = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const ctx: ListContextValue = { variant, size };
  const variantClass = variantClasses[variant].container;
  const sharedProps = {
    role: "list" as const,
    "data-component": "list",
    "data-variant": variant,
    "data-size": size,
    className: cn(anatomy.root, variantClass, className),
    ...rest,
  };

  return (
    <ListContext.Provider value={ctx}>
      {ordered ? (
        <ol
          ref={ref as unknown as React.Ref<HTMLOListElement>}
          {...sharedProps}
        >
          {children}
        </ol>
      ) : (
        <ul ref={ref} {...sharedProps}>
          {children}
        </ul>
      )}
    </ListContext.Provider>
  );
});

/**
 * `<ListItem>` — a single row with leading / headline / supporting /
 * trailing slots. Promotes to a `<button>`-rendered row whenever
 * `onClick` (or `interactive`) is present. The state layer is a
 * positioned overlay whose opacity is driven from React state (so we
 * can verify hover 0.08 / focus 0.10 / pressed 0.10 in tests instead
 * of relying on Tailwind's slash-opacity utility, which silently
 * no-ops with var()-based tokens).
 */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(
    {
      variant: variantProp,
      size: sizeProp,
      leading,
      trailing,
      overline,
      headline,
      supportingText,
      selected = false,
      disabled = false,
      error = false,
      interactive: interactiveProp,
      onClick,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onPointerUp,
      onFocus,
      onBlur,
      onKeyDown,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const ctx = useContext(ListContext);
    const variant = variantProp ?? ctx.variant;
    const size = sizeProp ?? ctx.size;

    const interactive = interactiveProp ?? Boolean(onClick);
    const sizes = sizeClasses[size];
    const hasLeading = leading != null;

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [pressed, setPressed] = useState(false);

    const stateLayer = !interactive || disabled
      ? 0
      : pressed
        ? stateLayerOpacity.pressed
        : focused
          ? stateLayerOpacity.focus
          : hovered
            ? stateLayerOpacity.hover
            : 0;

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        onClick?.(event);
      },
      [disabled, onClick],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (!interactive) return;
        if (event.defaultPrevented) return;
        if (event.key === " ") setPressed(true);
      },
      [interactive, onKeyDown],
    );

    const stateLayerColor = error
      ? anatomy.stateLayerError
      : selected
        ? anatomy.stateLayerSelected
        : "";

    // Apply exactly one bg + one text utility so design-parity tests
    // can read a stable computed style (Tailwind utility ordering in
    // the generated stylesheet is not late-wins-stable for utilities
    // backed by var() color tokens).
    const rowBg = selected ? selectedBg : variantClasses[variant].itemRest;
    const rowText = error
      ? errorText
      : selected
        ? selectedText
        : anatomy.itemDefaultText;

    const rowClass = cn(
      anatomy.item,
      hasLeading ? sizes.minHeightWithLeading : sizes.minHeight,
      hasLeading ? sizes.paddingWithLeading : sizes.padding,
      rowBg,
      rowText,
      interactive && anatomy.itemInteractive,
      disabled && anatomy.itemDisabled,
      // The filled list paints surface-container behind the *list*; an
      // item only needs the rounded shape on the first/last child to
      // match the container outline. This is left to the consumer.
      "rounded-shape-xs",
      className,
    );

    const stateLayerEl = interactive ? (
      <span
        aria-hidden
        data-state-layer
        className={cn(anatomy.stateLayer, stateLayerColor, "rounded-[inherit]")}
        style={{ opacity: stateLayer }}
      />
    ) : null;

    const showSupporting = sizes.showSupporting && supportingText != null;

    const inner = (
      <>
        {stateLayerEl}
        {hasLeading ? (
          <span data-slot="leading" className={anatomy.leading}>
            {leading}
          </span>
        ) : null}
        <span data-slot="text" className={anatomy.textColumn}>
          {overline ? (
            <span data-slot="overline" className={anatomy.overline}>
              {overline}
            </span>
          ) : null}
          <span data-slot="headline" className={anatomy.headline}>
            {headline}
          </span>
          {showSupporting ? (
            <span
              data-slot="supporting"
              className={cn(anatomy.supporting, sizes.supportingClamp)}
            >
              {supportingText}
            </span>
          ) : null}
        </span>
        {trailing != null ? (
          <span data-slot="trailing" className={anatomy.trailing}>
            {trailing}
          </span>
        ) : null}
        {children}
      </>
    );

    if (interactive) {
      return (
        <li
          ref={ref}
          role="listitem"
          data-component="list-item"
          data-variant={variant}
          data-size={size}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          data-error={error || undefined}
          className="contents"
        >
          <button
            type="button"
            aria-pressed={selected || undefined}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            data-interactive=""
            onClick={handleClick}
            onPointerEnter={(e) => {
              setHovered(true);
              onPointerEnter?.(e);
            }}
            onPointerLeave={(e) => {
              setHovered(false);
              setPressed(false);
              onPointerLeave?.(e);
            }}
            onPointerDown={(e) => {
              setPressed(true);
              onPointerDown?.(e);
            }}
            onPointerUp={(e) => {
              setPressed(false);
              onPointerUp?.(e);
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              setPressed(false);
              onBlur?.(e);
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={() => setPressed(false)}
            className={rowClass}
            {...(rest as Record<string, unknown>)}
          >
            {inner}
          </button>
        </li>
      );
    }

    // Non-interactive row — render directly on the <li> and drop the
    // button-only handlers / aria.
    const liRest = rest as React.LiHTMLAttributes<HTMLLIElement>;
    return (
      <li
        ref={ref}
        role="listitem"
        data-component="list-item"
        data-variant={variant}
        data-size={size}
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
        data-error={error || undefined}
        aria-disabled={disabled || undefined}
        className={rowClass}
        {...liRest}
      >
        {inner}
      </li>
    );
  },
);
