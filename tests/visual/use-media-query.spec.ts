import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized useMediaQuery / <MediaQuery>.
 *
 * MUI's useMediaQuery is a behaviour hook with no rendered surface; we
 * re-skin it as a *responsive announcement panel* using the M3 token
 * layer:
 *
 *   - menu/popover surface (elevated default, elevation-2 shadow per
 *     https://m3.material.io/components/menus/specs)
 *   - shape default `lg` (16px) per the M3 menu radius
 *   - title-s / title-m / title-l header type for sm / md / lg
 *   - state-layer opacities follow M3 input-library tokens
 *   - container transitions ride medium2 (300ms) on emphasized
 *
 * Spec sources:
 *   - MUI useMediaQuery
 *     https://mui.com/material-ui/react-use-media-query/
 *   - M3 menu spec
 *     https://m3.material.io/components/menus/specs
 *   - M3 elevation tokens
 *     https://m3.material.io/styles/elevation/tokens
 *   - M3 color roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER_LOW = "rgb(29, 27, 32)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("useMediaQuery - M3 design parity", () => {
  test("default panel renders the M3 menu surface (elevated / shape-lg / md size)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--default"));
    const panel = page.locator("[data-component='use-media-query']").first();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-variant", "elevated");
    await expect(panel).toHaveAttribute("data-size", "md");
    await expect(panel).toHaveAttribute("data-shape", "lg");
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        minH: cs.minHeight,
        pad: cs.paddingTop,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.radius).toBe("16px");
    expect(styles.minH).toBe("72px");
    expect(styles.pad).toBe("16px");
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("utils-usemediaquery--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const panel = page
        .locator(
          `[data-component='use-media-query'][data-variant='${variant}']`,
        )
        .first();
      await expect(panel).toBeVisible();
      const bg = await panel.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--variants"));
    const panel = page
      .locator(
        "[data-component='use-media-query'][data-variant='outlined']",
      )
      .first();
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-2 (M3 menu surface elevation)", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--variants"));
    const panel = page
      .locator(
        "[data-component='use-media-query'][data-variant='elevated']",
      )
      .first();
    const shadow = await panel.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    // elevation-2 token: 0px 1px 2px rgba(0,0,0,.30), 0px 2px 6px 2px rgba(0,0,0,.15)
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("6px");
  });

  test("size scale: 56 / 72 / 96 px min-heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const panel = page
          .locator(
            `[data-component='use-media-query'][data-size='${size}']`,
          )
          .first();
        await expect(panel).toBeVisible();
        return panel.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["56px", "72px", "96px"]);
  });

  test("size pad: 12 / 16 / 24 px for sm / md / lg", async ({ page }) => {
    await page.goto(storyUrl("utils-usemediaquery--sizes"));
    const pads = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const panel = page
          .locator(
            `[data-component='use-media-query'][data-size='${size}']`,
          )
          .first();
        return panel.evaluate((el) => window.getComputedStyle(el).paddingTop);
      }),
    );
    expect(pads).toEqual(["12px", "16px", "24px"]);
  });

  test("header typography steps title-s / title-m / title-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "14px", weight: "500" },
      md: { size: "16px", weight: "500" },
      lg: { size: "22px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const header = page
        .locator(
          `[data-component='use-media-query'][data-size='${size}'] [data-slot='header']`,
        )
        .first();
      const measured = await header.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled panel: aria-disabled, opacity 0.38, tabIndex=-1", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--states"));
    const panel = page
      .locator(
        "[data-component='use-media-query'][data-disabled='true']",
      )
      .first();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("aria-disabled", "true");
    await expect(panel).toHaveAttribute("tabindex", "-1");
    const opacity = await panel.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("selected panel paints secondary-container + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--states"));
    const panel = page
      .locator(
        "[data-component='use-media-query'][data-selected='true']",
      )
      .first();
    await expect(panel).toHaveAttribute("aria-selected", "true");
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("error panel paints error-container + aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--states"));
    const panel = page
      .locator(
        "[data-component='use-media-query'][data-error='true']",
      )
      .first();
    await expect(panel).toHaveAttribute("aria-invalid", "true");
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("utils-usemediaquery--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const panel = page
        .locator(
          `[data-component='use-media-query'][data-shape='${shape}']`,
        )
        .first();
      const radius = await panel.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator(
        "[data-component='use-media-query'][data-shape='full']",
      )
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("leading + trailing icon slots render alongside the label", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--slots"));
    const leading = page
      .locator(
        "[data-component='use-media-query'] [data-slot='icon-leading']",
      )
      .first();
    const trailing = page
      .locator(
        "[data-component='use-media-query'] [data-slot='icon-trailing']",
      )
      .first();
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    const label = page
      .locator(
        "[data-component='use-media-query'] [data-slot='label']",
      )
      .first();
    await expect(label).toBeVisible();
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-usemediaquery--motion", "light", "no-preference"),
    );
    const panel = page
      .locator("[data-component='use-media-query']")
      .first();
    const styles = await panel.evaluate((el) => {
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

  test("ARIA wiring: role=status, aria-live=polite, focusable", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-usemediaquery--accessibility", "light", "no-preference"),
    );
    const panel = page.locator("[data-component='use-media-query']").first();
    await expect(panel).toHaveAttribute("role", "status");
    await expect(panel).toHaveAttribute("aria-live", "polite");
    await expect(panel).toHaveAttribute("tabindex", "0");
    await panel.focus();
    const focusedTag = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-component"),
    );
    expect(focusedTag).toBe("use-media-query");
  });

  test("dark theme swaps elevated panel to dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--default", "dark"));
    const panel = page
      .locator("[data-component='use-media-query']")
      .first();
    const bg = await panel.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("text variant renders transparent host so it can wrap external surfaces", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--variants"));
    const panel = page
      .locator(
        "[data-component='use-media-query'][data-variant='text']",
      )
      .first();
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("hook reports a boolean for the supplied query", async ({ page }) => {
    await page.goto(storyUrl("utils-usemediaquery--hook-consumer"));
    const consumer = page.locator("[data-testid='hook-consumer']");
    await expect(consumer).toBeVisible();
    // The viewport is well above 320px in the chromium devices preset so
    // the hook should report `true` once subscribed.
    await expect(consumer).toHaveAttribute("data-matches", "true");
    const result = page.locator("[data-slot='hook-result']");
    await expect(result).toHaveText("true");
  });

  test("playground story renders a panel with the canonical default props", async ({
    page,
  }) => {
    await page.goto(storyUrl("utils-usemediaquery--playground"));
    const panel = page
      .locator("[data-component='use-media-query']")
      .first();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-variant", "elevated");
  });

  test("status pill flips between matched + unmatched states", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("utils-usemediaquery--motion", "light", "no-preference"),
    );
    const panel = page
      .locator("[data-component='use-media-query']")
      .first();
    await expect(panel).toBeVisible();
    await page.locator("[data-testid='motion-wide']").click();
    await expect(panel).toHaveAttribute("data-matches", "false");
    await page.locator("[data-testid='motion-narrow']").click();
    await expect(panel).toHaveAttribute("data-matches", "true");
  });
});
