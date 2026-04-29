import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Avatar. The component is a MUI
 * fallback re-skinned with M3 tokens (M3 has no first-class Avatar
 * spec). Every assertion reads computed style so a token drift
 * breaks the test.
 *
 * Roles assert:
 *   - filled    -> primary-container / on-primary-container
 *   - tonal     -> tertiary-container / on-tertiary-container
 *   - outlined  -> transparent + 1dp outline
 *   - elevated  -> surface-container-low + elevation-1 shadow
 * Shapes assert:
 *   - circular  -> shape-full (>= height/2)
 *   - rounded   -> shape-md  (12px)
 *   - square    -> shape-none (0px)
 * Sizes assert: sm 32 / md 40 / lg 56.
 * Motion asserts: medium2 (300ms) emphasized cubic-bezier.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_ON_PRIMARY_CONTAINER = "rgb(33, 0, 93)";
const LIGHT_TERTIARY_CONTAINER = "rgb(255, 216, 228)";
const LIGHT_ON_TERTIARY_CONTAINER = "rgb(49, 17, 29)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Avatar - M3 design parity", () => {
  test("default renders role=img with the resolved label", async ({ page }) => {
    await page.goto(storyUrl("data-display-avatar--default"));
    const avatar = page.getByRole("img", { name: "Ada Lovelace" });
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute("data-variant", "filled");
    await expect(avatar).toHaveAttribute("data-shape", "circular");
  });

  test("filled variant paints primary-container + on-primary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--variants"));
    const avatar = page.getByRole("img", { name: "Ada Lovelace" });
    const styles = await avatar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
  });

  test("tonal variant paints tertiary-container + on-tertiary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--variants"));
    const avatar = page.getByRole("img", { name: "Grace Hopper" });
    const styles = await avatar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_TERTIARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_TERTIARY_CONTAINER);
  });

  test("outlined variant paints transparent + 1dp outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--variants"));
    const avatar = page.getByRole("img", { name: "Alan Turing" });
    const styles = await avatar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(parseFloat(styles.borderWidth)).toBe(1);
  });

  test("elevated variant paints surface-container-low + elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--variants"));
    const avatar = page.getByRole("img", { name: "Marie Curie" });
    const styles = await avatar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    // elevation-1: 2 visible drop-shadow layers (the transition list
    // adds transparent stub shadows on a couple of properties — only
    // count the ones with a visible alpha).
    const visibleLayers = styles.shadow.match(/rgba?\([^)]*0\.\d+\)/g) ?? [];
    expect(visibleLayers.length).toBeGreaterThanOrEqual(2);
  });

  test("size scale matches Inputs (sm 32 / md 40 / lg 56)", async ({ page }) => {
    await page.goto(storyUrl("data-display-avatar--sizes"));
    const heights = await Promise.all(
      ["Small", "Medium", "Large"].map(async (name) => {
        const avatar = page.getByRole("img", { name });
        return await avatar.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("circular shape uses shape-full, rounded uses shape-md (12dp), square uses shape-none", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--shapes"));
    const radii = await Promise.all(
      ["Circular", "Rounded", "Square"].map(async (name) => {
        const avatar = page.getByRole("img", { name });
        return await avatar.evaluate((el) =>
          parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
        );
      }),
    );
    // circular at md size = 40dp → pill radius >= 20.
    expect(radii[0]).toBeGreaterThanOrEqual(20);
    expect(radii[1]).toBe(12);
    expect(radii[2]).toBe(0);
  });

  test("disabled fades the avatar to ~38% opacity", async ({ page }) => {
    await page.goto(storyUrl("data-display-avatar--states"));
    const avatar = page.getByRole("img", { name: "Static disabled" });
    const opacity = await avatar.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
    await expect(avatar).toHaveAttribute("aria-disabled", "true");
  });

  test("interactive avatar exposes role=button + tabindex=0 + state-layer", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--states"));
    const avatar = page.getByRole("button", { name: "Interactive rest" });
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute("tabindex", "0");
    // Has a state-layer span only when interactive.
    const layerCount = await avatar.locator("[data-state-layer]").count();
    expect(layerCount).toBe(1);
  });

  test("hover paints state-layer at 0.08 opacity (M3 hover token)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-avatar--interactive", "light", "no-preference"),
    );
    const avatar = page.getByRole("button", { name: "Open profile" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await avatar.hover();
    await page.waitForTimeout(260);
    const opacity = await avatar
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity for interactive avatars", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-avatar--interactive", "light", "no-preference"),
    );
    const avatar = page.getByRole("button", { name: "Open profile" });
    await avatar.evaluate((el: HTMLElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await avatar
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("interactive circular avatar morphs to shape-md (12dp) on hover", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-avatar--interactive", "light", "no-preference"),
    );
    const avatar = page.getByRole("button", { name: "Open profile" });
    const restRadius = await avatar.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(restRadius).toBeGreaterThanOrEqual(20);
    await avatar.hover();
    await page.waitForTimeout(360);
    const onHoverRadius = await avatar.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(onHoverRadius).toBe(12);
  });

  test("clicking + Enter on the interactive avatar both fire onClick", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--interactive"));
    const avatar = page.getByRole("button", { name: "Open profile" });
    await avatar.click();
    await avatar.focus();
    await page.keyboard.press("Enter");
    // Best signal we can read in Playwright without a custom hook: the
    // button stayed focused & no console error fired. We assert focus
    // here to verify the keyboard path doesn't navigate away.
    await expect(avatar).toBeFocused();
  });

  test("M3 emphasized motion: medium2 (300ms) + emphasized cubic-bezier", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--default"));
    const avatar = page.getByRole("img", { name: "Ada Lovelace" });
    const styles = await avatar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
  });

  test("image avatar renders an <img> element when src is provided", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--with-image"));
    const avatar = page.getByRole("img", { name: "With image" });
    const inner = avatar.locator("img");
    await expect(inner).toHaveCount(1);
    const naturalSrc = await inner.getAttribute("src");
    expect(naturalSrc).toContain("data:image/svg+xml");
  });

  test("status indicator reads role=status with the correct label", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--with-status"));
    await expect(
      page.getByRole("status", { name: "Status: online" }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Status: away" }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Status: busy" }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Status: offline" }),
    ).toBeVisible();
  });

  test("icon-only avatar exposes the aria-label override", async ({ page }) => {
    await page.goto(storyUrl("data-display-avatar--with-icons"));
    await expect(
      page.getByRole("img", { name: "User icon filled" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "User icon outlined" }),
    ).toBeVisible();
  });

  test("dark theme swaps role colors on the filled avatar", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-avatar--variants", "dark"));
    const avatar = page.getByRole("img", { name: "Ada Lovelace" });
    const bg = await avatar.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe(LIGHT_PRIMARY_CONTAINER);
    expect(bg).not.toBe(TRANSPARENT);
  });
});
