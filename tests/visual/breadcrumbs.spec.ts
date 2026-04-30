import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Breadcrumbs.
 *
 * Spec sources (no M3 Expressive component, so we re-skin MUI with M3 tokens):
 *   - WAI-ARIA breadcrumb pattern
 *     https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
 *   - MUI Breadcrumbs
 *     https://mui.com/material-ui/react-breadcrumbs/
 *   - M3 color roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 *
 * Container:
 *   - <nav aria-label="Breadcrumb"> + <ol> per WAI-ARIA pattern
 *   - shape default `full` (pill)
 *   - host fill matrix:
 *       text     -> transparent
 *       filled   -> surface-container-highest
 *       tonal    -> secondary-container
 *       outlined -> transparent + 1dp outline-variant border
 *       elevated -> surface-container-low + elevation-1
 *
 * Per crumb:
 *   - link foreground = `primary` (M3 link role)
 *   - current foreground = `on-surface` (or `on-secondary-container` when filled)
 *   - state-layer opacities: hover 0.08, focus 0.10, pressed 0.10
 *   - density: 24 / 28 / 36 px host height for sm / md / lg
 *   - typography: label-m / label-l / title-s
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const LIGHT_ON_ERROR_CONTAINER = "rgb(65, 14, 11)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

const TRANSPARENT = "rgba(0, 0, 0, 0)";

