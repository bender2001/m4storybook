import { expect, test } from "@playwright/test";

/**
 * Visual baseline screenshots for the Material 3 Slider.
 * Animations are disabled and reduced-motion is forced so the
 * snapshots stay deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("Slider - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-slider--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `slider-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-slider--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `slider-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-slider--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `slider-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`with icons - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-slider--with-icons", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `slider-with-icons-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
