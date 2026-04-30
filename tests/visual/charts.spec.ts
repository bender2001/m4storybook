import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Charts.
 *
 * Spec sources (no M3 Expressive component, so we re-skin MUI X-Charts
 * with M3 tokens):
 *   - MUI X-Charts
 *     https://mui.com/x/react-charts/
 *   - M3 surface roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 motion tokens
 *     https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
 *
 * Card host:
 *   - shape default `lg` (16px)
 *   - host fill matrix:
 *       text     -> transparent
 *       filled   -> surface-container-highest
 *       tonal    -> secondary-container
 *       outlined -> transparent + 1dp outline-variant border
 *       elevated -> surface-container-low + elevation-1
 *
 * Plot:
 *   - data series paint primary / secondary / tertiary / error
 *   - axis + grid paint outline-variant
 *   - draw-in motion uses the M3 emphasized tween
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_SECONDARY = "rgb(98, 91, 113)";
const LIGHT_TERTIARY = "rgb(125, 82, 96)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_ON_SURFACE = "rgb(230, 224, 233)";

const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

test.describe("Charts - M3 design parity", () => {
  test("default renders with role=figure + token-driven aria-label", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--default"));
    const root = page.locator("[data-component='charts']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("role", "figure");
    await expect(root).toHaveAttribute("data-type", "bar");
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "lg");
  });

  test("title slot renders the title text in on-surface", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--default"));
    const title = page
      .locator("[data-component='charts'] [data-slot='title']")
      .first();
    await expect(title).toHaveText("Quarterly Revenue");
    const color = await title.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE);
  });

  test("variants paint the M3 host matrix", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const host = page
        .locator(`[data-component='charts'][data-variant='${variant}']`)
        .first();
      await expect(host).toBeVisible();
      const bg = await host.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--variants"));
    const host = page
      .locator("[data-component='charts'][data-variant='outlined']")
      .first();
    const styles = await host.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-1 shadow", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--variants"));
    const host = page
      .locator("[data-component='charts'][data-variant='elevated']")
      .first();
    const shadow = await host.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale steps plot height: 160 / 220 / 300 px", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const plot = page
          .locator(
            `[data-component='charts'][data-size='${size}'] [data-slot='plot']`,
          )
          .first();
        await expect(plot).toBeVisible();
        return plot.evaluate((el) =>
          parseFloat(window.getComputedStyle(el).height),
        );
      }),
    );
    expect(heights).toEqual([160, 220, 300]);
  });

  test("title typography steps title-s / title-m / title-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--sizes"));
    const expected: Record<string, { size: string; weight: string }> = {
      sm: { size: "14px", weight: "500" },
      md: { size: "16px", weight: "500" },
      lg: { size: "22px", weight: "500" },
    };
    for (const [size, typo] of Object.entries(expected)) {
      const title = page
        .locator(
          `[data-component='charts'][data-size='${size}'] [data-slot='title']`,
        )
        .first();
      const measured = await title.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { size: cs.fontSize, weight: cs.fontWeight };
      });
      expect(measured, `size=${size}`).toEqual(typo);
    }
  });

  test("plot kinds render their slot bodies", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--types"));
    const bar = page
      .locator(
        "[data-component='charts'][data-type='bar'] [data-slot='bars']",
      )
      .first();
    await expect(bar).toBeVisible();

    const line = page
      .locator(
        "[data-component='charts'][data-type='line'] [data-slot='lines']",
      )
      .first();
    await expect(line).toBeVisible();

    const area = page
      .locator(
        "[data-component='charts'][data-type='area'] [data-slot='areas']",
      )
      .first();
    await expect(area).toBeVisible();

    const pie = page
      .locator(
        "[data-component='charts'][data-type='pie'] [data-slot='pie-body']",
      )
      .first();
    await expect(pie).toBeVisible();
  });

  test("series paint the M3 color role matrix", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--types"));
    const expected: Record<string, string> = {
      primary: LIGHT_PRIMARY,
      secondary: LIGHT_SECONDARY,
      tertiary: LIGHT_TERTIARY,
    };
    for (const [role, color] of Object.entries(expected)) {
      const bar = page
        .locator(
          `[data-component='charts'][data-type='bar'] [data-slot='bar'][data-series-color='${role}']`,
        )
        .first();
      await expect(bar).toBeVisible();
      const fill = await bar.evaluate((el) =>
        window.getComputedStyle(el).fill,
      );
      expect(fill, `role=${role}`).toBe(color);
    }
  });

  test("loading state paints the skeleton overlay + sets aria-busy", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--states"));
    const loadingHost = page
      .locator("[data-component='charts'][data-loading='true']")
      .first();
    await expect(loadingHost).toBeVisible();
    await expect(loadingHost).toHaveAttribute("aria-busy", "true");
    const overlay = loadingHost.locator("[data-slot='loading']");
    await expect(overlay).toHaveCount(1);
  });

  test("empty state renders the placeholder copy", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--states"));
    const emptyHost = page
      .locator("[data-component='charts'][data-empty='true']")
      .first();
    await expect(emptyHost).toBeVisible();
    const empty = emptyHost.locator("[data-slot='empty']");
    await expect(empty).toHaveText("Nothing to plot");
  });

  test("disabled host dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--states"));
    const disabled = page
      .locator("[data-component='charts'][data-disabled='true']")
      .first();
    const styles = await disabled.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("error state paints series in error + sets aria-invalid", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--states"));
    const errorHost = page
      .locator("[data-component='charts'][data-error='true']")
      .first();
    await expect(errorHost).toBeVisible();
    await expect(errorHost).toHaveAttribute("aria-invalid", "true");
    const bar = errorHost
      .locator("[data-slot='bar'][data-series-color='error']")
      .first();
    const fill = await bar.evaluate((el) =>
      window.getComputedStyle(el).fill,
    );
    expect(fill).toBe(LIGHT_ERROR);
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const host = page
        .locator(`[data-component='charts'][data-shape='${shape}']`)
        .first();
      const radius = await host.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='charts'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("axis + grid lines paint outline-variant", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--default"));
    const grid = page
      .locator("[data-component='charts'] [data-slot='grid'] line")
      .first();
    await expect(grid).toHaveCount(1);
    const stroke = await grid.evaluate(
      (el) => window.getComputedStyle(el).stroke,
    );
    expect(stroke).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("legend lists each series with a chip + colored dot", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--default"));
    const legend = page
      .locator("[data-component='charts'] [data-slot='legend']")
      .first();
    await expect(legend).toHaveAttribute("role", "list");
    await expect(legend).toHaveAttribute("aria-label", "Legend");
    const items = legend.locator("[data-slot='legend-item']");
    expect(await items.count()).toBe(2);
    const dotBg = await items
      .first()
      .locator("[data-slot='legend-dot']")
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(dotBg).toBe(LIGHT_PRIMARY);
  });

  test("legend hides when legend prop is false", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--slots"));
    const noLegend = page
      .locator("[data-component='charts'][aria-label='No legend']")
      .first();
    await expect(noLegend).toBeVisible();
    expect(await noLegend.locator("[data-slot='legend']").count()).toBe(0);
  });

  test("grid hides when showGrid is false", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--slots"));
    const noGrid = page
      .locator("[data-component='charts'][aria-label='No grid']")
      .first();
    expect(await noGrid.locator("[data-slot='grid']").count()).toBe(0);
  });

  test("leading + trailing icon slots render in the header", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--slots"));
    const withIcons = page
      .locator("[data-component='charts'][aria-label='With trailing icon']")
      .first();
    await expect(
      withIcons.locator("[data-slot='icon-leading']"),
    ).toHaveCount(1);
    await expect(
      withIcons.locator("[data-slot='icon-trailing']"),
    ).toHaveCount(1);
  });

  test("M3 motion: emphasized easing + medium2 duration on host transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-charts--motion", "light", "no-preference"),
    );
    const host = page.locator("[data-component='charts']").first();
    const styles = await host.evaluate((el) => {
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

  test("ARIA: aria-label, role=figure, aria-busy off when not loading", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-charts--accessibility"));
    const host = page.locator("[data-component='charts']").first();
    await expect(host).toHaveAttribute(
      "aria-label",
      "Quarterly revenue chart",
    );
    await expect(host).toHaveAttribute("role", "figure");
    expect(await host.getAttribute("aria-busy")).toBeNull();
  });

  test("dark theme renders title in dark on-surface", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--default", "dark"));
    const title = page
      .locator("[data-component='charts'] [data-slot='title']")
      .first();
    const color = await title.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(DARK_ON_SURFACE);
  });

  test("playground story renders the bar chart", async ({ page }) => {
    await page.goto(storyUrl("advanced-charts--playground"));
    const root = page.locator("[data-component='charts']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-type", "bar");
  });
});
