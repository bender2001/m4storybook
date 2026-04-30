import { forwardRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { staggerVariants } from "@/motion/presets";
import { Snackbar } from "./Snackbar";
import type { SnackbarProps } from "./types";

export interface SnackbarStackItem
  extends Omit<SnackbarProps, "open" | "origin" | "ref"> {
  /** Stable identity for AnimatePresence reordering. */
  id: string;
  /**
   * Optional override for the inner Snackbar — when supplied, the
   * stack will render the node verbatim and skip the default
   * `<Snackbar message=… />` shell. Useful when the consumer needs
   * complex children that the props API does not surface.
   */
  render?: ReactNode;
}

export interface SnackbarStackProps {
  /** Queued items, oldest first. The newest snackbar joins the bottom. */
  items: SnackbarStackItem[];
  /** Anchor side controls the slide-in axis. Defaults to `bottom-center`. */
  origin?: SnackbarProps["origin"];
  /** Per-item dismiss callback — fires when any queued snackbar closes. */
  onClose?: (id: string, reason: Parameters<NonNullable<SnackbarProps["onClose"]>>[0]) => void;
  /** Optional class on the host UL. */
  className?: string;
  /** Accessible label on the host (defaults to "Notifications"). */
  ariaLabel?: string;
}

/**
 * M3 Expressive snackbar queue.
 *
 * Multiple snackbars stack along the chosen origin and enter with the
 * shared M3 Expressive stagger schedule (30ms between siblings,
 * `emphasized-decelerate` easing). Reduced-motion collapses the
 * cascade to instant. The wrapper is a motion-managed `<ul>`; each
 * queued snackbar is a `<li>` that hosts the existing single-snackbar
 * surface, so per-item motion (slide-in / autoHide / close click) is
 * unchanged.
 */
export const SnackbarStack = forwardRef<HTMLUListElement, SnackbarStackProps>(
  function SnackbarStack(
    { items, origin = "bottom-center", onClose, className, ariaLabel },
    ref,
  ) {
    const reduced = useReducedMotion();
    const { parent, child } = staggerVariants(reduced);
    const reverse = origin.startsWith("bottom");

    return (
      <motion.ul
        ref={ref}
        role="region"
        aria-label={ariaLabel ?? "Notifications"}
        data-component="snackbar-stack"
        data-origin={origin}
        variants={parent}
        initial="closed"
        animate="open"
        exit="closed"
        className={cn(
          "relative flex w-full list-none flex-col gap-2 p-0",
          reverse ? "justify-end" : "justify-start",
          className,
        )}
      >
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const { id, render, onClose: itemOnClose, ...rest } = item;
            return (
              <motion.li
                key={id}
                data-slot="queued-snackbar"
                data-id={id}
                variants={child}
                initial="closed"
                animate="open"
                exit="closed"
                className="relative list-none"
              >
                {render ?? (
                  <Snackbar
                    {...rest}
                    origin={origin}
                    onClose={(reason) => {
                      itemOnClose?.(reason);
                      onClose?.(id, reason);
                    }}
                  />
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    );
  },
);