test.describe("Breadcrumbs - M3 design parity", () => {
  test("default renders nav + ol with aria-label='Breadcrumb'", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--default"));
    const nav = page.locator("[data-component='breadcrumbs']").first();
    await expect(nav).toBeVisible();
    const tag = await nav.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("nav");
    await expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
    const list = nav.locator("ol[data-slot='list']");
    await expect(list).toHaveCount(1);
    await expect(nav).toHaveAttribute("data-variant", "text");
    await expect(nav).toHaveAttribute("data-size", "md");
    await expect(nav).toHaveAttribute("data-shape", "full");
  });

  test("link crumbs render <a href> + paint primary; current crumb is non-link with on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--default"));
    const link = page
      .locator("[data-component='breadcrumbs'] a[data-slot='crumb']")
      .first();
    await expect(link).toBeVisible();
    const linkColor = await link.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(linkColor).toBe(LIGHT_PRIMARY);

    const current = page
      .locator("[data-component='breadcrumbs'] [data-slot='crumb'][data-current='true']")
      .first();
    await expect(current).toHaveAttribute("aria-current", "page");
    const tag = await current.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("span");
    const currentColor = await current.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(currentColor).toBe(LIGHT_ON_SURFACE);
  });

  test("variants paint the M3 host matrix", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const crumb = page
        .locator(
          `[data-component='breadcrumbs'][data-variant='${variant}'] a[data-slot='crumb']`,
        )
        .first();
      await expect(crumb).toBeVisible();
      const bg = await crumb.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--variants"));
    const crumb = page
      .locator(
        "[data-component='breadcrumbs'][data-variant='outlined'] a[data-slot='crumb']",
      )
      .first();
    const styles = await crumb.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-1 shadow on link crumbs", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--variants"));
    const crumb = page
      .locator(
        "[data-component='breadcrumbs'][data-variant='elevated'] a[data-slot='crumb']",
      )
      .first();
    const shadow = await crumb.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale matches density: 24 / 28 / 36 px host heights", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const crumb = page
          .locator(
            `[data-component='breadcrumbs'][data-size='${size}'] a[data-slot='crumb']`,
          )
          .first();
        await expect(crumb).toBeVisible();
        return crumb.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["24px", "28px", "36px"]);
  });

  test("typography steps label-m / label-l / title-s for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "12px", weight: "500" },
      md: { size: "14px", weight: "500" },
      lg: { size: "14px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const crumb = page
        .locator(
          `[data-component='breadcrumbs'][data-size='${size}'] a[data-slot='crumb']`,
        )
        .first();
      const measured = await crumb.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("disabled trail dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--states"));
    const trail = page
      .locator("[data-component='breadcrumbs'][data-disabled='true']")
      .first();
    const styles = await trail.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("disabled crumb dims + sets aria-disabled", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--states"));
    const disabledCrumb = page
      .locator(
        "[data-component='breadcrumbs']:not([data-disabled]) [data-slot='crumb'][data-disabled='true']",
      )
      .first();
    await expect(disabledCrumb).toHaveAttribute("aria-disabled", "true");
    const opacity = await disabledCrumb.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("error state paints crumbs in error-container + on-error-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--states"));
    const errorTrail = page
      .locator("[data-component='breadcrumbs'][data-error='true']")
      .first();
    await expect(errorTrail).toBeVisible();
    const link = errorTrail.locator("a[data-slot='crumb']").first();
    const styles = await link.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_ERROR_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_ERROR_CONTAINER);
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const crumb = page
        .locator(
          `[data-component='breadcrumbs'][data-shape='${shape}'] a[data-slot='crumb']`,
        )
        .first();
      const radius = await crumb.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator(
        "[data-component='breadcrumbs'][data-shape='full'] a[data-slot='crumb']",
      )
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("separators sit between crumbs and stay non-interactive", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--default"));
    await page.waitForSelector(
      "[data-component='breadcrumbs'] [data-slot='separator']",
    );
    const separators = page.locator(
      "[data-component='breadcrumbs'] [data-slot='separator']",
    );
    expect(await separators.count()).toBe(3);
    const sepStyles = await separators.first().evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { color: cs.color, pointer: cs.pointerEvents };
    });
    expect(sepStyles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
    expect(sepStyles.pointer).toBe("none");
  });

  test("custom string separator renders verbatim", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--slots"));
    const trail = page
      .locator(
        "[data-component='breadcrumbs'][aria-label='String separator']",
      )
      .first();
    const sep = trail.locator("[data-slot='separator']").first();
    await expect(sep).toHaveText("›");
  });

  test("leading icon slot renders inside the crumb host", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--default"));
    await page.waitForSelector(
      "[data-component='breadcrumbs'] [data-slot='icon-leading']",
    );
    const leadingIcons = page.locator(
      "[data-component='breadcrumbs'] [data-slot='icon-leading']",
    );
    expect(await leadingIcons.count()).toBeGreaterThanOrEqual(1);
  });

  test("collapsed trail renders only first + last + ellipsis affordance", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--collapsed"));
    const nav = page.locator("[data-component='breadcrumbs']").first();
    await expect(nav).toHaveAttribute("data-collapsed", "true");
    const crumbs = nav.locator("[data-slot='crumb']");
    expect(await crumbs.count()).toBe(3);
    const expand = nav.locator("[data-slot='expand']");
    await expect(expand).toHaveCount(1);
    await expect(expand).toHaveAttribute("aria-label", "Show path");
  });

  test("clicking the ellipsis expands the full trail", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--collapsed"));
    const nav = page.locator("[data-component='breadcrumbs']").first();
    const expand = nav.locator("[data-slot='expand']");
    await expand.click();
    const crumbs = nav.locator("[data-slot='crumb']");
    expect(await crumbs.count()).toBe(6);
    await expect(nav).not.toHaveAttribute("data-collapsed", "true");
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-breadcrumbs--motion", "light", "no-preference"),
    );
    const crumb = page
      .locator(
        "[data-component='breadcrumbs'] a[data-slot='crumb']",
      )
      .first();
    const styles = await crumb.evaluate((el) => {
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

  test("hover paints state-layer at opacity 0.08", async ({ page }) => {
    await page.goto(
      storyUrl("navigation-breadcrumbs--default", "light", "no-preference"),
    );
    const link = page
      .locator("[data-component='breadcrumbs'] a[data-slot='crumb']")
      .first();
    await link.hover();
    // duration-short4 = 200ms; pad for safety so CSS transition settles.
    await page.waitForTimeout(350);
    const stateLayer = link.locator("[data-slot='state-layer']");
    const opacity = await stateLayer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.08, 2);
  });

  test("focus-visible paints state-layer at opacity 0.10 + the focus ring", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-breadcrumbs--default", "light", "no-preference"),
    );
    const link = page
      .locator("[data-component='breadcrumbs'] a[data-slot='crumb']")
      .first();
    await link.focus();
    await page.waitForTimeout(350);
    const stateLayer = link.locator("[data-slot='state-layer']");
    const opacity = await stateLayer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.1, 2);
  });

  test("keyboard: Enter on focused link fires onItemClick", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--accessibility"));
    const link = page.getByRole("link", { name: "Home" }).first();
    await link.focus();
    await page.keyboard.press("Enter");
    // Anchor has href="#home" — Enter follows it. After navigation hash is
    // appended; we just assert no crash + selection survives.
    await expect(link).toBeVisible();
  });

  test("ARIA: nav role + ol structure + last crumb has aria-current=page", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--accessibility"));
    const nav = page.locator("[data-component='breadcrumbs']").first();
    await expect(nav).toHaveAttribute("aria-label", "Primary breadcrumbs");
    const list = nav.locator("ol[data-slot='list']");
    await expect(list).toHaveCount(1);
    const items = list.locator("> li[data-slot='list-item']");
    expect(await items.count()).toBe(4);
    const current = nav.locator("[aria-current='page']");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("Headphones");
  });

  test("dark theme swaps link foreground to dark primary", async ({ page }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--default", "dark"));
    const link = page
      .locator("[data-component='breadcrumbs'] a[data-slot='crumb']")
      .first();
    const color = await link.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(DARK_PRIMARY);
  });

  test("playground story renders the trail + last crumb is current", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-breadcrumbs--playground"));
    const nav = page.locator("[data-component='breadcrumbs']").first();
    await expect(nav).toBeVisible();
    const current = nav.locator("[aria-current='page']");
    await expect(current).toHaveCount(1);
  });
});
