import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Tabs.
 *
 * Spec sources:
 *   - M3 Tabs                 https://m3.material.io/components/tabs/specs
 *   - MUI Tabs                https://mui.com/material-ui/react-tabs/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * Implements both M3 Primary Tabs + M3 Secondary Tabs plus the M3
 * Expressive selection morph: the active indicator is a shared
 * `layoutId` motion span that springs between tabs, and its shape
 * morphs from `shape-xs` to the selected `shape` token via
 * motion/react springs.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Tabs - M3 design parity", () => {
  test("default tabs renders role=tablist + role=tab + aria-selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const root = page.locator("[data-component='tabs']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-shape", "md");
    const list = page.locator("[role='tablist']").first();
    await expect(list).toHaveAttribute("aria-orientation", "horizontal");
    const tabs = page.locator("[data-component='tabs-tab']");
    await expect(tabs).toHaveCount(3);
  });

  test("default story marks the active tab with aria-selected=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const selected = page
      .locator("[data-component='tabs-tab'][data-selected='true']")
      .first();
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(selected).toHaveAttribute("data-state", "selected");
    const inactive = page.locator(
      "[data-component='tabs-tab'][data-state='inactive']",
    );
    await expect(inactive).toHaveCount(2);
  });

  test("active tab paints text-primary on filled variant (default)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const selectedLabel = page
      .locator(
        "[data-component='tabs-tab'][data-selected='true'] [data-slot='tab-label']",
      )
      .first();
    const color = await selectedLabel.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_PRIMARY);
  });

  test("inactive tab paints text-on-surface-variant on filled variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const inactiveLabel = page
      .locator(
        "[data-component='tabs-tab'][data-state='inactive'] [data-slot='tab-label']",
      )
      .first();
    const color = await inactiveLabel.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("variant matrix paints the M3 indicator surface mapping", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--variants"));
    const expected: Record<string, string> = {
      filled: LIGHT_PRIMARY,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: LIGHT_PRIMARY,
      text: LIGHT_PRIMARY,
      elevated: LIGHT_PRIMARY,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const indicator = page
        .locator(
          `[data-component='tabs'][data-variant='${variant}'] [data-slot='tabs-indicator']`,
        )
        .first();
      await expect(indicator).toBeVisible();
      const bg = await indicator.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1px outline-variant border per tab", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--variants"));
    const tab = page
      .locator(
        "[data-component='tabs'][data-variant='outlined'] [data-component='tabs-tab']",
      )
      .first();
    const styles = await tab.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.borderWidth).toBe("1px");
  });

  test("elevated variant paints surface-container-low + elevation-1 host", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--variants"));
    const host = page
      .locator("[data-component='tabs'][data-variant='elevated']")
      .first();
    const styles = await host.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("size scale: 40 / 48 / 64 px tab heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const tab = page
          .locator(
            `[data-component='tabs'][data-size='${size}'] [data-component='tabs-tab']`,
          )
          .first();
        await expect(tab).toBeVisible();
        return tab.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["40px", "48px", "64px"]);
  });

  test("md size paints title-s typography on labels (14px / 500)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const label = page
      .locator(
        "[data-component='tabs'][data-size='md'] [data-slot='tab-label']",
      )
      .first();
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize, weight: cs.fontWeight };
    });
    expect(styles.size).toBe("14px");
    expect(styles.weight).toBe("500");
  });

  test("active indicator paints shape-md (12px) at default shape", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const indicator = page.locator("[data-slot='tabs-indicator']").first();
    const radius = await indicator.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
  });

  test("shape scale renders the canonical M3 active radii", async ({ page }) => {
    await page.goto(storyUrl("navigation-tabs--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const indicator = page
        .locator(
          `[data-component='tabs'][data-shape='${shape}'] [data-slot='tabs-indicator']`,
        )
        .first();
      const radius = await indicator.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullIndicator = page
      .locator(
        "[data-component='tabs'][data-shape='full'] [data-slot='tabs-indicator']",
      )
      .first();
    const radius = await fullIndicator.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("9999px");
  });

  test("active indicator height is 3dp on the default M3 Primary Tabs", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const indicator = page.locator("[data-slot='tabs-indicator']").first();
    const height = await indicator.evaluate(
      (el) => window.getComputedStyle(el).height,
    );
    expect(height).toBe("3px");
  });

  test("filled variant paints the bottom outline-variant divider", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--default"));
    const divider = page.locator("[data-slot='tabs-divider']").first();
    await expect(divider).toBeVisible();
    const bg = await divider.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("error tab paints text-error on the label", async ({ page }) => {
    await page.goto(storyUrl("navigation-tabs--states"));
    const errorLabel = page
      .locator(
        "[data-component='tabs-tab'][data-error='true'] [data-slot='tab-label']",
      )
      .first();
    await expect(errorLabel).toBeVisible();
    const color = await errorLabel.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("disabled tab list: aria-disabled wash + opacity 0.38 + pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--states"));
    const disabledRoot = page
      .locator("[data-component='tabs'][data-disabled='true']")
      .first();
    await expect(disabledRoot).toBeVisible();
    const styles = await disabledRoot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("disabled tab item: data-disabled + aria-disabled + tabindex -1", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--states"));
    const disabledTab = page
      .locator("[data-component='tabs-tab'][data-disabled='true']")
      .first();
    await expect(disabledTab).toBeVisible();
    await expect(disabledTab).toHaveAttribute("aria-disabled", "true");
    await expect(disabledTab).toHaveAttribute("tabindex", "-1");
  });

  test("vertical orientation flips aria-orientation + indicator axis", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-tabs--vertical"));
    const root = page.locator("[data-component='tabs']").first();
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    const list = page.locator("[role='tablist']").first();
    await expect(list).toHaveAttribute("aria-orientation", "vertical");
    const indicator = page.locator("[data-slot='tabs-indicator']").first();
    const width = await indicator.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    expect(width).toBe("3px");
  });

  test("M3 motion: emphasized easing on label color transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--default", "light", "no-preference"),
    );
    const label = page
      .locator(
        "[data-component='tabs-tab'][data-selected='true'] [data-slot='tab-label']",
      )
      .first();
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("color");
    expect(styles.duration).toContain("0.3s");
  });

  test("hover paints state-layer at 0.08 opacity on a reachable tab", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--default", "light", "no-preference"),
    );
    const inactiveTab = page
      .locator("[data-component='tabs-tab'][data-state='inactive']")
      .first();
    await expect(inactiveTab).toBeVisible();
    const layer = inactiveTab.locator("[data-slot='state-layer']").first();
    await inactiveTab.hover();
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("ARIA wiring: tab references its panel via aria-controls", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--playground", "light", "no-preference"),
    );
    const tabs = page.locator("[data-component='tabs-tab']");
    const first = tabs.first();
    const controls = await first.getAttribute("aria-controls");
    expect(controls).toMatch(/-panel-/);
  });

  test("tabpanel labelled by the active tab via aria-labelledby", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--playground", "light", "no-preference"),
    );
    const panel = page.locator("[role='tabpanel']").first();
    await expect(panel).toBeVisible();
    const labelledBy = await panel.getAttribute("aria-labelledby");
    expect(labelledBy).toMatch(/-tab-favorites$/);
  });

  test("roving-tabindex: exactly one focusable tab in the tablist", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--default", "light", "no-preference"),
    );
    await page.waitForLoadState("networkidle");
    const tabs = page.locator("[data-component='tabs-tab']");
    const count = await tabs.count();
    expect(count).toBeGreaterThan(1);
    const tabIndices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        tabs.nth(i).evaluate((el) => (el as HTMLElement).getAttribute("tabindex")),
      ),
    );
    const focusable = tabIndices.filter((t) => t === "0").length;
    expect(focusable).toBe(1);
  });

  test("clicking an inactive tab moves the indicator + flips aria-selected", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--default", "light", "no-preference"),
    );
    const reviews = page
      .locator("[data-component='tabs-tab'][data-key='reviews']")
      .first();
    await reviews.click();
    await expect(reviews).toHaveAttribute("aria-selected", "true");
    const indicator = reviews.locator("[data-slot='tabs-indicator']");
    await expect(indicator).toHaveCount(1);
  });

  test("ArrowRight on a focused tab moves focus to the next reachable tab", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-tabs--default", "light", "no-preference"),
    );
    const first = page
      .locator("[data-component='tabs-tab'][data-key='overview']")
      .first();
    await first.focus();
    await page.keyboard.press("ArrowRight");
    const focusedKey = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-key"),
    );
    expect(focusedKey).toBe("specs");
  });

  test("Enter on a focused inactive tab activates it", async ({ page }) => {
    await page.goto(
      storyUrl(
        "navigation-tabs--interaction-spec",
        "light",
        "no-preference",
      ),
    );
    const reviewsTab = page
      .locator("[data-component='tabs-tab'][data-key='reviews']")
      .first();
    await reviewsTab.focus();
    await page.keyboard.press("Enter");
    await expect(reviewsTab).toHaveAttribute("aria-selected", "true");
  });

  test("dark theme: indicator swaps to dark primary", async ({ page }) => {
    await page.goto(storyUrl("navigation-tabs--default", "dark"));
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const indicator = page.locator("[data-slot='tabs-indicator']").first();
    const bg = await indicator.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_PRIMARY);
  });
});
