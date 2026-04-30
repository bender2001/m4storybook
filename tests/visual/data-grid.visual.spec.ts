import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3-tokenized DataGrid.
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

test.describe("DataGrid - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-data-grid--variants", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `data-grid-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-data-grid--sizes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `data-grid-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-data-grid--states", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `data-grid-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`shapes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-data-grid--shapes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `data-grid-shapes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`with-checkboxes - ${theme}`, async ({ page }) => {
      await page.goto(
        storyUrl("advanced-data-grid--with-checkboxes", theme),
      );
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `data-grid-with-checkboxes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
