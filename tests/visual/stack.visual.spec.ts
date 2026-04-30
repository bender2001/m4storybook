import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3 Stack. Animations and reduced-motion
 * are forced so the snapshots stay deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("Stack - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-stack--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stack-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-stack--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stack-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`shapes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-stack--shapes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stack-shapes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-stack--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stack-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`divider - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("layout-stack--divider", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stack-divider-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
