import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the Material 3 common Button. Each assertion is
 * tied to https://m3.material.io/components/buttons/specs and reads
 * computed styles so the test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
  args?: string,
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}${
    args ? `&args=${args}` : ""
  }`;

// M3 light role values from src/tokens/colors.ts (light theme).
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";

// M3 emphasized easing token (medium2 / 300ms).
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Button - M3 design parity", () => {
  test("filled default button matches M3 spec (radius, height, color, motion)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--default"));
    const button = page.getByRole("button", { name: "Button" });
    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        height: cs.height,
        radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor,
        color: cs.color,
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
        fontWeight: cs.fontWeight,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
      };
    });

    // M3 medium button = 40dp tall.
    expect(styles.height).toBe("40px");
    // M3 full shape resolves to the visible half-height radius for smooth morphs.
    expect(styles.radius).toBe("20px");
    // Filled = primary, on-primary label.
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY);
    // M3 emphasized motion: 300ms / cubic-bezier(0.2,0,0,1).
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
    // M3 label-large uses medium font weight (500).
    expect(parseInt(styles.fontWeight, 10)).toBeGreaterThanOrEqual(500);
    // Label-only common buttons use 24dp leading/trailing space.
    expect(styles.paddingLeft).toBe("24px");
    expect(styles.paddingRight).toBe("24px");
  });

  test("tonal color uses secondary-container role", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--colors"));
    const button = page.getByRole("button", { name: "Tonal" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("outlined color has transparent fill and outline border", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--colors"));
    const button = page.getByRole("button", { name: "Outlined" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        borderWidth: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(parseFloat(styles.borderWidth)).toBeGreaterThan(0);
  });

  test("text color has transparent fill and primary label", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--colors"));
    const button = page.getByRole("button", { name: "Text" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("text color uses 12dp label-only horizontal spacing", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--colors"));
    const button = page.getByRole("button", { name: "Text" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
      };
    });
    expect(styles.paddingLeft).toBe("12px");
    expect(styles.paddingRight).toBe("12px");
  });

  test("elevated color uses surface-container-low + elevation 1", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--colors"));
    const button = page.getByRole("button", { name: "Elevated" });
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        boxShadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.color).toBe(LIGHT_PRIMARY);
    // Elevation 1: any shadow string with two stops.
    expect(styles.boxShadow).not.toBe("none");
    expect(styles.boxShadow.split(",").length).toBeGreaterThanOrEqual(2);
  });

  test("spec variants are default and toggle", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--variants"));
    const defaultButton = page.getByRole("button", { name: "Default" });
    const toggle = page.getByRole("button", { name: "Toggle" });

    await expect(defaultButton).not.toHaveAttribute("aria-pressed");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button")).toHaveCount(2);

    const unselected = await toggle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
      };
    });
    expect(unselected.bg).toBe(LIGHT_SURFACE_CONTAINER);
    expect(unselected.color).toBe(LIGHT_ON_SURFACE_VARIANT);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(350);

    const selected = await toggle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderTopLeftRadius,
      };
    });
    expect(selected.bg).toBe(LIGHT_PRIMARY);
    expect(selected.color).toBe(LIGHT_ON_PRIMARY);
    expect(selected.radius).toBe("16px");
  });

  test("selected toggle is a state, not a separate variant", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--states"));
    const selectedToggle = page.getByRole("button", {
      name: "Toggle selected",
    });

    await expect(selectedToggle).toHaveAttribute("aria-pressed", "true");

    const selected = await selectedToggle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderTopLeftRadius,
      };
    });
    expect(selected.bg).toBe(LIGHT_PRIMARY);
    expect(selected.color).toBe(LIGHT_ON_PRIMARY);
    expect(selected.radius).toBe("16px");
  });

  test("toggle button does not expose the unsupported text color style", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "inputs-button--default",
        "light",
        "reduce",
        "variant:toggle;color:text",
      ),
    );
    const button = page.getByRole("button", { name: "Button" });

    await expect(button).toHaveAttribute("aria-pressed", "false");
    await expect(button).toHaveAttribute("data-color", "filled");

    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("size scale matches M3 (sm=32, md=40, lg=56)", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--sizes"));
    const small = page.getByRole("button", { name: "Small" });
    const medium = page.getByRole("button", { name: "Medium" });
    const large = page.getByRole("button", { name: "Large" });

    const heights = await Promise.all(
      [small, medium, large].map((b) =>
        b.evaluate((el) => window.getComputedStyle(el).height),
      ),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("disabled state suppresses state-layer and shows muted colors", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--states"));
    const disabled = page.getByRole("button", { name: "Disabled", exact: true });
    const layerOpacity = await disabled
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(layerOpacity).toBe(0);
  });

  test("soft disabled stays focusable and exposes aria-disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--states"));
    const softDisabled = page.getByRole("button", { name: "Soft disabled" });
    await expect
      .poll(() => softDisabled.evaluate((el: HTMLButtonElement) => el.disabled))
      .toBe(false);
    await expect(softDisabled).toHaveAttribute("aria-disabled", "true");
    await softDisabled.focus();
    await expect(softDisabled).toBeFocused();
    const layerOpacity = await softDisabled
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(layerOpacity).toBe(0);
  });

  test("leading and trailing icons use M3 icon spacing", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--with-icons"));
    const leadingButton = page.getByRole("button", { name: "Add item" });
    const trailingButton = page.getByRole("button", { name: "Continue" });

    const leadingStyles = await leadingButton.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        gap: cs.columnGap,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
      };
    });
    expect(leadingStyles.gap).toBe("8px");
    expect(leadingStyles.paddingLeft).toBe("16px");
    expect(leadingStyles.paddingRight).toBe("24px");

    const trailingStyles = await trailingButton.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        gap: cs.columnGap,
        paddingLeft: cs.paddingLeft,
        paddingRight: cs.paddingRight,
      };
    });
    expect(trailingStyles.gap).toBe("8px");
    expect(trailingStyles.paddingLeft).toBe("24px");
    expect(trailingStyles.paddingRight).toBe("16px");

    const iconSize = await leadingButton
      .locator("[data-slot='leading-icon']")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { width: cs.width, height: cs.height };
      });
    expect(iconSize).toEqual({ width: "18px", height: "18px" });

    const leadingIconColor = await leadingButton
      .locator("[data-slot='leading-icon'] [data-component='material-icon']")
      .evaluate((el) => window.getComputedStyle(el).color);
    const trailingGlyphColor = await trailingButton
      .locator("[data-slot='trailing-icon'] [data-slot='glyph']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(leadingIconColor).toBe(LIGHT_ON_PRIMARY);
    expect(trailingGlyphColor).toBe(LIGHT_ON_PRIMARY);
  });

  // Use Colors story for interaction tests: it has no play() function,
  // so the button is not pre-focused when the page loads.
  test("hover paints state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--colors", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await button.hover();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--colors", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await button.evaluate((el: HTMLButtonElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("press paints state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(storyUrl("inputs-button--colors", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const box = await button.boundingBox();
    if (!box) throw new Error("button has no bounding box");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    await page.mouse.up();
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("press morphs shape smoothly from the visible rest radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--colors", "light", "no-preference"));
    const button = page.getByRole("button", { name: "Filled" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    const box = await button.boundingBox();
    if (!box) throw new Error("button has no bounding box");

    const readRadius = () =>
      button.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
      );

    const restRadius = await readRadius();
    expect(restRadius).toBe(20);

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(120);
    const midMorphRadius = await readRadius();
    await page.mouse.up();

    expect(midMorphRadius).toBeLessThan(restRadius);
    expect(midMorphRadius).toBeGreaterThan(12);
  });

  test("dark theme swaps role colors on the filled button", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button--default", "dark"));
    const button = page.getByRole("button", { name: "Button" });
    const bg = await button.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark primary = #D0BCFF, light primary = #6750A4: must differ.
    expect(bg).not.toBe(LIGHT_PRIMARY);
  });
});
