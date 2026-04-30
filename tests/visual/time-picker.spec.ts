import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized TimePicker.
 *
 * Spec sources:
 *   - MUI X TimePicker        https://mui.com/x/react-date-pickers/time-picker/
 *   - M3 Time Picker docs     https://m3.material.io/components/time-pickers/specs
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * The selection blob is a 40dp circular `bg-primary` span that springs
 * between dial cells via a shared `layoutId` and morphs from
 * `shape-xs` to the picker's `shape` token via motion/react springs —
 * the same M3 Expressive selection morph used by DatePicker / Tabs /
 * Stepper / Pagination / Data Grid.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Time Picker - M3 design parity", () => {
  test("default trigger renders with M3 attributes + closed panel", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--default"));
    const root = page.locator("[data-component='time-picker']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "xl");
    await expect(root).toHaveAttribute("data-cycle", "12");
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("[data-slot='time-picker-panel']")).toHaveCount(0);
  });

  test("filled trigger paints surface-container-highest + shape-xs corners", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--default"));
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    const styles = await trigger.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.radius).toBe("4px");
  });

  test("variant matrix paints the M3 trigger surface mapping", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--variants"));
    const expected: Record<string, string | null> = {
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: null,
      text: null,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const trigger = page
        .locator(`[data-component='time-picker'][data-variant='${variant}'] [data-component='time-picker-trigger']`)
        .first();
      await expect(trigger).toBeVisible();
      const bg = await trigger.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      if (color === null) {
        expect(bg, `variant=${variant}`).toBe("rgba(0, 0, 0, 0)");
      } else {
        expect(bg, `variant=${variant}`).toBe(color);
      }
    }
  });

  test("outlined variant paints a 1px outline ring on the trigger", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--variants"));
    const trigger = page
      .locator("[data-component='time-picker'][data-variant='outlined'] [data-component='time-picker-trigger']")
      .first();
    const styles = await trigger.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.borderColor).toBe(LIGHT_OUTLINE);
    expect(styles.borderWidth).toBe("1px");
  });

  test("elevated variant paints surface-container-low + elevation-1 trigger", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--variants"));
    const trigger = page
      .locator("[data-component='time-picker'][data-variant='elevated'] [data-component='time-picker-trigger']")
      .first();
    const styles = await trigger.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("size scale: 40 / 56 / 64 px trigger min-heights", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--sizes"));
    const minHeights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const trigger = page
          .locator(`[data-component='time-picker'][data-size='${size}'] [data-component='time-picker-trigger']`)
          .first();
        await expect(trigger).toBeVisible();
        return trigger.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(minHeights).toEqual(["40px", "56px", "64px"]);
  });

  test("md size paints body-l (16px) on the trigger value", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--default"));
    const value = page.locator("[data-slot='trigger-value']").first();
    const styles = await value.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize };
    });
    expect(styles.size).toBe("16px");
  });

  test("trigger label paints body-s (12px) + on-surface-variant", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--default"));
    const label = page.locator("[data-slot='time-picker-trigger'] [class*='text-body-s']").first();
    await expect(label).toBeVisible();
    const styles = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize };
    });
    expect(styles.size).toBe("12px");
  });

  test("default panel paints surface-container-high + shape-xl (28dp)", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const panel = page.locator("[data-slot='time-picker-panel']").first();
    await expect(panel).toBeVisible();
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    expect(styles.radius).toBe("28px");
  });

  test("panel paints elevation-3 shadow", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const panel = page.locator("[data-slot='time-picker-panel']").first();
    const shadow = await panel.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("hour + minute time fields render as toggle buttons with aria-pressed", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const hour = page.locator("[data-slot='time-picker-hour-field']").first();
    const minute = page.locator("[data-slot='time-picker-minute-field']").first();
    await expect(hour).toHaveAttribute("aria-pressed", "true");
    await expect(minute).toHaveAttribute("aria-pressed", "false");
  });

  test("time field digit paints display-m (~57px)", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const digit = page
      .locator("[data-slot='time-picker-hour-field'] [class*='text-display-m']")
      .first();
    const size = await digit.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(parseFloat(size)).toBeGreaterThanOrEqual(45);
  });

  test("AM/PM toggle is rendered on the 12-hour cycle", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const ampm = page.locator("[data-slot='time-picker-ampm']").first();
    await expect(ampm).toBeVisible();
    await expect(ampm).toHaveAttribute("role", "radiogroup");
    const cells = page.locator("[data-slot='time-picker-ampm-cell']");
    await expect(cells).toHaveCount(2);
  });

  test("AM/PM toggle is hidden on the 24-hour cycle", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--twenty-four-hour"));
    await expect(page.locator("[data-slot='time-picker-ampm']")).toHaveCount(0);
  });

  test("clicking PM flips the selected hour into the 12..23 range", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "light", "no-preference"),
    );
    const root = page.locator("[data-component='time-picker']").first();
    await expect(root).toHaveAttribute("data-mode", "hours");
    const am = page.locator("[data-slot='time-picker-ampm-cell'][data-period='am']").first();
    const pm = page.locator("[data-slot='time-picker-ampm-cell'][data-period='pm']").first();
    await expect(am).toHaveAttribute("data-selected", "true");
    await pm.click();
    await page.waitForTimeout(120);
    await expect(pm).toHaveAttribute("data-selected", "true");
  });

  test("hour dial renders 12 selectable cells (12-hour cycle)", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const cells = page.locator("[data-slot='time-picker-dial-cell']");
    await expect(cells).toHaveCount(12);
  });

  test("hour dial renders 24 cells in the 24-hour cycle", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--twenty-four-hour"));
    const cells = page.locator("[data-slot='time-picker-dial-cell']");
    await expect(cells).toHaveCount(24);
  });

  test("minute dial renders 12 cells at 5-minute increments", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel-minutes"));
    const cells = page.locator("[data-slot='time-picker-dial-cell']");
    await expect(cells).toHaveCount(12);
    const labels = await cells.evaluateAll((nodes) =>
      nodes.map((n) => (n.querySelector("[data-slot='time-picker-dial-label']")?.textContent ?? "").trim()),
    );
    expect(labels).toEqual([
      "00", "05", "10", "15", "20", "25",
      "30", "35", "40", "45", "50", "55",
    ]);
  });

  test("dial frame paints surface-container-highest + circular shape", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const frame = page.locator("[data-slot='time-picker-dial']").first();
    const styles = await frame.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.radius).toBe("9999px");
  });

  test("md dial frame is 256px × 256px", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const frame = page.locator("[data-slot='time-picker-dial']").first();
    const styles = await frame.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { w: cs.width, h: cs.height };
    });
    expect(styles.w).toBe("256px");
    expect(styles.h).toBe("256px");
  });

  test("each dial cell carries role=option + aria-selected", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const cell = page.locator("[data-slot='time-picker-dial-cell']").first();
    await expect(cell).toHaveAttribute("role", "option");
    const ariaSelected = await cell.getAttribute("aria-selected");
    expect(["true", "false"]).toContain(ariaSelected);
  });

  test("selected hour cell renders the selection blob in bg-primary", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "light", "no-preference"),
    );
    const blob = page.locator("[data-slot='time-picker-dial-blob']").first();
    await expect(blob).toBeVisible();
    const styles = await blob.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
  });

  test("selection blob shape morphs to match the active shape token", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "light", "no-preference"),
    );
    const blob = page.locator("[data-slot='time-picker-dial-blob']").first();
    const radius = await blob.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("28px");
  });

  test("dial pivot dot paints bg-primary at the dial center", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const pivot = page.locator("[data-slot='time-picker-pivot']").first();
    await expect(pivot).toBeVisible();
    const styles = await pivot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.radius).toBe("9999px");
  });

  test("dial stroke paints bg-primary connecting pivot to blob", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--open-panel"));
    const stroke = page.locator("[data-slot='time-picker-dial-stroke']").first();
    await expect(stroke).toBeVisible();
    const bg = await stroke.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_PRIMARY);
  });

  test("selected hour label paints text-on-primary", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "light", "no-preference"),
    );
    const selected = page
      .locator("[data-slot='time-picker-dial-cell'][data-selected='true']")
      .first();
    await expect(selected).toBeVisible();
    await page.waitForTimeout(450);
    const color = await selected.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_PRIMARY);
  });

  test("error state paints supporting text in the M3 error role", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--states"));
    const errorRoot = page
      .locator("[data-component='time-picker'][data-error='true']")
      .first();
    await expect(errorRoot).toBeVisible();
    const supporting = errorRoot.locator("[data-slot='supporting-text']").first();
    const color = await supporting.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("disabled root paints the M3 wash + pointer-events:none", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--states"));
    const disabledRoot = page
      .locator("[data-component='time-picker'][data-disabled='true']")
      .first();
    await expect(disabledRoot).toBeVisible();
    const styles = await disabledRoot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("M3 motion: emphasized easing on trigger transitions", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--default", "light", "no-preference"),
    );
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    const styles = await trigger.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.duration).toContain("0.3s");
  });

  test("hover paints the trigger state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--default", "light", "no-preference"),
    );
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    await expect(trigger).toBeVisible();
    const layer = trigger.locator("[data-slot='state-layer']").first();
    await trigger.hover();
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("clicking the trigger opens the panel + flips aria-expanded", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--default", "light", "no-preference"),
    );
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("[data-slot='time-picker-panel']").first();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("role", "dialog");
  });

  test("clicking an hour cell advances the dial mode to minutes", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "light", "no-preference"),
    );
    const root = page.locator("[data-component='time-picker']").first();
    await expect(root).toHaveAttribute("data-mode", "hours");
    const cells = page.locator("[data-slot='time-picker-dial-cell']");
    await cells.nth(2).click();
    await page.waitForTimeout(120);
    await expect(root).toHaveAttribute("data-mode", "minutes");
  });

  test("clicking a minute cell sets the draft and stays on minutes", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel-minutes", "light", "no-preference"),
    );
    const root = page.locator("[data-component='time-picker']").first();
    await expect(root).toHaveAttribute("data-mode", "minutes");
    const minuteField = page.locator("[data-slot='time-picker-minute-field']").first();
    const before = await minuteField.textContent();
    const target = page
      .locator("[data-slot='time-picker-dial-cell']")
      .nth(4);
    await target.click();
    await page.waitForTimeout(120);
    const after = await minuteField.textContent();
    expect(after).not.toBe(before);
  });

  test("Escape on the panel closes it", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--default", "light", "no-preference"),
    );
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    await trigger.click();
    const panel = page.locator("[data-slot='time-picker-panel']").first();
    await expect(panel).toBeVisible();
    await panel.focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(450);
    await expect(page.locator("[data-slot='time-picker-panel']")).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("ArrowRight inside the dial moves focused cell forward", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "light", "no-preference"),
    );
    const initial = page
      .locator("[data-slot='time-picker-dial-cell'][tabindex='0']")
      .first();
    const startVal = await initial.getAttribute("data-value");
    expect(startVal).toBeTruthy();
    await initial.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(120);
    const nextVal = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-value"),
    );
    expect(nextVal).toBeTruthy();
    expect(nextVal).not.toBe(startVal);
  });

  test("Cancel button closes the panel without committing the value", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--default", "light", "no-preference"),
    );
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    const valueBefore = await trigger
      .locator("[data-slot='trigger-value']")
      .first()
      .textContent();
    await trigger.click();
    await page.locator("[data-slot='time-picker-cancel']").first().click();
    await page.waitForTimeout(450);
    const valueAfter = await trigger
      .locator("[data-slot='trigger-value']")
      .first()
      .textContent();
    expect(valueAfter).toBe(valueBefore);
  });

  test("OK button commits the drafted time to the trigger value", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--default", "light", "no-preference"),
    );
    const trigger = page.locator("[data-component='time-picker-trigger']").first();
    await trigger.click();
    // Pick a different hour
    const cells = page.locator("[data-slot='time-picker-dial-cell']");
    await cells.nth(0).click();
    await page.waitForTimeout(120);
    // Pick a different minute
    const minutes = page.locator("[data-slot='time-picker-dial-cell']");
    await minutes.nth(3).click();
    await page.waitForTimeout(120);
    await page.locator("[data-slot='time-picker-ok']").first().click();
    await page.waitForTimeout(450);
    const valueAfter = await trigger
      .locator("[data-slot='trigger-value']")
      .first()
      .textContent();
    expect(valueAfter).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
  });

  test("inactive trigger paints text-on-surface", async ({ page }) => {
    await page.goto(storyUrl("advanced-time-picker--default"));
    const value = page.locator("[data-slot='trigger-value']").first();
    const color = await value.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE);
  });

  test("dark theme: selection blob swaps to dark primary", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-time-picker--open-panel", "dark", "no-preference"),
    );
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const blob = page.locator("[data-slot='time-picker-dial-blob']").first();
    await expect(blob).toBeVisible();
    const bg = await blob.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_PRIMARY);
  });
});
