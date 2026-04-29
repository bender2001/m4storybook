import { expect, test } from "@playwright/test";

const STORY_URL = "/iframe.html?id=inputs-button--default&viewMode=story";

test.describe("Button - M3 Expressive design parity", () => {
  test("filled variant matches M3 spec", async ({ page }) => {
    await page.goto(STORY_URL);
    const button = page.getByRole("button", { name: "Button" });
    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        height: cs.height,
        borderRadius: cs.borderRadius,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        transitionDuration: cs.transitionDuration,
      };
    });

    expect(styles.height).toBe("40px");
    expect(parseFloat(styles.borderRadius)).toBeGreaterThanOrEqual(20);
  });

  test("press triggers springy scale", async ({ page }) => {
    await page.goto(STORY_URL);
    const button = page.getByRole("button", { name: "Button" });
    await button.hover();
    await page.mouse.down();
    await page.waitForTimeout(120);
    const transform = await button.evaluate(
      (el) => window.getComputedStyle(el).transform,
    );
    await page.mouse.up();
    expect(transform).not.toBe("none");
  });
});
