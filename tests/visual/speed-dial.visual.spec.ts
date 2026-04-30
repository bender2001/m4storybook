import { expect, test } from "@playwright/test";

/**
 * Visual baselines for the M3-tokenized Speed Dial.
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

test.describe("SpeedDial - visual baselines", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`variants - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-speed-dial--variants", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `speed-dial-variants-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`sizes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-speed-dial--sizes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `speed-dial-sizes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`states - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-speed-dial--states", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `speed-dial-states-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`shapes - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-speed-dial--shapes", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `speed-dial-shapes-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });

    test(`directions - ${theme}`, async ({ page }) => {
      await page.goto(storyUrl("navigation-speed-dial--directions", theme));
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
      const root = page.locator("#storybook-root");
      await expect(root).toHaveScreenshot(
        `speed-dial-directions-${theme}.png`,
        SCREENSHOT_OPTS,
      );
    });
  }
});
