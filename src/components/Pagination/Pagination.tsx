import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { springs } from "@/motion/presets";
import { stateLayerOpacity } from "@/tokens/motion";
import {
  anatomy,
  shapeClasses,
  sizeClasses,
  variantClasses,
} from "./anatomy";
import type {
  PaginationItem,
  PaginationProps,
  PaginationSize,
} from "./types";

export type {
  PaginationItem,
  PaginationProps,
  PaginationShape,
  PaginationSize,
  PaginationVariant,
} from "./types";

/** Default chevron + double-chevron glyphs (24dp viewBox). */
const ChevronLeft = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

const ChevronRight = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
  </svg>
);

const FirstPage = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M18.41 16.59 13.83 12l4.58-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
  </svg>
);

const LastPage = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M5.59 7.41 10.17 12l-4.58 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
  </svg>
);

/** Build the visible page list with collapse ellipses (matches MUI). */
function buildItems(opts: {
  count: number;
  page: number;
  siblingCount: number;
  boundaryCount: number;
  showFirstButton: boolean;
  showLastButton: boolean;
  hidePrevButton: boolean;
  hideNextButton: boolean;
  disabled: boolean;
}): PaginationItem[] {
  const {
    count,
    page,
    siblingCount,
    boundaryCount,
    showFirstButton,
    showLastButton,
    hidePrevButton,
    hideNextButton,
    disabled,
  } = opts;

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  if (count <= 0) return [];

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(
    Math.max(count - boundaryCount + 1, boundaryCount + 1),
    count,
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  const items: PaginationItem[] = [];
  const push = (item: PaginationItem) => items.push(item);

  if (showFirstButton) {
    push({
      kind: "first",
      page: 1,
      selected: false,
      disabled: disabled || page <= 1,
      key: "first",
    });
  }
  if (!hidePrevButton) {
    push({
      kind: "previous",
      page: page - 1,
      selected: false,
      disabled: disabled || page <= 1,
      key: "previous",
    });
  }

  for (const n of startPages) {
    push({
      kind: "page",
      page: n,
      selected: n === page,
      disabled,
      key: `page-${n}`,
    });
  }

  if (siblingsStart > boundaryCount + 2) {
    push({
      kind: "start-ellipsis",
      page: null,
      selected: false,
      disabled: false,
      key: "start-ellipsis",
    });
  } else if (boundaryCount + 1 < count - boundaryCount) {
    push({
      kind: "page",
      page: boundaryCount + 1,
      selected: page === boundaryCount + 1,
      disabled,
      key: `page-${boundaryCount + 1}`,
    });
  }

  for (const n of range(siblingsStart, siblingsEnd)) {
    push({
      kind: "page",
      page: n,
      selected: n === page,
      disabled,
      key: `page-${n}`,
    });
  }

  if (siblingsEnd < count - boundaryCount - 1) {
    push({
      kind: "end-ellipsis",
      page: null,
      selected: false,
      disabled: false,
      key: "end-ellipsis",
    });
  } else if (count - boundaryCount > boundaryCount) {
    push({
      kind: "page",
      page: count - boundaryCount,
      selected: page === count - boundaryCount,
      disabled,
      key: `page-${count - boundaryCount}`,
    });
  }

  for (const n of endPages) {
    push({
      kind: "page",
      page: n,
      selected: n === page,
      disabled,
      key: `page-${n}`,
    });
  }

  if (!hideNextButton) {
    push({
      kind: "next",
      page: page + 1,
      selected: false,
      disabled: disabled || page >= count,
      key: "next",
    });
  }
  if (showLastButton) {
    push({
      kind: "last",
      page: count,
      selected: false,
      disabled: disabled || page >= count,
      key: "last",
    });
  }

  return items;
}

const defaultAriaLabel = (item: PaginationItem) => {
  if (item.kind === "first") return "Go to first page";
  if (item.kind === "last") return "Go to last page";
  if (item.kind === "previous") return "Go to previous page";
  if (item.kind === "next") return "Go to next page";
  if (item.kind === "page") {
    return item.selected
      ? `page ${item.page}`
      : `Go to page ${item.page}`;
  }
  return "More pages";
};

/**
 * M3-tokenized Pagination.
 *
 * Re-skins MUI's `<Pagination />` (https://mui.com/material-ui/react-pagination/)
 * onto M3 navigation tokens. Page entries paint as M3 squircles
 * (shape-full rest -> shape-md selected) per the Expressive shape-morph
 * pattern shared with `<IconButton>`. Selected page rides
 * `secondary-container` / `on-secondary-container`. Hover / focus /
 * pressed paint the canonical 0.08 / 0.10 / 0.10 state-layer opacities.
 *
 *   - 5 host variants: text / filled / tonal / outlined / elevated
 *   - 3 sizes:         32dp / 40dp / 56dp items (match IconButton scale)
 *   - 7 shapes:        full M3 corner scale on the host pill
 *   - WAI-ARIA:        `<nav role=navigation aria-label>` + roving-tabindex
 *                      `aria-current=page` on the selected item
 *   - Motion:          springy press-scale on per-item; `medium2`
 *                      emphasized on host transitions; collapses under
 *                      reduced motion
 *   - Keyboard:        ArrowLeft / ArrowRight steps focus, Home / End
 *                      jumps to ends, Enter / Space activates
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      variant = "text",
      size = "md",
      shape = "full",
      count,
      page,
      defaultPage = 1,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstButton = false,
      showLastButton = false,
      hidePrevButton = false,
      hideNextButton = false,
      disabled = false,
      error = false,
      previousIcon,
      nextIcon,
      firstIcon,
      lastIcon,
      ellipsisIcon,
      renderItem,
      getItemAriaLabel = defaultAriaLabel,
      onChange,
      className,
      "aria-label": ariaLabel = "Pagination",
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();

    const [uncontrolled, setUncontrolled] = useState<number>(
      Math.min(Math.max(defaultPage, 1), Math.max(count, 1)),
    );
    const isControlled = page !== undefined;
    const currentPage = isControlled
      ? Math.min(Math.max(page!, 1), Math.max(count, 1))
      : uncontrolled;

    const colors = variantClasses[variant];
    const sizes = sizeClasses[size];
    const radius = shapeClasses[shape];

    const items = useMemo(
      () =>
        buildItems({
          count,
          page: currentPage,
          siblingCount,
          boundaryCount,
          showFirstButton,
          showLastButton,
          hidePrevButton,
          hideNextButton,
          disabled,
        }),
      [
        boundaryCount,
        count,
        currentPage,
        disabled,
        hideNextButton,
        hidePrevButton,
        showFirstButton,
        showLastButton,
        siblingCount,
      ],
    );

    const focusableKeys = items
      .filter((item) => item.kind !== "start-ellipsis" && item.kind !== "end-ellipsis" && !item.disabled)
      .map((item) => item.key);
    const initialFocusKey =
      focusableKeys.find((k) => {
        const item = items.find((i) => i.key === k);
        return item?.kind === "page" && item.selected;
      }) ?? focusableKeys[0] ?? null;

    const [focusedKey, setFocusedKey] = useState<string | null>(initialFocusKey);

    useEffect(() => {
      if (focusedKey == null) {
        setFocusedKey(initialFocusKey);
        return;
      }
      if (!focusableKeys.includes(focusedKey)) {
        setFocusedKey(initialFocusKey);
      }
    }, [focusableKeys, focusedKey, initialFocusKey]);

    const moveFocus = useCallback(
      (delta: 1 | -1) => {
        if (focusableKeys.length === 0) return;
        const current = focusedKey ?? focusableKeys[0];
        const idx = focusableKeys.indexOf(current);
        const nextIdx =
          (idx + delta + focusableKeys.length) % focusableKeys.length;
        setFocusedKey(focusableKeys[nextIdx]);
      },
      [focusableKeys, focusedKey],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLElement>) => {
        if (disabled) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          moveFocus(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveFocus(-1);
        } else if (event.key === "Home") {
          event.preventDefault();
          if (focusableKeys[0]) setFocusedKey(focusableKeys[0]);
        } else if (event.key === "End") {
          event.preventDefault();
          if (focusableKeys.length > 0)
            setFocusedKey(focusableKeys[focusableKeys.length - 1]);
        }
      },
      [disabled, focusableKeys, moveFocus],
    );

    const activate = useCallback(
      (
        item: PaginationItem,
        event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
      ) => {
        if (item.disabled) return;
        if (item.kind === "start-ellipsis" || item.kind === "end-ellipsis")
          return;
        const target = item.page;
        if (target == null) return;
        const clamped = Math.min(Math.max(target, 1), count);
        if (!isControlled) setUncontrolled(clamped);
        onChange?.(event, clamped);
      },
      [count, isControlled, onChange],
    );

    return (
      <motion.nav
        ref={ref}
        role="navigation"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-invalid={error || undefined}
        data-component="pagination"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        data-page={currentPage}
        data-count={count}
        onKeyDown={handleKeyDown}
        className={cn(
          anatomy.root,
          radius,
          sizes.hostPad,
          error ? colors.error : colors.rest,
          colors.border,
          colors.elevation,
          disabled && anatomy.disabled,
          className,
        )}
        initial={false}
        animate={{ opacity: disabled ? 0.38 : 1 }}
        transition={reduced ? { duration: 0 } : { duration: 0.3 }}
        {...rest}
      >
        <ul
          role="list"
          data-slot="list"
          className={cn(anatomy.list, sizes.gap)}
        >
          {items.map((item) => (
            <li
              key={item.key}
              data-slot="list-item"
              data-kind={item.kind}
              className={anatomy.listItem}
            >
              {renderItem ? (
                renderItem(item)
              ) : (
                <PaginationButton
                  item={item}
                  size={size}
                  iconColor={colors.iconColor}
                  error={error}
                  isFocused={focusedKey === item.key}
                  reduced={Boolean(reduced)}
                  ariaLabel={getItemAriaLabel(item)}
                  onActivate={activate}
                  onFocusItem={setFocusedKey}
                  previousIcon={previousIcon}
                  nextIcon={nextIcon}
                  firstIcon={firstIcon}
                  lastIcon={lastIcon}
                  ellipsisIcon={ellipsisIcon}
                />
              )}
            </li>
          ))}
        </ul>
      </motion.nav>
    );
  },
);

interface PaginationButtonProps {
  item: PaginationItem;
  size: PaginationSize;
  iconColor: string;
  error: boolean;
  isFocused: boolean;
  reduced: boolean;
  ariaLabel: string;
  onActivate: (
    item: PaginationItem,
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ) => void;
  onFocusItem: (key: string) => void;
  previousIcon?: ReactNode;
  nextIcon?: ReactNode;
  firstIcon?: ReactNode;
  lastIcon?: ReactNode;
  ellipsisIcon?: ReactNode;
}

function PaginationButton({
  item,
  size,
  iconColor,
  error,
  isFocused,
  reduced,
  ariaLabel,
  onActivate,
  onFocusItem,
  previousIcon,
  nextIcon,
  firstIcon,
  lastIcon,
  ellipsisIcon,
}: PaginationButtonProps) {
  const sizes = sizeClasses[size];
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (
      isFocused &&
      buttonRef.current &&
      !item.disabled &&
      item.kind !== "start-ellipsis" &&
      item.kind !== "end-ellipsis"
    ) {
      if (document.activeElement !== buttonRef.current) {
        buttonRef.current.focus({ preventScroll: true });
      }
    }
  }, [isFocused, item.disabled, item.kind]);

  if (item.kind === "start-ellipsis" || item.kind === "end-ellipsis") {
    return (
      <span
        data-component="pagination-item"
        data-kind={item.kind}
        aria-hidden
        className={cn(
          anatomy.item,
          anatomy.ellipsis,
          sizes.itemSize,
          sizes.itemType,
        )}
      >
        {ellipsisIcon ?? <span aria-hidden>…</span>}
      </span>
    );
  }

  const isPage = item.kind === "page";
  const isSelected = isPage && item.selected;

  const stateLayer = item.disabled
    ? 0
    : pressed
      ? stateLayerOpacity.pressed
      : focused
        ? stateLayerOpacity.focus
        : hovered
          ? stateLayerOpacity.hover
          : 0;

  const stateLayerColor = error
    ? anatomy.stateLayerError
    : isSelected
      ? anatomy.stateLayerSelected
      : "";

  const buttonRadius = isSelected ? sizes.selectedRadius : "rounded-shape-full";
  const containerColor = isSelected
    ? cn(anatomy.itemSelectedBg, anatomy.itemSelectedText)
    : isPage
      ? "bg-transparent text-on-surface"
      : cn("bg-transparent", iconColor);

  const isArrowControl =
    item.kind === "previous" ||
    item.kind === "next" ||
    item.kind === "first" ||
    item.kind === "last";
  const arrowIcon =
    item.kind === "previous"
      ? (previousIcon ?? <ChevronLeft />)
      : item.kind === "next"
        ? (nextIcon ?? <ChevronRight />)
        : item.kind === "first"
          ? (firstIcon ?? <FirstPage />)
          : item.kind === "last"
            ? (lastIcon ?? <LastPage />)
            : null;

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      data-component="pagination-item"
      data-kind={item.kind}
      data-page={item.page ?? undefined}
      data-selected={isSelected || undefined}
      data-disabled={item.disabled || undefined}
      data-focused={isFocused || undefined}
      aria-label={ariaLabel}
      aria-current={isSelected ? "page" : undefined}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      tabIndex={item.disabled ? -1 : isFocused ? 0 : -1}
      whileHover={item.disabled || reduced ? undefined : { scale: 1.06 }}
      whileTap={item.disabled || reduced ? undefined : { scale: 0.92 }}
      transition={reduced ? { duration: 0 } : springs.springy}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onFocus={() => {
        setFocused(true);
        if (!item.disabled) onFocusItem(item.key);
      }}
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      onClick={(event) => onActivate(item, event)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setPressed(true);
          onActivate(item, event);
        }
      }}
      onKeyUp={() => setPressed(false)}
      className={cn(
        anatomy.item,
        anatomy.itemFocusRing,
        sizes.itemSize,
        sizes.itemType,
        buttonRadius,
        containerColor,
        item.disabled && anatomy.itemDisabled,
      )}
    >
      <span
        aria-hidden
        data-slot="state-layer"
        className={cn(
          anatomy.stateLayer,
          stateLayerColor,
          "rounded-[inherit]",
        )}
        style={{ opacity: stateLayer }}
      />
      {isPage ? (
        <span data-slot="label" className="relative z-[1]">
          {item.page}
        </span>
      ) : isArrowControl ? (
        <span
          aria-hidden
          data-slot="icon"
          className={cn("relative z-[1] inline-flex", sizes.iconSize)}
        >
          {arrowIcon}
        </span>
      ) : null}
    </motion.button>
  );
}
