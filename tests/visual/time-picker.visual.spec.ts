import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3-tokenized TimePicker.
 * Animations + reduced motion are forced so the snapshots stay
 * deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("TimePicker - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-time-picker--variants", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `time-picker-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-time-picker--sizes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `time-picker-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-time-picker--states", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `time-picker-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`open-panel - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-time-picker--open-panel", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `time-picker-open-panel-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
