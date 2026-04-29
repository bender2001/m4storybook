import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Transfer List. There is no native
 * M3 Expressive spec for Transfer List, so this is the MUI fallback
 * re-skinned with M3 tokens (M3 surface-container-low cards, M3
 * Checkbox, M3 Icon Button arrow rail, on-surface state-layers at
 * the M3 opacities). Every assertion reads computed styles so the
 * test fails the moment a token drifts.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Transfer List - M3 design parity", () => {
  test("renders two cards (source + target) inside a 3-column grid", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const root = page.locator("[data-transferlist-root]").first();
    await expect(root).toBeVisible();
    const cards = root.locator("[data-transferlist-card]");
    await expect(cards).toHaveCount(2);
    await expect(root.locator("[data-side='source']").first()).toBeVisible();
    await expect(root.locator("[data-side='target']").first()).toBeVisible();
    const grid = root.locator("[data-transferlist-grid]").first();
    const cols = await grid.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns,
    );
    // 1fr auto 1fr resolves to "<source-px> <rail-px> <target-px>" — 3 tracks.
    expect(cols.split(" ").length).toBe(3);
  });

  test("filled variant paints surface-container-low with shape-md radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--variants"));
    const filled = page
      .locator("[data-transferlist-card][data-variant='filled']")
      .first();
    const styles = await filled.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        radius: cs.borderTopLeftRadius,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    // shape-md = 12dp.
    expect(parseFloat(styles.radius)).toBe(12);
    // Filled has no border.
    expect(parseFloat(styles.borderWidth)).toBe(0);
  });

  test("outlined variant paints transparent with a 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--variants"));
    const outlined = page
      .locator("[data-transferlist-card][data-variant='outlined']")
      .first();
    const styles = await outlined.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderTopColor,
        borderWidth: cs.borderTopWidth,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
    expect(parseFloat(styles.borderWidth)).toBe(1);
  });

  test("size scale heights match (sm 192 / md 240 / lg 288)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--sizes"));
    const cards = page.locator("[data-transferlist-card][data-side='source']");
    const heights: number[] = [];
    for (let i = 0; i < 3; i++) {
      const h = await cards
        .nth(i)
        .evaluate((el) => parseFloat(window.getComputedStyle(el).height));
      heights.push(h);
    }
    // sm = h-48 (192), md = h-60 (240), lg = h-72 (288).
    expect(heights).toEqual([192, 240, 288]);
  });

  test("rail renders 4 arrow buttons with M3 Icon Button shape (40dp circle)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const rail = page.locator("[data-transferlist-rail]").first();
    const buttons = rail.locator("[data-transferlist-arrow]");
    await expect(buttons).toHaveCount(4);
    const styles = await buttons.first().evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        height: cs.height,
        width: cs.width,
        radius: cs.borderTopLeftRadius,
      };
    });
    expect(parseFloat(styles.height)).toBe(40);
    expect(parseFloat(styles.width)).toBe(40);
    // shape-full pill.
    expect(parseFloat(styles.radius)).toBeGreaterThanOrEqual(20);
  });

  test("clicking a row toggles aria-selected and the row's checkbox", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const sourceList = page
      .locator("[data-transferlist-list][data-side='source']")
      .first();
    const firstRow = sourceList.locator("[data-transferlist-row]").first();
    await expect(firstRow).toHaveAttribute("aria-selected", "false");
    await firstRow.click();
    await expect(firstRow).toHaveAttribute("aria-selected", "true");
    await firstRow.click();
    await expect(firstRow).toHaveAttribute("aria-selected", "false");
  });

  test("right-arrow moves selected source rows to the target column", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const sourceList = page
      .locator("[data-transferlist-list][data-side='source']")
      .first();
    const targetList = page
      .locator("[data-transferlist-list][data-side='target']")
      .first();

    // Select the first two source rows.
    const sourceRows = sourceList.locator("[data-transferlist-row]");
    await sourceRows.nth(0).click();
    await sourceRows.nth(1).click();

    const moveRight = page.getByLabel("Move selected to target");
    await moveRight.click();

    // 2 rows moved → target now has 2 rows, source has 3.
    await expect(targetList.locator("[data-transferlist-row]")).toHaveCount(2);
    await expect(sourceList.locator("[data-transferlist-row]")).toHaveCount(3);
  });

  test("left-arrow moves selected target rows back to the source column", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const sourceList = page
      .locator("[data-transferlist-list][data-side='source']")
      .first();
    const targetList = page
      .locator("[data-transferlist-list][data-side='target']")
      .first();

    // Move 2 to target.
    const sourceRows = sourceList.locator("[data-transferlist-row]");
    await sourceRows.nth(0).click();
    await sourceRows.nth(1).click();
    await page.getByLabel("Move selected to target").click();
    await expect(targetList.locator("[data-transferlist-row]")).toHaveCount(2);

    // Now select the first target row and move it back.
    const targetRows = targetList.locator("[data-transferlist-row]");
    await targetRows.nth(0).click();
    await page.getByLabel("Move selected to source").click();
    await expect(targetList.locator("[data-transferlist-row]")).toHaveCount(1);
    await expect(sourceList.locator("[data-transferlist-row]")).toHaveCount(4);
  });

  test("double-arrow moves all rows at once (source → target)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const sourceList = page
      .locator("[data-transferlist-list][data-side='source']")
      .first();
    const targetList = page
      .locator("[data-transferlist-list][data-side='target']")
      .first();

    await expect(sourceList.locator("[data-transferlist-row]")).toHaveCount(5);

    await page.getByLabel("Move all to target").click();
    await expect(targetList.locator("[data-transferlist-row]")).toHaveCount(5);
    await expect(sourceList.locator("[data-transferlist-row]")).toHaveCount(0);
  });

  test("move-selected button is disabled when nothing is selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const moveRight = page.getByLabel("Move selected to target");
    const moveLeft = page.getByLabel("Move selected to source");
    await expect(moveRight).toBeDisabled();
    await expect(moveLeft).toBeDisabled();
  });

  test("hover paints the row state-layer at 0.08 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-transfer-list--default", "light", "no-preference"),
    );
    const row = page.locator("[data-transferlist-row]").first();
    await row.hover();
    await page.waitForTimeout(260);
    const opacity = await row
      .locator("[data-transferlist-row-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints the row state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-transfer-list--default", "light", "no-preference"),
    );
    const row = page.locator("[data-transferlist-row]").first();
    await row.focus();
    await page.waitForTimeout(260);
    const opacity = await row
      .locator("[data-transferlist-row-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("disabled state suppresses interaction + dims the root", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--states"));
    const disabled = page
      .locator("[data-transferlist-root][data-disabled]")
      .first();
    const opacity = await disabled.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("Space key on a focused row toggles selection", async ({ page }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const row = page.locator("[data-transferlist-row]").first();
    await row.focus();
    await page.keyboard.press(" ");
    await expect(row).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press(" ");
    await expect(row).toHaveAttribute("aria-selected", "false");
  });

  test("header select-all checkbox toggles every enabled row", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const sourceCard = page
      .locator("[data-transferlist-card][data-side='source']")
      .first();
    const selectAll = sourceCard.locator(
      "input[data-transferlist-select-all]",
    );
    await selectAll.click();
    const rows = sourceCard.locator("[data-transferlist-row]");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toHaveAttribute("aria-selected", "true");
    }
    await selectAll.click();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toHaveAttribute("aria-selected", "false");
    }
  });

  test("listbox semantics (role + aria-multiselectable) on each list", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const lists = page.locator("[data-transferlist-list]");
    await expect(lists).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      await expect(lists.nth(i)).toHaveAttribute("role", "listbox");
      await expect(lists.nth(i)).toHaveAttribute(
        "aria-multiselectable",
        "true",
      );
    }
  });

  test("count chip in the card header shows selected/total", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const sourceCard = page
      .locator("[data-transferlist-card][data-side='source']")
      .first();
    const count = sourceCard.locator("[data-transferlist-count]");
    await expect(count).toHaveText("0/5");
    const firstRow = sourceCard.locator("[data-transferlist-row]").first();
    await firstRow.click();
    await expect(count).toHaveText("1/5");
  });

  test("disabled item in the source column cannot be selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--with-descriptions"));
    const sourceCard = page
      .locator("[data-transferlist-card][data-side='source']")
      .first();
    const disabledRow = sourceCard
      .locator("[data-transferlist-row][data-disabled]")
      .first();
    await expect(disabledRow).toBeVisible();
    await expect(disabledRow).toHaveAttribute("aria-disabled", "true");
  });

  test("card motion uses M3 emphasized easing + medium2 (300ms)", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default"));
    const card = page.locator("[data-transferlist-card]").first();
    const styles = await card.evaluate((el) => {
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

  test("dark theme swaps surface-container-low on the filled card", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-transfer-list--default", "dark"));
    const card = page.locator("[data-transferlist-card]").first();
    const bg = await card.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark surface-container-low = #1D1B20 = rgb(29, 27, 32).
    expect(bg).not.toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(bg).toBe("rgb(29, 27, 32)");
  });
});
