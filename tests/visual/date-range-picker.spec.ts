import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized DateRangePicker.
 *
 * Spec sources:
 *   - MUI X DateRangePicker   https://mui.com/x/react-date-pickers/date-range-picker/
 *   - M3 Date Picker docs     https://m3.material.io/components/date-pickers/specs
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * The endpoint cursors are 40dp circular `bg-primary` spans that
 * spring between days via shared `layoutId` motion spans and morph
 * from `shape-xs` to the picker's `shape` token via motion/react
 * springs — the same M3 Expressive selection morph used by Tabs /
 * Stepper / Pagination / Date Picker / Data Grid. Days strictly
 * between the endpoints paint a continuous `primary-container`
 * range fill underlay.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_ON_PRIMARY_CONTAINER = "rgb(33, 0, 93)";
const LIGHT_SURFACE_CONTAINER_HIGH = "rgb(236, 230, 240)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Date Range Picker - M3 design parity", () => {
  test("default trigger renders with M3 attributes + closed panel", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--default"));
    const root = page.locator("[data-component='date-range-picker']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "xl");
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.locator("[data-slot='date-range-picker-panel']"),
    ).toHaveCount(0);
  });

  test("filled trigger paints surface-container-highest + shape-xs corners", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--default"));
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    const styles = await trigger.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.radius).toBe("4px");
  });

  test("variant matrix paints the M3 trigger surface mapping", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--variants"));
    const expected: Record<string, string | null> = {
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: null,
      text: null,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const trigger = page
        .locator(
          `[data-component='date-range-picker'][data-variant='${variant}'] [data-component='date-range-picker-trigger']`,
        )
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

  test("outlined variant paints a 1px outline ring on the trigger", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--variants"));
    const trigger = page
      .locator(
        "[data-component='date-range-picker'][data-variant='outlined'] [data-component='date-range-picker-trigger']",
      )
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

  test("elevated variant paints surface-container-low + elevation-1 trigger", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--variants"));
    const trigger = page
      .locator(
        "[data-component='date-range-picker'][data-variant='elevated'] [data-component='date-range-picker-trigger']",
      )
      .first();
    const styles = await trigger.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("size scale: 40 / 56 / 64 px trigger min-heights", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--sizes"));
    const minHeights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const trigger = page
          .locator(
            `[data-component='date-range-picker'][data-size='${size}'] [data-component='date-range-picker-trigger']`,
          )
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
    await page.goto(storyUrl("advanced-date-range-picker--default"));
    const value = page.locator("[data-slot='trigger-value']").first();
    const size = await value.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(size).toBe("16px");
  });

  test("trigger label paints body-s (12px) + on-surface-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--default"));
    const label = page
      .locator(
        "[data-slot='date-range-picker-trigger'] [class*='text-body-s']",
      )
      .first();
    await expect(label).toBeVisible();
    const size = await label.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(size).toBe("12px");
  });

  test("default panel paints surface-container-high + shape-xl (28dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const panel = page
      .locator("[data-slot='date-range-picker-panel']")
      .first();
    await expect(panel).toBeVisible();
    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, radius: cs.borderTopLeftRadius };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGH);
    expect(styles.radius).toBe("28px");
  });

  test("panel paints elevation-3 shadow", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const panel = page
      .locator("[data-slot='date-range-picker-panel']")
      .first();
    const shadow = await panel.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("panel headline paints headline-l (32px)", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const headline = page
      .locator("[data-slot='date-range-picker-headline']")
      .first();
    const size = await headline.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(size).toBe("32px");
  });

  test("shape scale renders the canonical M3 panel radii", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const panel = page
        .locator(
          `[data-slot='date-range-picker-panel'][data-shape='${shape}']`,
        )
        .first();
      const radius = await panel.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPanel = page
      .locator("[data-slot='date-range-picker-panel'][data-shape='full']")
      .first();
    const radius = await fullPanel.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("9999px");
  });

  test("error state paints supporting text in the M3 error role", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--states"));
    const errorRoot = page
      .locator("[data-component='date-range-picker'][data-error='true']")
      .first();
    await expect(errorRoot).toBeVisible();
    const supporting = errorRoot
      .locator("[data-slot='supporting-text']")
      .first();
    const color = await supporting.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("disabled root paints the M3 wash + pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--states"));
    const disabledRoot = page
      .locator("[data-component='date-range-picker'][data-disabled='true']")
      .first();
    await expect(disabledRoot).toBeVisible();
    const styles = await disabledRoot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("M3 motion: emphasized easing on trigger transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--default",
        "light",
        "no-preference",
      ),
    );
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
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

  test("hover paints the trigger state-layer at 0.08 opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--default",
        "light",
        "no-preference",
      ),
    );
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    await expect(trigger).toBeVisible();
    const layer = trigger.locator("[data-slot='state-layer']").first();
    await trigger.hover();
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("clicking the trigger opens the panel + flips aria-expanded", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--default",
        "light",
        "no-preference",
      ),
    );
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = page
      .locator("[data-slot='date-range-picker-panel']")
      .first();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("role", "dialog");
  });

  test("panel grid: 7 weekday headers + 42 day cells", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const weekdays = page.locator("[data-slot='weekday-cell']");
    await expect(weekdays).toHaveCount(7);
    const days = page.locator("[data-slot='date-range-picker-day']");
    await expect(days).toHaveCount(42);
  });

  test("each day cell carries role=gridcell + aria-label MMMM D, YYYY", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const day = page.locator("[data-slot='date-range-picker-day']").first();
    await expect(day).toHaveAttribute("role", "gridcell");
    const label = await day.getAttribute("aria-label");
    expect(label).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  });

  test("today cell carries aria-current=date", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-today"));
    const today = page
      .locator("[data-slot='date-range-picker-day'][data-today='true']")
      .first();
    await expect(today).toBeVisible();
    await expect(today).toHaveAttribute("aria-current", "date");
  });

  test("start endpoint carries data-start + aria-selected=true + paints on-primary label", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const start = page
      .locator("[data-slot='date-range-picker-day'][data-start='true']")
      .first();
    await expect(start).toBeVisible();
    await expect(start).toHaveAttribute("aria-selected", "true");
    const label = start.locator("[data-slot='day-label']").first();
    await page.waitForTimeout(450);
    const color = await label.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_PRIMARY);
  });

  test("end endpoint carries data-end + aria-selected=true", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const end = page
      .locator("[data-slot='date-range-picker-day'][data-end='true']")
      .first();
    await expect(end).toBeVisible();
    await expect(end).toHaveAttribute("aria-selected", "true");
  });

  test("in-range days paint the on-primary-container label color", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const between = page
      .locator(
        "[data-slot='date-range-picker-day'][data-in-range='true']",
      )
      .first();
    await expect(between).toBeVisible();
    await expect(between).toHaveAttribute("aria-selected", "true");
    const label = between.locator("[data-slot='day-label']").first();
    await page.waitForTimeout(350);
    const color = await label.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
  });

  test("range fill underlay paints primary-container", async ({ page }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const fill = page
      .locator("[data-slot='date-range-picker-range-fill']")
      .first();
    await expect(fill).toBeVisible();
    const bg = await fill.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_PRIMARY_CONTAINER);
  });

  test("endpoint cursors paint bg-primary at the day cell size", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    await page.waitForLoadState("networkidle");
    const cursors = page.locator(
      "[data-slot='date-range-picker-day-cursor']",
    );
    await cursors.first().waitFor({ state: "attached" });
    const count = await cursors.count();
    expect(count).toBeGreaterThanOrEqual(2);
    const bg = await cursors
      .first()
      .evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBe(LIGHT_PRIMARY);
  });

  test("endpoint cursor shape morphs to match active shape token", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const cursor = page
      .locator("[data-slot='date-range-picker-day-cursor']")
      .first();
    const radius = await cursor.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    // Default shape is `xl` (28dp) — endpoint cursors follow the picker
    // shape token, mirroring the Tabs / Stepper / Pagination morph.
    expect(radius).toBe("28px");
  });

  test("md day cells render at 40dp × 40dp", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const day = page.locator("[data-slot='date-range-picker-day']").first();
    const styles = await day.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { w: cs.width, h: cs.height };
    });
    expect(styles.w).toBe("40px");
    expect(styles.h).toBe("40px");
  });

  test("roving-tabindex: exactly one focusable day in the grid", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    await page
      .locator("[data-slot='date-range-picker-day']")
      .first()
      .waitFor({ state: "visible" });
    const days = page.locator("[data-slot='date-range-picker-day']");
    const count = await days.count();
    expect(count).toBeGreaterThan(0);
    const tabIndices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        days
          .nth(i)
          .evaluate((el) => (el as HTMLElement).getAttribute("tabindex")),
      ),
    );
    const focusable = tabIndices.filter((t) => t === "0").length;
    expect(focusable).toBe(1);
  });

  test("Escape on the panel closes it", async ({ page }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--default",
        "light",
        "no-preference",
      ),
    );
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    await trigger.click();
    const panel = page
      .locator("[data-slot='date-range-picker-panel']")
      .first();
    await expect(panel).toBeVisible();
    await panel.focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(450);
    await expect(
      page.locator("[data-slot='date-range-picker-panel']"),
    ).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("ArrowRight inside the panel moves focused day forward by 1", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const initial = page
      .locator("[data-slot='date-range-picker-day'][tabindex='0']")
      .first();
    const startKey = await initial.getAttribute("data-day");
    expect(startKey).toBeTruthy();
    await initial.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(120);
    const nextKey = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-day"),
    );
    expect(nextKey).toBeTruthy();
    expect(nextKey).not.toBe(startKey);
  });

  test("PageDown on the panel advances the visible month", async ({ page }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "light",
        "no-preference",
      ),
    );
    const monthLabel = page
      .locator("[data-slot='date-range-picker-month-label']")
      .first();
    const before = await monthLabel.textContent();
    const day = page
      .locator("[data-slot='date-range-picker-day'][tabindex='0']")
      .first();
    await day.focus();
    await page.keyboard.press("PageDown");
    await page.waitForTimeout(120);
    const after = await monthLabel.textContent();
    expect(after).not.toBe(before);
  });

  test("Next-month button advances the panel month label", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--open-panel"));
    const monthLabel = page
      .locator("[data-slot='date-range-picker-month-label']")
      .first();
    const before = await monthLabel.textContent();
    await page
      .locator("[data-slot='date-range-picker-next']")
      .first()
      .click();
    await page.waitForTimeout(120);
    const after = await monthLabel.textContent();
    expect(after).not.toBe(before);
  });

  test("Cancel button closes the panel without committing the value", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--default",
        "light",
        "no-preference",
      ),
    );
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    const valueBefore = await trigger
      .locator("[data-slot='trigger-value']")
      .first()
      .textContent();
    await trigger.click();
    const days = page.locator(
      "[data-slot='date-range-picker-day'][data-in-month='true']",
    );
    const altDay = days.last();
    await altDay.click();
    await page
      .locator("[data-slot='date-range-picker-cancel']")
      .first()
      .click();
    await page.waitForTimeout(450);
    const valueAfter = await trigger
      .locator("[data-slot='trigger-value']")
      .first()
      .textContent();
    expect(valueAfter).toBe(valueBefore);
  });

  test("OK commits the drafted range to the trigger value", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--default",
        "light",
        "no-preference",
      ),
    );
    const trigger = page
      .locator("[data-component='date-range-picker-trigger']")
      .first();
    await trigger.click();
    const days = page.locator(
      "[data-slot='date-range-picker-day'][data-in-month='true']",
    );
    const a = days.nth(0);
    const b = days.nth(5);
    const aLabel = await a.getAttribute("data-day");
    const bLabel = await b.getAttribute("data-day");
    await a.click();
    await b.click();
    await page
      .locator("[data-slot='date-range-picker-ok']")
      .first()
      .click();
    await page.waitForTimeout(450);
    const valueAfter = await trigger
      .locator("[data-slot='trigger-value']")
      .first()
      .textContent();
    expect(aLabel).toBeTruthy();
    expect(bLabel).toBeTruthy();
    if (aLabel && bLabel) {
      const [ay, am, ad] = aLabel.split("-");
      const [by, bm, bd] = bLabel.split("-");
      expect(valueAfter).toBe(
        `${am}/${ad}/${ay} – ${bm}/${bd}/${by}`,
      );
    }
  });

  test("inactive trigger paints text-on-surface", async ({ page }) => {
    await page.goto(storyUrl("advanced-date-range-picker--default"));
    const value = page.locator("[data-slot='trigger-value']").first();
    const color = await value.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE);
  });

  test("dark theme: endpoint cursor swaps to dark primary", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-date-range-picker--open-panel",
        "dark",
        "no-preference",
      ),
    );
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const cursor = page
      .locator("[data-slot='date-range-picker-day-cursor']")
      .first();
    await expect(cursor).toBeVisible();
    const bg = await cursor.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_PRIMARY);
  });
});
