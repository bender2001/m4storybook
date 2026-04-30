import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3-tokenized TreeView. Animations + reduced
 * motion are forced so the snapshots stay deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("Tree View - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-tree-view--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `tree-view-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-tree-view--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `tree-view-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-tree-view--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `tree-view-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`shapes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-tree-view--shapes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `tree-view-shapes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`slots - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("advanced-tree-view--slots", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `tree-view-slots-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
