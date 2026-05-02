import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Text Field. Specs at
 * https://m3.material.io/components/text-fields/specs. Every
 * assertion reads computed styles so the test fails the moment a
 * token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Text Field - M3 design parity", () => {
  test("renders an <input type='text'> wired to a label via htmlFor", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const input = page.locator("[data-textfield-input]");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "text");
    const id = await input.getAttribute("id");
    expect(id).toBeTruthy();
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      await expect(label).toHaveText("Email");
    }
  });

  test("filled variant paints surface-container-highest with a 1dp bottom indicator", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--variants"));
    const filled = page
      .locator("[data-textfield-field][data-variant='filled']")
      .first();
    const styles = await filled.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        bottomColor: cs.borderBottomColor,
        bottomWidth: cs.borderBottomWidth,
        topRadius: cs.borderTopLeftRadius,
        bottomRadius: cs.borderBottomLeftRadius,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.bottomColor).toBe(LIGHT_ON_SURFACE_VARIANT);
    expect(parseFloat(styles.bottomWidth)).toBe(1);
    // Filled tray: rounded top corners only (4dp), square bottom.
    expect(parseFloat(styles.topRadius)).toBe(4);
    expect(parseFloat(styles.bottomRadius)).toBe(0);
  });

  test("outlined variant paints transparent with a 1dp outline on all corners", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--variants"));
    const outlined = page
      .locator("[data-textfield-field][data-variant='outlined']")
      .first();
    const styles = await outlined.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
        radius: cs.borderTopLeftRadius,
      };
    });
    // Transparent tray.
    expect(styles.bg).toBe("rgba(0, 0, 0, 0)");
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(parseFloat(styles.borderWidth)).toBe(1);
    // M3 shape-xs = 4dp on all corners.
    expect(parseFloat(styles.radius)).toBe(4);
  });

  test("size scale heights match M3 (sm 40 / md 56 / lg 72)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--sizes"));
    const fields = page.locator("[data-textfield-field]");
    const heights: number[] = [];
    for (let i = 0; i < 3; i++) {
      const h = await fields
        .nth(i)
        .evaluate((el) => parseFloat(window.getComputedStyle(el).height));
      heights.push(h);
    }
    expect(heights).toEqual([40, 56, 72]);
  });

  test("focusing morphs the indicator to 2dp primary", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-text-field--default", "light", "no-preference"),
    );
    const input = page.locator("[data-textfield-input]");
    const field = page.locator("[data-textfield-field]").first();
    await input.focus();
    await page.waitForTimeout(350);
    const styles = await field.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bottomColor: cs.borderBottomColor,
        bottomWidth: cs.borderBottomWidth,
      };
    });
    expect(styles.bottomColor).toBe(LIGHT_PRIMARY);
    expect(parseFloat(styles.bottomWidth)).toBe(2);
  });

  test("hover paints the state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-text-field--default", "light", "no-preference"),
    );
    const field = page.locator("[data-textfield-field]").first();
    await field.hover();
    await page.waitForTimeout(260);
    const opacity = await field
      .locator("[data-textfield-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints the state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-text-field--default", "light", "no-preference"),
    );
    const input = page.locator("[data-textfield-input]");
    await input.focus();
    await page.waitForTimeout(260);
    const opacity = await page
      .locator("[data-textfield-state-layer]")
      .first()
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("disabled state suppresses interaction without fading the whole field", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--states"));
    // States story index 3 = disabled.
    const disabled = page
      .locator("[data-textfield-root][data-disabled]")
      .first();
    const field = disabled.locator("[data-textfield-field]");
    const fieldOpacity = await field.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(fieldOpacity).toBe(1);
    const inputOpacity = await disabled
      .locator("[data-textfield-input]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(inputOpacity).toBeCloseTo(0.38, 2);
    await expect(disabled.locator("[data-textfield-input]")).toBeDisabled();
  });

  test("error state swaps the indicator + label color to error", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--states"));
    const errored = page
      .locator("[data-textfield-root][data-error]")
      .first();
    const styles = await errored
      .locator("[data-textfield-field]")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          bottomColor: cs.borderBottomColor,
        };
      });
    expect(styles.bottomColor).toBe(LIGHT_ERROR);
    const label = errored.locator("[data-textfield-label]");
    const labelColor = await label.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(labelColor).toBe(LIGHT_ERROR);
    await expect(errored.locator("[data-textfield-input]")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("typing fires onChange + flips label to floating", async ({ page }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const input = page.locator("[data-textfield-input]");
    const label = page.locator("[data-textfield-label]").first();
    await expect(label).not.toHaveAttribute("data-floating", /.*/);
    await input.click();
    await input.fill("hello");
    await expect(input).toHaveValue("hello");
    await expect(label).toHaveAttribute("data-floating", "true");
  });

  test("filled floating label stays inside the tray at body-s", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--states"));
    const filledWithValue = page
      .locator("[data-textfield-root]")
      .filter({ hasText: "Filled with value" });
    const label = filledWithValue.locator("[data-textfield-label]");
    await expect(label).toHaveAttribute("data-floating", "true");
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        top: parseFloat(cs.top),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        background: cs.backgroundColor,
      };
    });
    expect(styles.top).toBeGreaterThanOrEqual(0);
    expect(styles.top).toBeLessThan(16);
    expect(styles.fontSize).toBe("12px");
    expect(styles.lineHeight).toBe("16px");
    expect(styles.background).toBe("rgba(0, 0, 0, 0)");
  });

  test("outlined floating label cuts through the top edge", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--with-icons"));
    const outlined = page
      .locator("[data-textfield-root][data-variant='outlined']")
      .filter({ hasText: "Dollar amount" });
    const label = outlined.locator("[data-textfield-label]");
    await expect(label).toHaveAttribute("data-floating", "true");
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        top: parseFloat(cs.top),
        fontSize: cs.fontSize,
        background: cs.backgroundColor,
      };
    });
    expect(styles.top).toBeLessThan(0);
    expect(styles.fontSize).toBe("12px");
    expect(styles.background).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("clicking the field tray focuses the input (M3 UX)", async ({ page }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const field = page.locator("[data-textfield-field]").first();
    const inputId = await page
      .locator("[data-textfield-input]")
      .first()
      .getAttribute("id");
    // Click in the right gutter where there is no input-on-top interception.
    const box = await field.boundingBox();
    if (!box) throw new Error("field bounding box missing");
    await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);
    const focusedInputId = await page.evaluate(
      () => (document.activeElement as HTMLInputElement | null)?.id ?? null,
    );
    expect(focusedInputId).toBe(inputId);
  });

  test("field motion uses M3 emphasized easing + medium2 (300ms)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const field = page.locator("[data-textfield-field]").first();
    const styles = await field.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        duration: cs.transitionDuration,
        ease: cs.transitionTimingFunction,
      };
    });
    const firstDuration = styles.duration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.ease).toContain(EASE_EMPHASIZED);
  });

  test("supporting text uses on-surface-variant, error text uses error", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--states"));
    const errored = page
      .locator("[data-textfield-root][data-error]")
      .first();
    const errorHelper = errored.locator("[data-textfield-helper]");
    const errorColor = await errorHelper.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(errorColor).toBe(LIGHT_ERROR);

    await page.goto(storyUrl("inputs-text-field--playground"));
    const helper = page.locator("[data-textfield-helper]").first();
    const color = await helper.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("body-l type role drives the input at md size", async ({ page }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const input = page.locator("[data-textfield-input]");
    const styles = await input.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
    });
    // body-l = 16px / 24px line-height.
    expect(styles.fontSize).toBe("16px");
    expect(styles.lineHeight).toBe("24px");
  });

  test("aria-describedby resolves to the helper text when present", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--playground"));
    const input = page.locator("[data-textfield-input]");
    const describedBy = await input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    if (describedBy) {
      const helper = page.locator(`[id="${describedBy.split(" ").pop()}"]`);
      await expect(helper).toContainText("controls panel");
    }
  });

  test("leading + trailing icon slots reserve space inside the field", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--with-icons"));
    const leading = page
      .locator("[data-textfield-leading-icon]")
      .first();
    await expect(leading).toBeVisible();
    const leadingBox = await leading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.width, height: cs.height };
    });
    // md size icon box = 24dp.
    expect(parseFloat(leadingBox.width)).toBe(24);
    expect(parseFloat(leadingBox.height)).toBe(24);

    const trailing = page
      .locator("[data-textfield-trailing-icon]")
      .first();
    await expect(trailing).toBeVisible();
  });

  test("prefix and suffix text render around the input value", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--with-icons"));
    const amount = page
      .locator("[data-textfield-root][data-variant='outlined']")
      .filter({ hasText: "Dollar amount" });
    await expect(amount.locator("[data-textfield-prefix]")).toHaveText("$");
    await expect(amount.locator("[data-textfield-suffix]")).toHaveText(".00");
    await expect(amount.locator("[data-textfield-input]")).toHaveValue("0");
  });

  test("placeholder forces the label into floating position", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--with-icons"));
    // First WithIcons row uses placeholder = "Type to search…".
    const root = page.locator("[data-textfield-root]").first();
    const label = root.locator("[data-textfield-label]");
    await expect(label).toHaveAttribute("data-floating", "true");
    const placeholderOpacity = await root
      .locator("[data-textfield-input]")
      .evaluate((el) =>
        window.getComputedStyle(el, "::placeholder").opacity,
      );
    expect(placeholderOpacity).toBe("1");
  });

  test("maxlength displays the Material character counter", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-text-field--playground"));
    const input = page.locator("[data-textfield-input]");
    const counter = page.locator("[data-textfield-counter]");
    await expect(counter).toHaveText("0 / 24");
    await input.fill("Material");
    await expect(counter).toHaveText("8 / 24");
  });

  test("dark theme swaps role colors on the filled tray", async ({ page }) => {
    await page.goto(storyUrl("inputs-text-field--default", "dark"));
    const field = page.locator("[data-textfield-field]").first();
    const bg = await field.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark surface-container-highest = #36343B = rgb(54, 52, 59).
    expect(bg).not.toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(bg).toBe("rgb(54, 52, 59)");
  });

  test("focus + blur preserve the entered value", async ({ page }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const input = page.locator("[data-textfield-input]");
    await input.focus();
    await input.fill("M3");
    await input.blur();
    await expect(input).toHaveValue("M3");
  });

  test("data-focused attribute toggles on focus + blur", async ({ page }) => {
    await page.goto(storyUrl("inputs-text-field--default"));
    const field = page.locator("[data-textfield-field]").first();
    const input = page.locator("[data-textfield-input]");
    await expect(field).not.toHaveAttribute("data-focused", /.*/);
    await input.focus();
    await expect(field).toHaveAttribute("data-focused", "true");
    await input.blur();
    await expect(field).not.toHaveAttribute("data-focused", /.*/);
  });
});
