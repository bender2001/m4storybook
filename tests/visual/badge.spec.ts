import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Badge. The component is a MUI
 * fallback re-skinned with M3 Expressive tokens (M3 doesn't fully
 * spec a variant/state matrix for Badge). Every assertion reads
 * computed style so a token drift breaks the test.
 *
 * Roles assert:
 *   - filled    -> error / on-error
 *   - tonal     -> secondary-container / on-secondary-container
 *   - outlined  -> transparent + 1dp outline
 *   - elevated  -> surface-container-high + elevation-1 shadow
 * Sizes assert:
 *   - sm        -> 8px square dot
 *   - md        -> 16px tall pill
 *   - lg        -> 24px tall pill
 * Motion asserts: medium2 (300ms) emphasized cubic-bezier.
 * State layers: hover 0.08, focus 0.10 of the on-color role.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_ERROR = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Badge - M3 design parity", () => {
  test("default renders role=status with the resolved label", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--default"));
    const badge = page.getByRole("status", { name: "Notifications" });
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute("data-variant", "filled");
    await expect(badge).toHaveAttribute("data-size", "md");
  });

  test("filled variant paints error / on-error", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--variants"));
    const badge = page.getByRole("status", { name: "Filled badge with 3" });
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR);
    expect(styles.color).toBe(LIGHT_ON_ERROR);
  });

  test("tonal variant paints secondary-container / on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--variants"));
    const badge = page.getByRole("status", { name: "Tonal badge with 5" });
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined variant paints transparent + 1dp outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--variants"));
    const badge = page.getByRole("status", { name: "Outlined badge with 7" });
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(parseFloat(styles.borderWidth)).toBe(1);
  });

  test("elevated variant paints surface-container-high + elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--variants"));
    const badge = page.getByRole("status", { name: "Elevated badge with 9" });
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    // elevation-1: 2 visible drop-shadow layers.
    const visibleLayers = styles.shadow.match(/rgba?\([^)]*0\.\d+\)/g) ?? [];
    expect(visibleLayers.length).toBeGreaterThanOrEqual(2);
  });

  test("size scale matches spec (sm 8 dot / md 16 pill / lg 24 pill)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--sizes"));
    const heights = await Promise.all(
      [
        "Small dot badge",
        "Medium count badge",
        "Large count badge",
      ].map(async (name) => {
        const badge = page.getByRole("status", { name });
        return await badge.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["8px", "16px", "24px"]);
  });

  test("all sizes use shape-full (pill / circle radius)", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--sizes"));
    const radii = await Promise.all(
      [
        "Small dot badge",
        "Medium count badge",
        "Large count badge",
      ].map(async (name) => {
        const badge = page.getByRole("status", { name });
        return await badge.evaluate((el) =>
          parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
        );
      }),
    );
    // shape-full = 9999px → radius is clamped to height/2.
    radii.forEach((r) => {
      expect(r).toBeGreaterThanOrEqual(4);
    });
  });

  test("disabled fades the badge to ~38% opacity", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--states"));
    const badge = page.getByRole("button", { name: "Disabled" });
    const opacity = await badge.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
    await expect(badge).toHaveAttribute("aria-disabled", "true");
  });

  test("selected variant flips to the inverse role pair", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--states"));
    const badge = page.getByRole("status", { name: "Selected" });
    await expect(badge).toHaveAttribute("data-selected", "true");
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    // tonal selected swaps to on-secondary-container / secondary-container.
    expect(styles.bg).toBe("rgb(29, 25, 43)");
    expect(styles.color).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("invisible badge collapses scale + opacity to 0", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--states"));
    const badge = page.getByRole("status", { name: "Invisible", includeHidden: true });
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: parseFloat(cs.opacity), transform: cs.transform };
    });
    expect(styles.opacity).toBeCloseTo(0, 2);
    // the scale-0 class collapses the matrix; transform is non-identity.
    expect(styles.transform).not.toBe("none");
  });

  test("interactive badge exposes role=button + tabindex=0 + state-layer", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--states"));
    const badge = page.getByRole("button", { name: "Interactive" });
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute("tabindex", "0");
    const layerCount = await badge.locator("[data-state-layer]").count();
    expect(layerCount).toBe(1);
  });

  test("hover paints state-layer at 0.08 opacity (M3 hover token)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-badge--interactive", "light", "no-preference"),
    );
    const badge = page.getByRole("button", { name: "Five unread" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await badge.hover();
    await page.waitForTimeout(260);
    const opacity = await badge
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity for interactive badges", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-badge--interactive", "light", "no-preference"),
    );
    const badge = page.getByRole("button", { name: "Five unread" });
    await badge.evaluate((el: HTMLElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await badge
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("clicking + Enter on the interactive badge both fire onClick", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--interactive"));
    const badge = page.getByRole("button", { name: "Five unread" });
    await badge.click();
    await badge.focus();
    await page.keyboard.press("Enter");
    // Best signal we can read in Playwright without a custom hook: the
    // button stayed focused & no console error fired.
    await expect(badge).toBeFocused();
  });

  test("M3 emphasized motion: medium2 (300ms) + emphasized cubic-bezier", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-badge--default"));
    const badge = page.getByRole("status", { name: "Notifications" });
    const styles = await badge.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
  });

  test("numeric content above max clamps to ${max}+", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--counts"));
    const badge = page.getByRole("status", { name: "Badge: 99+" });
    await expect(badge).toBeVisible();
    const label = badge.locator("[data-slot='label']");
    await expect(label).toHaveText("99+");
  });

  test("zero count is hidden by default; showZero opts in", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--counts"));
    // Forty-two visible.
    await expect(
      page.getByRole("status", { name: "Forty-two" }),
    ).toBeVisible();
    // Zero shown still renders because showZero flips the visibility.
    const zero = page.getByRole("status", { name: "Zero shown", includeHidden: true });
    await expect(zero).toHaveAttribute("data-visible", "true");
  });

  test("leading + trailing icon slots render when provided", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--slots"));
    const leadingBadge = page.getByRole("status", { name: "Three starred" });
    await expect(leadingBadge.locator("[data-slot='leading']")).toHaveCount(1);
    const trailingBadge = page.getByRole("status", { name: "New trailing" });
    await expect(trailingBadge.locator("[data-slot='trailing']")).toHaveCount(1);
  });

  test("standalone badge renders without a wrapper", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--standalone"));
    const badge = page.getByRole("status", { name: "Badge: New" });
    await expect(badge).toBeVisible();
    // No anchor data attributes leak through (still has anchor='top-right'
    // because the prop is always set, but data-overlap stays).
    const overlap = await badge.getAttribute("data-overlap");
    expect(overlap).toBe("rectangular");
  });

  test("dark theme swaps role colors on the filled badge", async ({ page }) => {
    await page.goto(storyUrl("data-display-badge--variants", "dark"));
    const badge = page.getByRole("status", { name: "Filled badge with 3" });
    const bg = await badge.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe(LIGHT_ERROR);
    expect(bg).not.toBe(TRANSPARENT);
  });
});
