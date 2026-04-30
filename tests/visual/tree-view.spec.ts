import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized TreeView.
 *
 * Spec sources:
 *   - MUI X TreeView          https://mui.com/x/react-tree-view/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 list density         https://m3.material.io/components/lists/specs
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * Material 3 has no formal Tree View spec, so this re-skins MUI X
 * TreeView onto M3 tokens (per the project's "MUI fallback" rule).
 * The selection cursor (a 3dp leading bar painted in `bg-primary` on
 * the focused row) morphs from `shape-xs` to the selected `shape`
 * token via a shared `layoutId` motion span — the same M3 Expressive
 * selection morph used by Tabs / Stepper / Pagination / DataGrid.
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
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_SURFACE_CONTAINER_LOW = "rgb(29, 27, 32)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Tree View - M3 design parity", () => {
  test("default tree renders role=tree + role=treeitem + aria attributes", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const wrapper = page.locator("[data-component='tree-view']").first();
    await expect(wrapper).toBeVisible();
    await expect(wrapper).toHaveAttribute("data-variant", "text");
    await expect(wrapper).toHaveAttribute("data-size", "md");
    await expect(wrapper).toHaveAttribute("data-shape", "md");
    const tree = page.locator("[role='tree']").first();
    await expect(tree).toBeVisible();
    const items = page.locator("[role='treeitem']");
    expect(await items.count()).toBeGreaterThan(0);
    const root = items.first();
    await expect(root).toHaveAttribute("aria-level", "1");
    await expect(root).toHaveAttribute("aria-posinset", "1");
  });

  test("default story flags the seeded selected row via aria-selected=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const selected = page
      .locator("[data-component='tree-view-row'][data-selected='true']")
      .first();
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("aria-selected", "true");
    await expect(selected).toHaveAttribute("data-state", "selected");
  });

  test("selected row paints secondary-container + on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const selectedRow = page
      .locator("[data-component='tree-view-row'][data-selected='true']")
      .first();
    const styles = await selectedRow.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("advanced-tree-view--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const wrap = page
        .locator(`[data-component='tree-view'][data-variant='${variant}']`)
        .first();
      await expect(wrap).toBeVisible();
      const bg = await wrap.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--variants"));
    const wrap = page
      .locator("[data-component='tree-view'][data-variant='outlined']")
      .first();
    const styles = await wrap.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { width: cs.borderTopWidth, color: cs.borderTopColor };
    });
    expect(styles.width).toBe("1px");
    expect(styles.color).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated variant lifts to elevation-2 (M3 menu surface elevation)", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--variants"));
    const wrap = page
      .locator("[data-component='tree-view'][data-variant='elevated']")
      .first();
    const shadow = await wrap.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("6px");
  });

  test("size scale: 32 / 40 / 56 px row min-heights for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const row = page
          .locator(
            `[data-component='tree-view'][data-size='${size}'] [data-component='tree-view-row']`,
          )
          .first();
        await expect(row).toBeVisible();
        return row.evaluate((el) => window.getComputedStyle(el).minHeight);
      }),
    );
    expect(heights).toEqual(["32px", "40px", "56px"]);
  });

  test("body label typography steps body-s / body-m / body-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--sizes"));
    const expected: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    for (const [size, fontSize] of Object.entries(expected)) {
      const label = page
        .locator(
          `[data-component='tree-view'][data-size='${size}'] [data-slot='label']`,
        )
        .first();
      const measured = await label.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );
      expect(measured, `size=${size}`).toBe(fontSize);
    }
  });

  test("indent step grows per nesting level (md = 24px per level)", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const root = page
      .locator("[data-component='tree-view-row'][data-id='src']")
      .first();
    const child = page
      .locator("[data-component='tree-view-row'][data-id='components']")
      .first();
    const grand = page
      .locator(
        "[data-component='tree-view-row'][data-id='TreeView.tsx']",
      )
      .first();
    const padRoot = await root.evaluate(
      (el) => parseInt(window.getComputedStyle(el).paddingLeft, 10),
    );
    const padChild = await child.evaluate(
      (el) => parseInt(window.getComputedStyle(el).paddingLeft, 10),
    );
    const padGrand = await grand.evaluate(
      (el) => parseInt(window.getComputedStyle(el).paddingLeft, 10),
    );
    expect(padChild - padRoot).toBe(24);
    expect(padGrand - padChild).toBe(24);
  });

  test("disabled item paints the M3 disabled wash + aria-disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--states"));
    const row = page
      .locator(
        "[data-component='tree-view-row'][data-id='disabled']",
      )
      .first();
    await expect(row).toBeVisible();
    await expect(row).toHaveAttribute("aria-disabled", "true");
    const opacity = await row.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("error item paints the M3 error foreground role", async ({ page }) => {
    await page.goto(storyUrl("advanced-tree-view--states"));
    const row = page
      .locator("[data-component='tree-view-row'][data-id='error']")
      .first();
    await expect(row).toBeVisible();
    const color = await row.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("advanced-tree-view--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const wrap = page
        .locator(`[data-component='tree-view'][data-shape='${shape}']`)
        .first();
      const radius = await wrap.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='tree-view'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("leading + trailing icon slots render alongside the label", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--slots"));
    const both = page
      .locator("[data-component='tree-view-row'][data-id='both']")
      .first();
    const leading = both.locator("[data-slot='icon']");
    const trailing = both.locator("[data-slot='end-icon']");
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    const label = both.locator("[data-slot='label']");
    await expect(label).toHaveText("Leading + trailing");
  });

  test("caret button rotates 90deg when its parent is expanded", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const expandedRow = page
      .locator(
        "[data-component='tree-view-row'][data-id='src'][aria-expanded='true']",
      )
      .first();
    const caret = expandedRow.locator("[data-slot='caret']");
    const transform = await caret.evaluate(
      (el) => window.getComputedStyle(el).transform,
    );
    // matrix(0, 1, -1, 0, 0, 0) === rotate(90deg)
    expect(transform).toContain("matrix");
    expect(transform).not.toBe("none");
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-tree-view--default", "light", "no-preference"),
    );
    const wrap = page.locator("[data-component='tree-view']").first();
    const styles = await wrap.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.property).toContain("box-shadow");
    expect(styles.duration).toContain("0.3s");
  });

  test("ARIA wiring: role=tree, multi-selectable when selectionMode=multiple", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--multiple-selection"));
    const tree = page.locator("[data-component='tree-view-tree']").first();
    await expect(tree).toHaveAttribute("role", "tree");
    await expect(tree).toHaveAttribute("aria-multiselectable", "true");
    const picked = page.locator("[data-testid='picked-out']");
    await expect(picked).toContainText("TreeView.tsx");
  });

  test("selection cursor paints bg-primary on the focused row", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const cursor = page
      .locator("[data-slot='tree-view-cursor']")
      .first();
    await expect(cursor).toBeVisible();
    const bg = await cursor.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_PRIMARY);
  });

  test("dark theme swaps elevated tree to dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--accessibility", "dark"));
    const wrap = page.locator("[data-component='tree-view']").first();
    const bg = await wrap.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("clicking a leaf row flips aria-selected and stays focusable", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--default"));
    const row = page
      .locator(
        "[data-component='tree-view-row'][data-id='main.tsx']",
      )
      .first();
    const before = await row.getAttribute("aria-selected");
    await row.click();
    const after = await row.getAttribute("aria-selected");
    expect(before).not.toBe(after);
  });

  test("collapsing a folder hides its descendants from the DOM", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-tree-view--motion", "light", "no-preference"),
    );
    await page.locator("[data-testid='motion-expand']").click();
    await page.waitForTimeout(300);
    const childRow = page.locator(
      "[data-component='tree-view-row'][data-id='Button.tsx']",
    );
    await expect(childRow.first()).toBeVisible();
    await page.locator("[data-testid='motion-collapse']").click();
    await page.waitForTimeout(450);
    await expect(childRow).toHaveCount(0);
  });

  test("playground story renders a tree with the canonical default props", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--playground"));
    const wrap = page.locator("[data-component='tree-view']").first();
    await expect(wrap).toBeVisible();
    await expect(wrap).toHaveAttribute("data-variant", "filled");
    await expect(wrap).toHaveAttribute("data-size", "md");
  });

  test("text variant renders transparent host with on-surface foreground", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--variants"));
    const wrap = page
      .locator("[data-component='tree-view'][data-variant='text']")
      .first();
    const styles = await wrap.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("tonal variant uses the secondary cursor token", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-tree-view--variants"));
    const cursor = page
      .locator(
        "[data-component='tree-view'][data-variant='tonal'] [data-slot='tree-view-cursor']",
      )
      .first();
    await expect(cursor).toBeVisible();
    const bg = await cursor.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_SECONDARY);
  });
});
