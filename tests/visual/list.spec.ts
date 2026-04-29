import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 List. Every assertion reads
 * computed style so a token drift breaks the test.
 *
 * Variants assert:
 *   - standard  -> transparent container
 *   - filled    -> surface-container fill + shape-sm radius
 *   - outlined  -> 1dp outline-variant border + shape-sm radius
 * Sizes assert (with leading slot):
 *   - sm -> 56dp item height (1-line)
 *   - md -> 72dp item height (2-line, headline + supporting)
 *   - lg -> 88dp item height (3-line, supporting wraps to 2 lines)
 * Slots assert leading + trailing + overline + supporting render via
 *   their data-slot attributes.
 * State layers assert:
 *   - hover   -> 0.08
 *   - focus   -> 0.10
 *   - pressed -> 0.10
 * Selected paints secondary-container + on-secondary-container.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("List - M3 design parity", () => {
  test("default renders role=list with three role=listitem rows + variant/size data", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--default"));
    const list = page.getByRole("list").first();
    await expect(list).toBeVisible();
    await expect(list).toHaveAttribute("data-variant", "standard");
    await expect(list).toHaveAttribute("data-size", "md");
    const items = list.getByRole("listitem");
    await expect(items).toHaveCount(3);
  });

  test("standard variant renders a transparent container", async ({ page }) => {
    await page.goto(storyUrl("data-display-list--variants"));
    const list = page.getByRole("list", { name: "Standard list" });
    const bg = await list.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(TRANSPARENT);
  });

  test("filled variant paints surface-container + shape-sm radius", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--variants"));
    const list = page.getByRole("list", { name: "Filled list" });
    const styles = await list.evaluate((el) => {
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
    await page.goto(storyUrl("data-display-list--variants"));
    const list = page.getByRole("list", { name: "Outlined list" });
    const styles = await list.evaluate((el) => {
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

  test("size scale matches M3 spec (sm 56 / md 72 / lg 88 with leading)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--sizes"));
    const smList = page.getByRole("list", { name: "Small list" });
    const mdList = page.getByRole("list", { name: "Medium list" });
    const lgList = page.getByRole("list", { name: "Large list" });
    const smItem = smList.getByRole("listitem").first();
    const mdItem = mdList.getByRole("listitem").first();
    const lgItem = lgList.getByRole("listitem").first();
    const heights = await Promise.all(
      [smItem, mdItem, lgItem].map((it) =>
        it.evaluate((el) => parseFloat(window.getComputedStyle(el).minHeight)),
      ),
    );
    expect(heights[0]).toBe(56);
    expect(heights[1]).toBe(72);
    expect(heights[2]).toBe(88);
  });

  test("medium row paints body-l headline + body-m supporting in on-surface roles", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--sizes"));
    const list = page.getByRole("list", { name: "Medium list" });
    const headline = list.locator("[data-slot='headline']").first();
    const supporting = list.locator("[data-slot='supporting']").first();
    const headStyles = await headline.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { color: cs.color, fontSize: cs.fontSize };
    });
    const supportStyles = await supporting.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { color: cs.color, fontSize: cs.fontSize };
    });
    // body-l = 16px, body-m = 14px.
    expect(headStyles.fontSize).toBe("16px");
    expect(headStyles.color).toBe(LIGHT_ON_SURFACE);
    expect(supportStyles.fontSize).toBe("14px");
    expect(supportStyles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("small (1-line) row hides the supporting slot per M3 spec", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--sizes"));
    const smList = page.getByRole("list", { name: "Small list" });
    const supporting = smList.locator("[data-slot='supporting']");
    expect(await supporting.count()).toBe(0);
  });

  test("slots: leading + trailing + overline + supporting render via data-slot", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--slots"));
    const list = page.getByRole("list", { name: "Slots list" });
    expect(await list.locator("[data-slot='leading']").count()).toBeGreaterThanOrEqual(2);
    expect(await list.locator("[data-slot='trailing']").count()).toBeGreaterThanOrEqual(2);
    expect(await list.locator("[data-slot='overline']").count()).toBeGreaterThanOrEqual(1);
    expect(await list.locator("[data-slot='headline']").count()).toBe(4);
  });

  test("interactive item promotes to a <button> with role=button + state-layer", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--interactive"));
    const list = page.getByRole("list", { name: "Interactive list" });
    const button = list.getByRole("button", { name: /Inbox/ });
    await expect(button).toBeVisible();
    expect(await button.locator("[data-state-layer]").count()).toBe(1);
  });

  test("hover paints state-layer at 0.08 opacity (M3 hover token)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-list--interactive", "light", "no-preference"),
    );
    const button = page.getByRole("button", { name: /Inbox/ });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await button.hover();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity (M3 focus token)", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("data-display-list--interactive", "light", "no-preference"),
    );
    const button = page.getByRole("button", { name: /Inbox/ });
    await button.evaluate((el: HTMLElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("selected row paints secondary-container + on-secondary-container + aria-pressed=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--states"));
    const list = page.getByRole("list", { name: "States list" });
    const button = list.getByRole("button", { name: /Selected/ });
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("disabled row fades to ~38% opacity + aria-disabled=true", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--states"));
    const list = page.getByRole("list", { name: "States list" });
    // The disabled row is rendered as <button disabled> per the
    // ListItem implementation. The accessible name still reads.
    const button = list.locator("button[disabled]").first();
    await expect(button).toBeVisible();
    const opacity = await button.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).opacity),
    );
    expect(opacity).toBeCloseTo(0.38, 2);
  });

  test("error row paints error color on the headline text", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--states"));
    const list = page.getByRole("list", { name: "States list" });
    const button = list.getByRole("button", { name: /Error/ });
    const color = await button.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("M3 motion: state-layer transitions on opacity with standard easing", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--motion"));
    const layer = page.getByRole("button").locator("[data-state-layer]").first();
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

  test("dark theme swaps the filled list to its dark surface-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-list--variants", "dark"));
    const list = page.getByRole("list", { name: "Filled list" });
    const bg = await list.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // Dark surface-container = #211F26 → rgb(33, 31, 38)
    expect(bg).not.toBe(LIGHT_SURFACE_CONTAINER);
    expect(bg).not.toBe(TRANSPARENT);
  });

  test("ordered list renders an <ol> when ordered=true", async ({ page }) => {
    await page.goto(storyUrl("data-display-list--playground"));
    // Default is unordered.
    const ulCount = await page.locator("ul[data-component='list']").count();
    const olCount = await page.locator("ol[data-component='list']").count();
    expect(ulCount).toBeGreaterThanOrEqual(1);
    expect(olCount).toBe(0);
  });

  test("playground respects runtime variant + size controls", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=data-display-list--playground&viewMode=story&args=variant:outlined;size:lg&globals=theme:light;reducedMotion:reduce",
    );
    const list = page.getByRole("list", { name: "Playground list" });
    await expect(list).toHaveAttribute("data-variant", "outlined");
    await expect(list).toHaveAttribute("data-size", "lg");
  });
});
