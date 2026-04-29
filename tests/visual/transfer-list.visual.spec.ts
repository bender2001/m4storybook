import { expect, test } from "@playwright/test";

/**
 * Visual baseline screenshots for the M3 Transfer List. Animations
 * are disabled and reduced-motion is forced so the snapshots stay
 * deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("Transfer List - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-transfer-list--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `transfer-list-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-transfer-list--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `transfer-list-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-transfer-list--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `transfer-list-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`with descriptions - ${theme}`, async ({ page }) => {
      await page.goto(
        storyUrl("inputs-transfer-list--with-descriptions", theme),
      );
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `transfer-list-with-descriptions-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
