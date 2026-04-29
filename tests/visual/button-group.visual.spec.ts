import { expect, test } from "@playwright/test";

/**
 * Visual baseline screenshots for the M3 Expressive Button Group.
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

test.describe("Button Group - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-button-group--variants", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `button-group-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-button-group--sizes", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `button-group-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states column - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-button-group--states", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `button-group-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`with icons - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("inputs-button-group--with-icons", theme));
      await page.waitForLoadState("networkidle");
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `button-group-with-icons-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
