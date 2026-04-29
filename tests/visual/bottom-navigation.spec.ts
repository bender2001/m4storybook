import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Bottom Navigation
 * (a.k.a. M3 Navigation Bar).
 *
 * Spec: https://m3.material.io/components/navigation-bar/specs
 *
 * Container:
 *   - shape  : `none` (full-bleed) by default
 *   - height : 64 / 80 / 96 px for sm / md / lg
 *   - fill   : `surface-container` (filled / default), `secondary-container`
 *              (tonal), `surface` + 1dp top divider (outlined),
 *              `surface-container-low` + elevation-2 (elevated)
 *
 * Active indicator:
 *   - shape  : full pill (`shape-full`)
 *   - size   : 56×24 / 64×32 / 72×40 for sm / md / lg
 *   - fill   : `secondary-container`
 *
 * Icon:
 *   - size   : 20 / 24 / 28 px for sm / md / lg
 *   - color  : `on-surface-variant` (rest), `on-secondary-container` (selected)
 *
 * Label:
 *   - role   : label-s / label-m / label-l for sm / md / lg
 *   - color  : `on-surface-variant` (rest), `on-surface` (selected)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const DARK_SURFACE_CONTAINER = "rgb(33, 31, 38)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("BottomNavigation - M3 design parity", () => {
  test("default renders an 80dp filled bar with shape-none + role=navigation", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default"));
    const bar = page.locator("[data-component='bottom-navigation']").first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("data-variant", "filled");
    await expect(bar).toHaveAttribute("data-size", "md");
    await expect(bar).toHaveAttribute("data-shape", "none");
    const tag = await bar.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("nav");
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        height: cs.minHeight,
        bg: cs.backgroundColor,
      };
    });
    expect(styles.radius).toBe("0px");
    expect(styles.height).toBe("80px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--variants"));
    const expected: Record<string, string> = {
      filled: LIGHT_SURFACE_CONTAINER,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: LIGHT_SURFACE,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const bar = page.locator(`[data-variant='${variant}']`).first();
      await expect(bar).toBeVisible();
      const bg = await bar.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp top divider in outline-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--variants"));
    const bar = page.locator("[data-variant='outlined']").first();
    const divider = bar.locator("[data-slot='divider']");
    await expect(divider).toHaveCount(1);
    const height = await divider.evaluate(
      (el) => window.getComputedStyle(el).height,
    );
    expect(height).toBe("1px");
  });

  test("elevated variant lifts to the elevation-2 shadow", async ({ page }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--variants"));
    const bar = page.locator("[data-variant='elevated']").first();
    const shadow = await bar.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("size scale matches density: 64 / 80 / 96 px container heights", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const bar = page
          .locator(`[data-component='bottom-navigation'][data-size='${size}']`)
          .first();
        await expect(bar).toBeVisible();
        return bar.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(heights).toEqual(["64px", "80px", "96px"]);
  });

  test("md indicator measures 64×32 px and uses the shape-full radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default"));
    const indicator = page
      .locator("[data-slot='destination'][data-selected='true'] [data-slot='indicator']")
      .first();
    await expect(indicator).toBeVisible();
    const dims = await indicator.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        width: cs.width,
        height: cs.height,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
      };
    });
    expect(dims.width).toBe("64px");
    expect(dims.height).toBe("32px");
    expect(dims.radius).toBe("9999px");
    expect(dims.bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("indicator scale matches density (sm 56×24 / md 64×32 / lg 72×40)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--sizes"));
    const expected: Record<string, { w: string; h: string }> = {
      sm: { w: "56px", h: "24px" },
      md: { w: "64px", h: "32px" },
      lg: { w: "72px", h: "40px" },
    };
    for (const [size, dims] of Object.entries(expected)) {
      const indicator = page
        .locator(
          `[data-component='bottom-navigation'][data-size='${size}'] [data-selected='true'] [data-slot='indicator']`,
        )
        .first();
      const measured = await indicator.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { w: cs.width, h: cs.height };
      });
      expect(measured, `size=${size}`).toEqual(dims);
    }
  });

  test("selected destination uses on-secondary-container icon + on-surface label", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default"));
    const selected = page
      .locator("[data-component='bottom-navigation'] [data-selected='true']")
      .first();
    const iconColor = await selected
      .locator("[data-slot='icon']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(iconColor).toBe(LIGHT_ON_SECONDARY_CONTAINER);
    const labelColor = await selected
      .locator("[data-slot='label']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(labelColor).toBe(LIGHT_ON_SURFACE);
  });

  test("rest destinations paint icon + label in on-surface-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default"));
    const restItem = page
      .locator(
        "[data-component='bottom-navigation'] [data-slot='destination']:not([data-selected])",
      )
      .first();
    const iconColor = await restItem
      .locator("[data-slot='icon']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(iconColor).toBe(LIGHT_ON_SURFACE_VARIANT);
    const labelColor = await restItem
      .locator("[data-slot='label']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(labelColor).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("md label uses label-m typography (12px / weight 500)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default"));
    const label = page
      .locator(
        "[data-component='bottom-navigation'] [data-slot='destination'][data-selected='true'] [data-slot='label']",
      )
      .first();
    const typo = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize, weight: cs.fontWeight };
    });
    expect(typo.size).toBe("12px");
    expect(typo.weight).toBe("500");
  });

  test("disabled bar dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--states"));
    const bar = page
      .locator("[data-component='bottom-navigation'][data-disabled='true']")
      .first();
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("disabled item dims to opacity 0.38 + sets aria-disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--states"));
    const disabledItem = page
      .locator(
        "[data-component='bottom-navigation']:not([data-disabled]) [data-slot='destination'][data-disabled='true']",
      )
      .first();
    await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    const opacity = await disabledItem.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const bar = page.locator(`[data-shape='${shape}']`).first();
      const radius = await bar.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("show-on-selection labels stay hidden for rest destinations", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--slots"));
    const bar = page
      .locator(
        "[data-component='bottom-navigation'][aria-label='Labels on selected only']",
      )
      .first();
    const restLabel = bar
      .locator(
        "[data-slot='destination']:not([data-selected]) [data-slot='label']",
      )
      .first();
    const opacity = await restLabel.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0, 2);
    const selectedLabel = bar
      .locator(
        "[data-slot='destination'][data-selected='true'] [data-slot='label']",
      )
      .first();
    const selectedOpacity = await selectedLabel.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(selectedOpacity)).toBeCloseTo(1, 2);
  });

  test("badge slot renders inside the icon-wrap and stays pointer-transparent", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--slots"));
    await page.waitForSelector(
      "[data-component='bottom-navigation'] [data-slot='badge']",
    );
    const badge = page.locator(
      "[data-component='bottom-navigation'] [data-slot='badge']",
    );
    expect(await badge.count()).toBeGreaterThanOrEqual(1);
    const pointer = await badge.first().evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );
    expect(pointer).toBe("none");
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-bottomnavigation--motion", "light", "no-preference"),
    );
    const bar = page.locator("[data-component='bottom-navigation']").first();
    const styles = await bar.evaluate((el) => {
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

  test("destinations expose tab role + ARIA selection state", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default"));
    await page.waitForSelector(
      "[data-component='bottom-navigation'] [role='tab']",
    );
    const tabs = page.locator(
      "[data-component='bottom-navigation'] [role='tab']",
    );
    expect(await tabs.count()).toBe(4);
    const selected = page.locator(
      "[data-component='bottom-navigation'] [role='tab'][aria-selected='true']",
    );
    expect(await selected.count()).toBe(1);
  });

  test("keyboard: ArrowRight moves focus + selection forward", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--accessibility"));
    const home = page.getByRole("tab", { name: "Home" }).first();
    await home.focus();
    await page.keyboard.press("ArrowRight");
    const search = page.getByRole("tab", { name: "Search" }).first();
    await expect(search).toHaveAttribute("aria-selected", "true");
  });

  test("keyboard: Home/End jump to first/last destinations", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--accessibility"));
    const home = page.getByRole("tab", { name: "Home" }).first();
    await home.focus();
    await page.keyboard.press("End");
    const profile = page.getByRole("tab", { name: "Profile" }).first();
    await expect(profile).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(home).toHaveAttribute("aria-selected", "true");
  });

  test("dark theme swaps the filled host to dark surface-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--default", "dark"));
    const bar = page.locator("[data-component='bottom-navigation']").first();
    const bg = await bar.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER);
  });

  test("playground story renders the bar + indicator pill", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-bottomnavigation--playground"));
    const bar = page.locator("[data-component='bottom-navigation']").first();
    await expect(bar).toBeVisible();
    const indicator = bar.locator(
      "[data-selected='true'] [data-slot='indicator']",
    );
    await expect(indicator).toHaveCount(1);
  });
});
