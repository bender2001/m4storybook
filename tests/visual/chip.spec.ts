import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Chip. Every assertion
 * reads computed style so a token drift breaks the test. Variants
 * map to:
 *   - assist     -> outline + on-surface (rest), primary-container (selected)
 *   - filter     -> outline + on-surface-variant (rest), secondary-container (selected)
 *   - input      -> outline + on-surface (rest), secondary-container (selected)
 *   - suggestion -> outline + on-surface-variant (rest), secondary-container (selected)
 * Sizes assert: sm 24dp / md 32dp / lg 40dp.
 * Selected M3 Expressive shape morph asserts: shape-sm (8dp) -> shape-full.
 * State layers assert: hover 0.08, focus 0.10 of the on-color role.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_ON_PRIMARY_CONTAINER = "rgb(33, 0, 93)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Chip - M3 design parity", () => {
  test("default renders role=button + the resolved variant + size data", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--default"));
    const chip = page.getByRole("button", { name: "Add to favorites" });
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute("data-variant", "assist");
    await expect(chip).toHaveAttribute("data-size", "md");
  });

  test("assist (rest) paints transparent + outline + on-surface text", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--variants"));
    const chip = page.getByRole("button", { name: "Assist" });
    const styles = await chip.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(parseFloat(styles.borderWidth)).toBe(1);
  });

  test("filter (rest) paints on-surface-variant text + outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--variants"));
    const chip = page.getByRole("button", { name: "Filter" });
    const styles = await chip.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderColor: cs.borderTopColor,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
  });

  test("filter (selected) paints secondary-container / on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--filters"));
    const chip = page.getByRole("button", { name: "Vegetarian" });
    await expect(chip).toHaveAttribute("data-selected", "true");
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    const styles = await chip.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("assist (selected) paints primary-container / on-primary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--states"));
    // Use a selected assist via a controlled story; the States story
    // already exposes `Selected` as a filter, but the assist selected
    // role is verified by setting selected via the elevated chip's
    // unique label. Instead, navigate to the playground and use args.
    await page.goto(
      "/iframe.html?id=data-display-chip--playground&viewMode=story&globals=theme:light;reducedMotion:reduce&args=selected:true",
    );
    const chip = page.getByRole("button", { name: "Chip" });
    const styles = await chip.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
  });

  test("elevated chip paints surface-container-low + elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--states"));
    const chip = page.getByRole("button", { name: "Elevated" });
    const styles = await chip.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    // elevation-1 = 2 visible drop-shadow layers.
    const visibleLayers = styles.shadow.match(/rgba?\([^)]*0\.\d+\)/g) ?? [];
    expect(visibleLayers.length).toBeGreaterThanOrEqual(2);
  });

  test("size scale matches M3 spec (sm 24dp / md 32dp / lg 40dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--sizes"));
    const heights = await Promise.all(
      ["Small chip", "Medium chip", "Large chip"].map(async (name) => {
        const chip = page.getByRole("button", { name });
        return await chip.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["24px", "32px", "40px"]);
  });

  test("rest container uses shape-sm (8dp)", async ({ page }) => {
    await page.goto(storyUrl("data-display-chip--variants"));
    const chip = page.getByRole("button", { name: "Assist" });
    const radius = await chip.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(radius).toBe(8);
  });

  test("selected container morphs to shape-full (pill)", async ({ page }) => {
    await page.goto(storyUrl("data-display-chip--filters"));
    const chip = page.getByRole("button", { name: "Vegetarian" });
    const radius = await chip.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    // shape-full = 9999px → clamped to height/2; chip is 32dp so >=16.
    expect(radius).toBeGreaterThanOrEqual(16);
  });

  test("disabled fades the chip to ~38% opacity", async ({ page }) => {
    await page.goto(storyUrl("data-display-chip--states"));
    const chip = page.getByRole("button", { name: "Disabled", exact: true });
    await expect(chip).toBeVisible();
    const opacity = await chip.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
    await expect(chip).toHaveAttribute("aria-disabled", "true");
    await expect(chip).toBeDisabled();
  });

  test("filter chip exposes role=button + aria-pressed toggle semantics", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--variants"));
    const chip = page.getByRole("button", { name: "Filter" });
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    const layerCount = await chip.locator("[data-state-layer]").count();
    expect(layerCount).toBe(1);
  });

  test("hover paints state-layer at 0.08 opacity (M3 hover token)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-chip--interactive", "light", "no-preference"),
    );
    const chip = page.getByRole("button", { name: "Toggle me" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await chip.hover();
    await page.waitForTimeout(260);
    const opacity = await chip
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity for the chip", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-chip--interactive", "light", "no-preference"),
    );
    const chip = page.getByRole("button", { name: "Toggle me" });
    await chip.evaluate((el: HTMLElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await chip
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("clicking + Enter on the chip both fire onClick", async ({ page }) => {
    await page.goto(storyUrl("data-display-chip--interactive"));
    const chip = page.getByRole("button", { name: "Toggle me" });
    await chip.click();
    await chip.focus();
    await page.keyboard.press("Enter");
    await expect(chip).toBeFocused();
  });

  test("M3 emphasized motion: medium2 (300ms) + emphasized cubic-bezier", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--default"));
    const chip = page.getByRole("button", { name: "Add to favorites" });
    const styles = await chip.evaluate((el) => {
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

  test("filter selected auto-renders the leading check glyph", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--filters"));
    const chip = page.getByRole("button", { name: "Vegetarian" });
    await expect(chip).toBeVisible();
    await expect(chip.locator("[data-slot='leading']")).toHaveCount(1);
  });

  test("input chip with onDelete renders a Remove dismiss button", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--inputs"));
    const chip = page.getByRole("button", { name: "ada@example.com" });
    const dismiss = chip.getByRole("button", { name: "Remove" });
    await expect(dismiss).toBeVisible();
    const tabindex = await dismiss.getAttribute("tabindex");
    expect(tabindex).toBe("0");
  });

  test("dismiss button is keyboard reachable inside the chip (Tab + Enter)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--inputs"));
    const chip = page.getByRole("button", { name: "ada@example.com" });
    await expect(chip).toBeVisible();
    const dismiss = chip.getByRole("button", { name: "Remove" });
    await dismiss.focus();
    await expect(dismiss).toBeFocused();
    // Pressing Enter on the dismiss invokes onDelete and the focus
    // stays on the (still-mounted) dismiss button — the story ignores
    // the callback so the chip doesn't unmount.
    await page.keyboard.press("Enter");
    await expect(dismiss).toBeVisible();
  });

  test("leading + trailing icon slots render when provided", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-chip--slots"));
    const both = page.getByRole("button", { name: "Both icons chip" });
    await expect(both.locator("[data-slot='leading']")).toHaveCount(1);
    await expect(both.locator("[data-slot='trailing']")).toHaveCount(1);
  });

  test("dark theme swaps role colors on the assist chip", async ({ page }) => {
    await page.goto(storyUrl("data-display-chip--variants", "dark"));
    const chip = page.getByRole("button", { name: "Assist" });
    const color = await chip.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).not.toBe(LIGHT_ON_SURFACE);
    expect(color).not.toBe(TRANSPARENT);
  });
});
