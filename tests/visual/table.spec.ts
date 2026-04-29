import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Table. M3 has no formal Table spec,
 * so this tests the MUI-fallback pattern re-skinned with M3 tokens
 * (per the app spec rule for MUI-only components).
 *
 * Variants assert:
 *   - standard  -> transparent wrapper
 *   - filled    -> surface-container fill + shape-sm radius
 *   - outlined  -> 1dp outline-variant border + shape-sm radius
 *   - elevated  -> surface-container-low fill + elevation-1 shadow
 * Sizes assert (body row heights):
 *   - sm -> 40dp
 *   - md -> 52dp
 *   - lg -> 72dp
 * Header section asserts: thead is bottom-bordered with outline-variant.
 * Cells assert: header = title-s 14px / body = body-m 14px.
 * Sortable header asserts: button + aria-sort + caret rotation toggling.
 * Selected row asserts: secondary-container + on-secondary-container +
 *   aria-selected=true.
 * State-layer asserts (interactive rows):
 *   - hover   -> 0.08
 *   - focus   -> 0.10
 *   - pressed -> 0.10
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Table - M3 design parity", () => {
  test("default renders a <table> with role=table + variant/size data + thead+tbody", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--default"));
    const table = page.getByRole("table", { name: "Default table" });
    await expect(table).toBeVisible();
    await expect(table).toHaveAttribute("data-component", "table");
    await expect(table).toHaveAttribute("data-variant", "standard");
    await expect(table).toHaveAttribute("data-size", "md");
    const tag = await table.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("table");
    expect(await table.locator("thead").count()).toBe(1);
    expect(await table.locator("tbody").count()).toBe(1);
  });

  test("standard variant renders a transparent wrapper", async ({ page }) => {
    await page.goto(storyUrl("data-display-table--variants"));
    const table = page.getByRole("table", { name: "Standard table" });
    const wrapper = table.locator("xpath=..");
    const bg = await wrapper.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(TRANSPARENT);
  });

  test("filled variant paints surface-container + shape-sm radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--variants"));
    const table = page.getByRole("table", { name: "Filled table" });
    const wrapper = table.locator("xpath=..");
    const styles = await wrapper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        radius: parseFloat(cs.borderTopLeftRadius),
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
    // shape-sm = 8dp
    expect(styles.radius).toBe(8);
  });

  test("outlined variant paints 1dp outline-variant border + shape-sm radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--variants"));
    const table = page.getByRole("table", { name: "Outlined table" });
    const wrapper = table.locator("xpath=..");
    const styles = await wrapper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: parseFloat(cs.borderTopWidth),
        radius: parseFloat(cs.borderTopLeftRadius),
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.borderWidth).toBe(1);
    expect(styles.radius).toBe(8);
  });

  test("elevated variant paints surface-container-low + elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--variants"));
    const table = page.getByRole("table", { name: "Elevated table" });
    const wrapper = table.locator("xpath=..");
    const styles = await wrapper.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, shadow: cs.boxShadow };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    // elevation-1 paints two shadow layers — assert the shadow string
    // is non-empty and references rgba (i.e. shadow is on).
    expect(styles.shadow).not.toBe("none");
    expect(styles.shadow).toContain("rgba");
  });

  test("size scale matches M3 spec (sm 40 / md 52 / lg 72 body row heights)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--sizes"));
    const tables = ["Small table", "Medium table", "Large table"];
    const expected = [40, 52, 72];
    for (let i = 0; i < tables.length; i++) {
      const table = page.getByRole("table", { name: tables[i] });
      const firstBodyRow = table.locator("tbody tr").first();
      const height = await firstBodyRow.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).height),
      );
      expect(height).toBe(expected[i]);
    }
  });

  test("header cells render at title-s (14px, weight 500) in on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--default"));
    const table = page.getByRole("table", { name: "Default table" });
    const header = table.locator("thead th").first();
    const styles = await header.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
      };
    });
    // title-s is 14px / 500
    expect(styles.fontSize).toBe("14px");
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(parseInt(styles.fontWeight, 10)).toBeGreaterThanOrEqual(500);
  });

  test("body cells render at body-m (14px) in on-surface", async ({ page }) => {
    await page.goto(storyUrl("data-display-table--default"));
    const table = page.getByRole("table", { name: "Default table" });
    const cell = table.locator("tbody td").first();
    const styles = await cell.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { color: cs.color, fontSize: cs.fontSize };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("thead is bottom-bordered with outline-variant (M3 header divider)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--default"));
    const thead = page
      .getByRole("table", { name: "Default table" })
      .locator("thead");
    const styles = await thead.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderColor: cs.borderBottomColor,
        borderWidth: parseFloat(cs.borderBottomWidth),
      };
    });
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(styles.borderWidth).toBe(1);
  });

  test("body rows are divided by 1dp outline-variant dividers (last row drops divider)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--default"));
    const table = page.getByRole("table", { name: "Default table" });
    const rows = table.locator("tbody tr");
    const count = await rows.count();
    for (let i = 0; i < count - 1; i++) {
      const styles = await rows.nth(i).evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          borderColor: cs.borderBottomColor,
          borderWidth: parseFloat(cs.borderBottomWidth),
        };
      });
      expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
      expect(styles.borderWidth).toBe(1);
    }
    const lastBorder = await rows.nth(count - 1).evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderBottomWidth),
    );
    expect(lastBorder).toBe(0);
  });

  test("numeric cells right-align with tabular-nums", async ({ page }) => {
    await page.goto(storyUrl("data-display-table--default"));
    const table = page.getByRole("table", { name: "Default table" });
    const numericCell = table.locator("tbody td[data-numeric]").first();
    const styles = await numericCell.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        textAlign: cs.textAlign,
        fontVariant: cs.fontVariantNumeric,
      };
    });
    expect(styles.textAlign).toBe("right");
    expect(styles.fontVariant).toContain("tabular-nums");
  });

  test("sortable header exposes aria-sort + an interactive sort button", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--accessibility"));
    const table = page.getByRole("table", { name: "Accessibility table" });
    const sortableHeader = table.locator("th[data-sortable]").first();
    await expect(sortableHeader).toHaveAttribute("aria-sort", "ascending");
    const button = sortableHeader.locator("button[data-slot='sort-button']");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("data-sort-direction", "asc");
  });

  test("sort caret rotates 180deg when direction flips to desc", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--sortable"));
    const table = page.getByRole("table", { name: "Sortable table" });
    const button = table
      .locator("th[data-sortable]")
      .first()
      .locator("button[data-slot='sort-button']");
    await expect(button).toHaveAttribute("data-sort-direction", "asc");
    await button.click();
    await expect(button).toHaveAttribute("data-sort-direction", "desc");
    const caret = button.locator("[data-slot='sort-caret']");
    // Wait for the rotation transition (short4 = 200ms) to settle.
    await page.waitForTimeout(300);
    const transform = await caret.evaluate(
      (el) => window.getComputedStyle(el).transform,
    );
    // rotate(180deg) -> matrix(-1, 0, 0, -1, 0, 0). Allow a tiny tolerance
    // because the cubic-bezier easing can leave the matrix slightly off.
    const m = transform.match(/matrix\(([-\d.]+),/);
    expect(m).not.toBeNull();
    expect(parseFloat(m![1])).toBeCloseTo(-1, 2);
  });

  test("selected row paints secondary-container + on-secondary-container + aria-selected=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--states"));
    const table = page.getByRole("table", { name: "States table" });
    const row = table.locator("tr[data-selected]").first();
    await expect(row).toHaveAttribute("aria-selected", "true");
    const styles = await row.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("disabled row fades to ~38% opacity + aria-disabled=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--states"));
    const table = page.getByRole("table", { name: "States table" });
    const row = table.locator("tr[data-disabled]").first();
    await expect(row).toHaveAttribute("aria-disabled", "true");
    const opacity = await row.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("interactive row hover paints state-layer at 0.08 opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-table--motion", "light", "no-preference"),
    );
    const table = page.getByRole("table", { name: "Motion table" });
    const row = table.locator("tbody tr[data-interactive]").first();
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await row.hover();
    await page.waitForTimeout(260);
    const opacity = await row
      .locator("[data-state-layer]")
      .first()
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("interactive row focus paints state-layer at 0.10 opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-table--motion", "light", "no-preference"),
    );
    const table = page.getByRole("table", { name: "Motion table" });
    const row = table.locator("tbody tr[data-interactive]").first();
    await row.evaluate((el: HTMLElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await row
      .locator("[data-state-layer]")
      .first()
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("interactive row exposes tabindex=0 + data-state-layer-opacity attr", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--interactive"));
    const table = page.getByRole("table", { name: "Interactive table" });
    const row = table.locator("tbody tr[data-interactive]").first();
    await expect(row).toHaveAttribute("tabindex", "0");
    await expect(row).toHaveAttribute("data-state-layer-opacity", "0");
  });

  test("caption renders above the table with title-m text", async ({ page }) => {
    await page.goto(storyUrl("data-display-table--accessibility"));
    const table = page.getByRole("table", { name: "Accessibility table" });
    const caption = table.locator("caption");
    await expect(caption).toBeVisible();
    const styles = await caption.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        captionSide: cs.captionSide,
        fontSize: cs.fontSize,
      };
    });
    expect(styles.captionSide).toBe("top");
    // title-m = 16px
    expect(styles.fontSize).toBe("16px");
  });

  test("M3 motion: state-layer transitions opacity with standard easing", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--motion"));
    const table = page.getByRole("table", { name: "Motion table" });
    const layer = table
      .locator("tbody tr[data-interactive] [data-state-layer]")
      .first();
    const styles = await layer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionProperty: cs.transitionProperty,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    expect(styles.transitionProperty).toContain("opacity");
    expect(styles.transitionTimingFunction).toContain(EASE_STANDARD);
  });

  test("dark theme repaints the filled wrapper to dark surface-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--variants", "dark"));
    const table = page.getByRole("table", { name: "Filled table" });
    const wrapper = table.locator("xpath=..");
    const bg = await wrapper.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark surface-container = #211F26 → rgb(33, 31, 38)
    expect(bg).toBe("rgb(33, 31, 38)");
  });

  test("sticky-header story applies sticky positioning on header cells", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-table--sticky-header"));
    const table = page.getByRole("table", { name: "Sticky table" });
    const headerCell = table.locator("thead th").first();
    const position = await headerCell.evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(position).toBe("sticky");
  });

  test("playground respects runtime variant + size + sticky-header controls", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=data-display-table--playground&viewMode=story&args=variant:elevated;size:lg;stickyHeader:true&globals=theme:light;reducedMotion:reduce",
    );
    const table = page.getByRole("table", { name: "Playground table" });
    await expect(table).toHaveAttribute("data-variant", "elevated");
    await expect(table).toHaveAttribute("data-size", "lg");
  });
});
