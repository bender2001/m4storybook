import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized DataGrid.
 *
 * Spec sources:
 *   - MUI X DataGrid          https://mui.com/x/react-data-grid/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * Material 3 has no formal Data Grid spec, so the surface re-skins
 * MUI X DataGrid onto M3 tokens (per the project's "MUI fallback"
 * rule). The selection cursor (a 3dp leading bar painted in
 * `bg-primary` on the focused row) morphs from `shape-xs` to the
 * selected `shape` token via a shared `layoutId` motion span — the
 * same M3 Expressive selection morph used by Tabs / Stepper /
 * Pagination / Navigation Rail.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_SECONDARY = "rgb(98, 91, 113)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_PRIMARY = "rgb(208, 188, 255)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Data Grid - M3 design parity", () => {
  test("default grid renders role=grid + role=row + role=gridcell + role=columnheader", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const root = page.locator("[data-component='data-grid']").first();
    await expect(root).toBeVisible();
    await expect(root).toHaveAttribute("data-variant", "filled");
    await expect(root).toHaveAttribute("data-size", "md");
    await expect(root).toHaveAttribute("data-shape", "md");
    const grid = page.locator("[role='grid']").first();
    await expect(grid).toHaveAttribute("aria-rowcount", "6");
    await expect(grid).toHaveAttribute("aria-colcount", "5");
    const headers = page.locator("[role='columnheader']");
    await expect(headers).toHaveCount(5);
    const rows = page.locator("[data-component='data-grid-row']");
    await expect(rows).toHaveCount(5);
  });

  test("default story flags the seeded selected row via aria-selected=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const selected = page
      .locator("[data-component='data-grid-row'][data-selected='true']")
      .first();
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(selected).toHaveAttribute("data-state", "selected");
  });

  test("selected row paints secondary-container + on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const selectedRow = page
      .locator("[data-component='data-grid-row'][data-selected='true']")
      .first();
    const styles = await selectedRow.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("inactive row paints text-on-surface (default body color)", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const cell = page
      .locator(
        "[data-component='data-grid-row'][data-state='default'] [data-component='data-grid-cell']",
      )
      .first();
    const color = await cell.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE);
  });

  test("variant matrix paints the M3 wrapper surface mapping", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--variants"));
    const expected: Record<string, string | null> = {
      filled: null,
      tonal: LIGHT_SURFACE_CONTAINER,
      outlined: null,
      text: null,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const wrapper = page
        .locator(`[data-component='data-grid'][data-variant='${variant}']`)
        .first();
      await expect(wrapper).toBeVisible();
      const bg = await wrapper.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      if (color === null) {
        expect(bg, `variant=${variant}`).toBe("rgba(0, 0, 0, 0)");
      } else {
        expect(bg, `variant=${variant}`).toBe(color);
      }
    }
  });

  test("outlined variant paints a 1px outline-variant ring on the wrapper", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--variants"));
    const wrapper = page
      .locator("[data-component='data-grid'][data-variant='outlined']")
      .first();
    const styles = await wrapper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.borderWidth).toBe("1px");
  });

  test("elevated variant paints surface-container-low + elevation-1 host", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--variants"));
    const wrapper = page
      .locator("[data-component='data-grid'][data-variant='elevated']")
      .first();
    const styles = await wrapper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.3)");
  });

  test("size scale: 36 / 52 / 72 px row min-heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--sizes"));
    const minHeights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const row = page
          .locator(
            `[data-component='data-grid'][data-size='${size}'] [data-component='data-grid-row']`,
          )
          .first();
        await expect(row).toBeVisible();
        return row.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(minHeights).toEqual(["36px", "52px", "72px"]);
  });

  test("md size paints body-m (14px / 400) on cells", async ({ page }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const cell = page
      .locator(
        "[data-component='data-grid'][data-size='md'] [data-component='data-grid-row'] [data-component='data-grid-cell']",
      )
      .first();
    const styles = await cell.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize, weight: cs.fontWeight };
    });
    expect(styles.size).toBe("14px");
    expect(styles.weight).toBe("400");
  });

  test("column header paints title-s (14px / 500)", async ({ page }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const header = page.locator("[role='columnheader']").first();
    const styles = await header.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize, weight: cs.fontWeight };
    });
    expect(styles.size).toBe("14px");
    expect(styles.weight).toBe("500");
  });

  test("header row separates from body via 1px outline-variant divider", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const headerRow = page
      .locator("[data-component='data-grid-header']")
      .first();
    const styles = await headerRow.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderBottomColor,
        borderWidth: cs.borderBottomWidth,
      };
    });
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.borderWidth).toBe("1px");
  });

  test("body rows separate via 1px outline-variant dividers", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const row = page.locator("[data-component='data-grid-row']").first();
    const styles = await row.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderBottomColor,
        borderWidth: cs.borderBottomWidth,
      };
    });
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.borderWidth).toBe("1px");
  });

  test("default shape paints shape-md (12px) on the wrapper", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const wrapper = page.locator("[data-component='data-grid']").first();
    const radius = await wrapper.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
  });

  test("shape scale renders the canonical M3 wrapper radii", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const wrapper = page
        .locator(`[data-component='data-grid'][data-shape='${shape}']`)
        .first();
      const radius = await wrapper.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullWrapper = page
      .locator("[data-component='data-grid'][data-shape='full']")
      .first();
    const radius = await fullWrapper.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("9999px");
  });

  test("error row paints text-error on body cells", async ({ page }) => {
    await page.goto(storyUrl("advanced-data-grid--states"));
    const errorRow = page
      .locator("[data-component='data-grid-row'][data-error='true']")
      .first();
    await expect(errorRow).toBeVisible();
    const cell = errorRow.locator("[data-component='data-grid-cell']").first();
    const color = await cell.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("disabled grid: aria-disabled wash + opacity 0.38 + pointer-events:none", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--states"));
    const disabledRoot = page
      .locator("[data-component='data-grid'][data-disabled='true']")
      .first();
    await expect(disabledRoot).toBeVisible();
    const styles = await disabledRoot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("disabled row: data-disabled + aria-disabled + tabindex -1", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--states"));
    const disabledRow = page
      .locator("[data-component='data-grid-row'][data-disabled='true']")
      .first();
    await expect(disabledRow).toBeVisible();
    await expect(disabledRow).toHaveAttribute("aria-disabled", "true");
    await expect(disabledRow).toHaveAttribute("tabindex", "-1");
  });

  test("M3 motion: emphasized easing on wrapper background transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    const wrapper = page.locator("[data-component='data-grid']").first();
    const styles = await wrapper.evaluate((el) => {
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

  test("hover paints the row state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    const row = page
      .locator("[data-component='data-grid-row'][data-state='default']")
      .first();
    await expect(row).toBeVisible();
    const layer = row.locator("[data-slot='state-layer']").first();
    await row.hover();
    await page.waitForTimeout(350);
    const opacity = await layer.evaluate((el) =>
      Number.parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("sortable header carries aria-sort=none initially", async ({ page }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const header = page
      .locator("[role='columnheader'][data-sortable='true']")
      .first();
    await expect(header).toHaveAttribute("aria-sort", "none");
  });

  test("active sort header reports aria-sort=descending on sortable story", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--sortable"));
    const salaryHeader = page
      .locator("[role='columnheader'][data-key='salary']")
      .first();
    await expect(salaryHeader).toHaveAttribute("aria-sort", "descending");
  });

  test("selection cursor paints bg-primary at 3px width on the focused row", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    const row = page
      .locator("[data-component='data-grid-row'][data-state='default']")
      .first();
    await row.focus();
    await page.waitForTimeout(120);
    const cursor = page.locator("[data-slot='data-grid-cursor']").first();
    await expect(cursor).toBeVisible();
    const styles = await cursor.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, width: cs.width };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.width).toBe("3px");
  });

  test("selection cursor morph shape matches the active shape token", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    const row = page
      .locator("[data-component='data-grid-row'][data-state='default']")
      .first();
    await row.focus();
    await page.waitForTimeout(120);
    const cursor = page.locator("[data-slot='data-grid-cursor']").first();
    const radius = await cursor.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
  });

  test("ARIA wiring: each body row gets aria-rowindex starting at 2", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--default"));
    const firstBodyRow = page
      .locator("[data-component='data-grid-row']")
      .first();
    await expect(firstBodyRow).toHaveAttribute("aria-rowindex", "2");
  });

  test("roving-tabindex: exactly one focusable row in the grid", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    await page.waitForLoadState("networkidle");
    const rows = page.locator("[data-component='data-grid-row']");
    const count = await rows.count();
    expect(count).toBeGreaterThan(1);
    const tabIndices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        rows
          .nth(i)
          .evaluate((el) => (el as HTMLElement).getAttribute("tabindex")),
      ),
    );
    const focusable = tabIndices.filter((t) => t === "0").length;
    expect(focusable).toBe(1);
  });

  test("clicking a row fires selection + paints the secondary-container fill", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    const target = page
      .locator("[data-component='data-grid-row']")
      .nth(2);
    await target.click();
    await expect(target).toHaveAttribute("aria-selected", "true");
    // Allow the row's bg-color transition to finish before sampling.
    await page.waitForTimeout(450);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(450);
    const bg = await target.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("ArrowDown on a focused row moves focus to the next row", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "light", "no-preference"),
    );
    const first = page.locator("[data-component='data-grid-row']").first();
    await first.focus();
    await page.keyboard.press("ArrowDown");
    const focusedKey = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-key"),
    );
    expect(focusedKey).toBe("p2");
  });

  test("Enter on a focused row toggles selection on the interaction story", async ({
    page,
  }) => {
    await page.goto(
      storyUrl(
        "advanced-data-grid--interaction-spec",
        "light",
        "no-preference",
      ),
    );
    // The play() function clicks row p3 on load; wait for it to settle
    // before driving our own interaction, otherwise the click may race
    // against our focus + Enter and leave selection on p3.
    const selectedReadout = page.getByTestId("selected-keys");
    await expect(selectedReadout).toHaveText("selected: p3");
    const targetRow = page
      .locator("[data-component='data-grid-row'][data-key='p1']")
      .first();
    await targetRow.focus();
    await page.keyboard.press("Enter");
    await expect(targetRow).toHaveAttribute("aria-selected", "true");
  });

  test("tonal variant paints secondary cursor color", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-data-grid--variants", "light", "no-preference"),
    );
    const row = page
      .locator(
        "[data-component='data-grid'][data-variant='tonal'] [data-component='data-grid-row']",
      )
      .first();
    await row.focus();
    await page.waitForTimeout(120);
    const cursor = page
      .locator(
        "[data-component='data-grid'][data-variant='tonal'] [data-slot='data-grid-cursor']",
      )
      .first();
    const bg = await cursor.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY);
  });

  test("empty rows render the empty-state placeholder", async ({ page }) => {
    await page.goto(storyUrl("advanced-data-grid--empty"));
    const grid = page.locator("[role='grid']").first();
    await expect(grid).toBeVisible();
    const emptyCell = grid.locator("[role='gridcell']").first();
    await expect(emptyCell).toHaveText(/no rows/i);
  });

  test("checkbox column paints checked state on selected rows", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-data-grid--with-checkboxes"));
    const checkedRow = page
      .locator("[data-component='data-grid-row'][data-selected='true']")
      .first();
    const box = checkedRow.locator("[data-slot='row-checkbox']").first();
    const bg = await box.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_PRIMARY);
  });

  test("dark theme: cursor swaps to dark primary", async ({ page }) => {
    await page.goto(
      storyUrl("advanced-data-grid--default", "dark", "no-preference"),
    );
    await page.waitForLoadState("networkidle");
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === "dark",
    );
    const row = page
      .locator("[data-component='data-grid-row'][data-state='default']")
      .first();
    await row.focus();
    await page.waitForTimeout(120);
    const cursor = page.locator("[data-slot='data-grid-cursor']").first();
    const bg = await cursor.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_PRIMARY);
  });
});
