import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3-tokenized Stepper.
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

test.describe("Stepper - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-stepper--variants", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stepper-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-stepper--sizes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stepper-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-stepper--states", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stepper-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`shapes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-stepper--shapes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stepper-shapes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`orientations - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-stepper--orientations", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `stepper-orientations-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
