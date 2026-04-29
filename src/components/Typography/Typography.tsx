import { createElement, forwardRef, type ElementType } from "react";
import { cn } from "@/lib/cn";
import {
  alignClass,
  anatomy,
  defaultTagForVariant,
  emphasisColor,
  typeRoleClass,
  variantSizeToRole,
} from "./anatomy";
import type { TypographyProps } from "./types";

export type {
  TypographyEmphasis,
  TypographyProps,
  TypographySize,
  TypographyVariant,
} from "./types";

/**
 * M3 Expressive Typography. Renders one of the 15 M3 type roles
 * (5 categories × 3 sizes). Color is driven by the emphasis prop
 * which maps to on-surface / on-surface-variant / primary / error /
 * inverse-on-surface tokens. Inline icon slots, truncation, and
 * text alignment are first-class. The variant determines the default
 * semantic element (h1..h3, p, span) — override via `as`.
 *
 * Reference: https://m3.material.io/styles/typography/type-scale-tokens
 */
export const Typography = forwardRef<HTMLElement, TypographyProps>(
  function Typography(
    {
      variant = "body",
      size = "md",
      emphasis = "default",
      as,
      leadingIcon,
      trailingIcon,
      truncate,
      selected,
      disabled,
      align,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const Component = (as ?? defaultTagForVariant[variant]) as ElementType;
    const role = variantSizeToRole[variant][size];
    // Selected forces primary color; disabled dims to 38% opacity per M3.
    const resolvedEmphasis: typeof emphasis = selected ? "primary" : emphasis;
    const hasIcons = Boolean(leadingIcon ?? trailingIcon);
    const rootClass = cn(
      // Inline-flex is needed when icons render alongside; otherwise
      // a normal block element preserves the writer's flow (paragraphs,
      // headings stack naturally).
      hasIcons ? anatomy.root : anatomy.rootBlock,
      typeRoleClass(variant, size),
      emphasisColor[resolvedEmphasis],
      align ? alignClass[align] : undefined,
      truncate ? anatomy.truncate : undefined,
      disabled ? "opacity-[0.38]" : undefined,
      className,
    );

    const props: Record<string, unknown> = {
      ref,
      "data-variant": variant,
      "data-size": size,
      "data-emphasis": resolvedEmphasis,
      "data-role": role,
      "data-disabled": disabled ? "" : undefined,
      "data-selected": selected ? "" : undefined,
      "aria-disabled": disabled || undefined,
      className: rootClass,
      ...rest,
    };

    return createElement(
      Component,
      props,
      leadingIcon ? (
        <span aria-hidden data-slot="leading-icon" className={anatomy.icon}>
          {leadingIcon}
        </span>
      ) : null,
      truncate && hasIcons ? (
        <span data-slot="text" className="min-w-0 flex-1 truncate">
          {children}
        </span>
      ) : (
        children
      ),
      trailingIcon ? (
        <span aria-hidden data-slot="trailing-icon" className={anatomy.icon}>
          {trailingIcon}
        </span>
      ) : null,
    );
  },
);
