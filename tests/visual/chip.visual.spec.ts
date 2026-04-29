import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3 Expressive Chip. Animations + reduced
 * motion are forced so the snapshots stay deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("Chip - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-chip--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `chip-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-chip--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `chip-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-chip--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `chip-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`filters - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-chip--filters", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `chip-filters-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`inputs - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("data-display-chip--inputs", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `chip-inputs-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
