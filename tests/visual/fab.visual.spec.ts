import { expect, test } from "@playwright/test";

/**
 * Visual baseline screenshots for the M3 Floating Action Button.
 * Animations are disabled and reduced-motion is forced so the
 * snapshots are deterministic across runs.
 */

const storyUrl = (id: string, theme: "light" | "dark") =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:reduce`;

const SCREENSHOT_OPTS = {
  animations: "disabled" as const,
  caret: "hide" as const,
  maxDiffPixelRatio: 0.02,
};

test.describe("FAB - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants row - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-floating-action-button--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `fab-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes row - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-floating-action-button--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `fab-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states row - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-floating-action-button--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `fab-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`with icons - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-floating-action-button--with-icons", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `fab-with-icons-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
