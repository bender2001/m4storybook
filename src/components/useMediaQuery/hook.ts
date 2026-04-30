import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { UseMediaQueryOptions } from "./types";

const noop = () => () => {};

/**
 * `useMediaQuery(query, options?)`
 *
 * Drop-in M3-tokenized counterpart of MUI's `useMediaQuery`
 * (https://mui.com/material-ui/react-use-media-query/). Subscribes to
 * the supplied media query through `window.matchMedia` and returns the
 * current match boolean. Uses `useSyncExternalStore` so the subscription
 * stays SSR-safe and concurrent-mode tearing-free.
 *
 *   - `defaultMatches` seeds the value used during SSR / before first paint.
 *   - `noSsr` skips the two-pass render — read matchMedia synchronously.
 *   - `matchMedia` injects a custom matchMedia (tests / SSR shim).
 *   - `onChange` fires whenever the match state flips.
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {},
): boolean {
  const {
    defaultMatches = false,
    noSsr = false,
    matchMedia: matchMediaOption,
    onChange,
  } = options;

  const browserMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia.bind(window)
      : undefined;
  const matchMedia = matchMediaOption ?? browserMatchMedia;

  // Memoize the MediaQueryList per (matchMedia, query) so subscribe /
  // getSnapshot are stable across renders unless the query actually
  // changes — required by useSyncExternalStore's contract.
  const mql = useMemo<MediaQueryList | null>(
    () => (matchMedia ? matchMedia(query) : null),
    [matchMedia, query],
  );

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!mql) return noop();
      // Modern browsers expose `addEventListener("change", …)`; older
      // Safari needs `addListener` for parity with MUI's hook.
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", callback);
        return () => mql.removeEventListener("change", callback);
      }
      mql.addListener(callback);
      return () => mql.removeListener(callback);
    },
    [mql],
  );

  const getSnapshot = useCallback(
    () => mql?.matches ?? defaultMatches,
    [mql, defaultMatches],
  );

  const getServerSnapshot = useCallback(
    () => defaultMatches,
    [defaultMatches],
  );

  const matches = useSyncExternalStore(
    subscribe,
    getSnapshot,
    noSsr ? getSnapshot : getServerSnapshot,
  );

  // Hot path notification — only fires when the boolean actually flips.
  const previousRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (previousRef.current === matches) return;
    previousRef.current = matches;
    onChange?.(matches);
  }, [matches, onChange]);

  return matches;
}
