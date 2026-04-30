import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3-tokenized Container.
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

test.describe("Container - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-container--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `container-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-container--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `container-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-container--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `container-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`shapes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-container--shapes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `container-shapes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`slots - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-container--slots", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `container-slots-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
