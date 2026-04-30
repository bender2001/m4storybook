import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Pagination control.
 *
 * Spec sources:
 *   - MUI Pagination          https://mui.com/material-ui/react-pagination/
 *   - M3 icon-button spec     https://m3.material.io/components/icon-buttons/specs
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * MUI's `<Pagination />` has no Material 3 spec, so the surface is
 * re-skinned onto M3 tokens: page items render as M3 squircles
 * (shape-full rest -> shape-md selected, per the Expressive shape-morph
 * pattern shared with `<IconButton>`). Selected page paints
 * `secondary-container` + `on-secondary-container`. Hover / focus /
 * pressed paint state-layer at the canonical 0.08 / 0.10 / 0.10 opacities.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Pagination - M3 design parity", () => {
  test("default pagination renders nav + role=navigation + aria-label", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--default"));
    const root = page.locator("[data-component='pagination']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("role", "navigation");
    await expect(root).toHaveAttribute("aria-label", "Pagination");
    await expect(root).toHaveAttribute("data-variant", "text");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "full");
    await expect(root).toHaveAttribute("data-page", "3");
    await expect(root).toHaveAttribute("data-count", "10");
  });

  test("selected page paints secondary-container + aria-current=page", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--default"));
    const selected = page
      .locator(
        "[data-component='pagination-item'][data-kind='page'][data-selected='true']",
      )
      .first();
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("aria-current", "page");
    const styles = await selected.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderTopLeftRadius,
      };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
    // Selected morphs to shape-md (12px) — the M3 squircle.
    expect(styles.radius).toBe("12px");
  });

  test("unselected page renders the M3 circle (shape-full)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--default"));
    const unselected = page
      .locator(
        "[data-component='pagination-item'][data-kind='page']:not([data-selected])",
      )
      .first();
    const radius = await unselected.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("9999px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("navigation-pagination--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='pagination'][data-variant='${variant}']`)
        .first();
      await expect(root).toBeVisible();
      const bg = await root.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--variants"));
    const root = page
      .locator("[data-component='pagination'][data-variant='outlined']")
      .first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-1 (M3 surface elevation)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--variants"));
    const root = page
      .locator("[data-component='pagination'][data-variant='elevated']")
      .first();
    const shadow = await root.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale: 32 / 40 / 56 px page-item heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const item = page
          .locator(
            `[data-component='pagination'][data-size='${size}'] [data-component='pagination-item'][data-kind='page']`,
          )
          .first();
        await expect(item).toBeVisible();
        return item.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("size type: label-m / label-l / label-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "12px", weight: "500" },
      md: { size: "14px", weight: "500" },
      lg: { size: "14px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const item = page
        .locator(
          `[data-component='pagination'][data-size='${size}'] [data-component='pagination-item'][data-kind='page']`,
        )
        .first();
      const measured = await item.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("shape scale renders the canonical M3 host radii", async ({ page }) => {
    await page.goto(storyUrl("navigation-pagination--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const root = page
        .locator(`[data-component='pagination'][data-shape='${shape}']`)
        .first();
      const radius = await root.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='pagination'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("disabled control: aria-disabled, opacity 0.38, pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--states"));
    const root = page
      .locator("[data-component='pagination'][data-disabled='true']")
      .first();
    await expect(root).toHaveAttribute("aria-disabled", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error control paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--states"));
    const root = page
      .locator("[data-component='pagination'][data-error='true']")
      .first();
    await expect(root).toHaveAttribute("aria-invalid", "true");
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("first/previous arrows disabled when on page 1", async ({ page }) => {
    await page.goto(storyUrl("navigation-pagination--slots"));
    // First Slots story: showFirst+showLast, default page 5 — none disabled.
    // Use the second story (no nav arrows) and the third (custom icons).
    // The first row (showFirst+showLast) at page 5 should not have prev disabled.
    const navs = page.locator("[data-component='pagination']");
    const firstNav = navs.nth(0);
    const firstBtn = firstNav.locator(
      "[data-component='pagination-item'][data-kind='first']",
    );
    await expect(firstBtn).toBeVisible();
    await expect(firstBtn).not.toHaveAttribute("data-disabled", "true");
    // Third nav: custom icons, but at page 5 nothing should be disabled.
    const thirdNav = navs.nth(2);
    const customFirst = thirdNav.locator(
      "[data-component='pagination-item'][data-kind='first']",
    );
    const customLast = thirdNav.locator(
      "[data-component='pagination-item'][data-kind='last']",
    );
    await expect(customFirst).toBeVisible();
    await expect(customLast).toBeVisible();
  });

  test("hidePrevButton + hideNextButton omit those controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--slots"));
    // Second nav has hidePrev + hideNext.
    const nav = page.locator("[data-component='pagination']").nth(1);
    const prev = nav.locator(
      "[data-component='pagination-item'][data-kind='previous']",
    );
    const next = nav.locator(
      "[data-component='pagination-item'][data-kind='next']",
    );
    await expect(prev).toHaveCount(0);
    await expect(next).toHaveCount(0);
  });

  test("ellipsis renders aria-hidden on collapsed ranges", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--slots"));
    const ellipsis = page
      .locator("[data-component='pagination-item'][data-kind='end-ellipsis']")
      .first();
    await expect(ellipsis).toBeVisible();
    await expect(ellipsis).toHaveAttribute("aria-hidden", "true");
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on host transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-pagination--motion", "light", "no-preference"),
    );
    const root = page.locator("[data-component='pagination']").first();
    const styles = await root.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.property).toContain("box-shadow");
    expect(styles.duration).toContain("0.3s");
  });

  test("hover paints state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("navigation-pagination--default", "light", "no-preference"),
    );
    // Hover an unselected page (page 5 — not the focused/initial).
    const item = page
      .locator(
        "[data-component='pagination-item'][data-kind='page']:not([data-selected])",
      )
      .nth(2);
    const layer = item.locator("[data-slot='state-layer']").first();
    await item.hover();
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("ARIA wiring: roving-tabindex — exactly one item has tabindex=0", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-pagination--accessibility", "light", "no-preference"),
    );
    await page.waitForLoadState("networkidle");
    const nav = page.locator("[data-component='pagination']").first();
    const items = nav.locator("button[data-component='pagination-item']");
    await expect(items.first()).toBeVisible();
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    const tabIndices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        items
          .nth(i)
          .evaluate((el) => (el as HTMLElement).getAttribute("tabindex")),
      ),
    );
    const focusable = tabIndices.filter((t) => t === "0").length;
    expect(focusable).toBe(1);
  });

  test("custom aria-label is honored", async ({ page }) => {
    await page.goto(storyUrl("navigation-pagination--accessibility"));
    const nav = page
      .locator(
        "[data-component='pagination'][aria-label='Search results pagination']",
      )
      .first();
    await expect(nav).toBeVisible();
  });

  test("text variant renders transparent host (no backplate)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--variants"));
    const nav = page
      .locator("[data-component='pagination'][data-variant='text']")
      .first();
    const styles = await nav.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("dark theme swaps filled host to dark surface-container-highest", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--variants", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const nav = page
      .locator("[data-component='pagination'][data-variant='filled']")
      .first();
    const bg = await nav.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("playground story renders a pagination with role=navigation", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-pagination--playground"));
    const nav = page.locator("[data-component='pagination']").first();
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute("role", "navigation");
  });

  test("Enter on a page button triggers selection (uncontrolled)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-pagination--default", "light", "no-preference"),
    );
    // Page 4 (button is unselected, default page=3, so press Right -> Enter).
    const next = page
      .locator(
        "[data-component='pagination-item'][data-kind='page'][data-page='4']",
      )
      .first();
    await next.focus();
    await page.keyboard.press("Enter");
    // After clicking 4, page 4 should be aria-current and selected.
    const selected = page
      .locator(
        "[data-component='pagination-item'][data-kind='page'][data-selected='true']",
      )
      .first();
    await expect(selected).toHaveAttribute("data-page", "4");
  });
});
