import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Divider. Every assertion reads
 * computed style so a token drift breaks the test.
 *  - color role : outline-variant
 *  - thickness  : sm 1px / md 2px / lg 4px
 *  - inset      : full=0, inset=16dp leading, middle=16dp both sides
 *  - opacity    : standard fade-in (medium2 / standard easing) on mount
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_OUTLINE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Divider - M3 design parity", () => {
  test("default renders role=separator + horizontal aria-orientation + variant/size data", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--default"));
    const divider = page.getByRole("separator");
    await expect(divider).toBeVisible();
    await expect(divider).toHaveAttribute("data-variant", "full");
    await expect(divider).toHaveAttribute("data-size", "sm");
    await expect(divider).toHaveAttribute("data-orientation", "horizontal");
    await expect(divider).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("rule paints outline-variant in light theme", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--variants"));
    const rule = page.getByRole("separator", { name: "Full divider" });
    await expect(rule).toBeVisible();
    const bg = await rule.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("rule paints outline-variant in dark theme", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--variants", "dark"));
    const rule = page.getByRole("separator", { name: "Full divider" });
    await expect(rule).toBeVisible();
    const bg = await rule.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_OUTLINE_VARIANT);
  });

  test("size scale matches M3 spec (sm 1px / md 2px / lg 4px)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--sizes"));
    const heights = await Promise.all(
      ["Small divider", "Medium divider", "Large divider"].map(async (name) => {
        const rule = page.getByRole("separator", { name });
        await expect(rule).toBeVisible();
        return await rule.evaluate(
          (el) => window.getComputedStyle(el).height,
        );
      }),
    );
    expect(heights).toEqual(["1px", "2px", "4px"]);
  });

  test("inset variant insets the leading edge by 16dp", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--variants"));
    const inset = page.getByRole("separator", { name: "Inset divider" });
    await expect(inset).toBeVisible();
    const ml = await inset.evaluate(
      (el) => window.getComputedStyle(el).marginLeft,
    );
    expect(ml).toBe("16px");
    await expect(inset).toHaveAttribute("data-variant", "inset");
  });

  test("middle variant insets both sides by 16dp", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--variants"));
    const middle = page.getByRole("separator", { name: "Middle divider" });
    await expect(middle).toBeVisible();
    const styles = await middle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { ml: cs.marginLeft, mr: cs.marginRight };
    });
    expect(styles.ml).toBe("16px");
    expect(styles.mr).toBe("16px");
  });

  test("full variant uses zero inset", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--variants"));
    const full = page.getByRole("separator", { name: "Full divider" });
    await expect(full).toBeVisible();
    const styles = await full.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { ml: cs.marginLeft, mr: cs.marginRight };
    });
    expect(styles.ml).toBe("0px");
    expect(styles.mr).toBe("0px");
  });

  test("vertical orientation reports aria-orientation=vertical + width thickness", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--vertical"));
    const rule = page.getByRole("separator", { name: "Vertical sm" });
    await expect(rule).toBeVisible();
    await expect(rule).toHaveAttribute("aria-orientation", "vertical");
    await expect(rule).toHaveAttribute("data-orientation", "vertical");
    const width = await rule.evaluate(
      (el) => window.getComputedStyle(el).width,
    );
    expect(width).toBe("1px");
  });

  test("vertical sizes match M3 thickness scale (sm 1px / md 2px / lg 4px)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--vertical"));
    const widths = await Promise.all(
      ["Vertical sm", "Vertical md", "Vertical lg"].map(async (name) => {
        const rule = page.getByRole("separator", { name });
        await expect(rule).toBeVisible();
        return await rule.evaluate(
          (el) => window.getComputedStyle(el).width,
        );
      }),
    );
    expect(widths).toEqual(["1px", "2px", "4px"]);
  });

  test("labelled divider exposes the label slot + two decorative rules", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--slots"));
    const labelled = page.locator("[data-slot='label']").first();
    await expect(labelled).toBeVisible();
    await expect(labelled).toHaveText("Center label");
    // Both rules render as decorative aria-hidden spans inside the
    // separator container, one on each side of the label.
    const dividerRoot = page.locator("[role='separator']").first();
    await expect(dividerRoot.locator("[data-slot='rule-leading']")).toHaveCount(1);
    await expect(dividerRoot.locator("[data-slot='rule-trailing']")).toHaveCount(1);
  });

  test("labelled divider paints on-surface-variant text + medium label type", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--slots"));
    const dividerRoot = page.locator("[role='separator']").first();
    await expect(dividerRoot).toBeVisible();
    const labelSpan = dividerRoot.locator("[data-slot='label']");
    const styles = await labelSpan.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
      };
    });
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
    // label-m token = 12px / weight 500.
    expect(styles.fontSize).toBe("12px");
    expect(parseInt(styles.fontWeight, 10)).toBeGreaterThanOrEqual(500);
  });

  test("label-align=start shrinks the leading rule to a 16dp gutter", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--slots"));
    const startDivider = page
      .locator("[data-label-align='start']")
      .first();
    await expect(startDivider).toBeVisible();
    const leadingWidth = await startDivider
      .locator("[data-slot='rule-leading']")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).width));
    expect(leadingWidth).toBeCloseTo(16, 0);
  });

  test("label slot renders leading + trailing icons", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--slots"));
    const iconsDivider = page
      .locator("[role='separator']")
      .filter({ has: page.locator("[data-slot='leading-icon']") })
      .first();
    await expect(iconsDivider).toBeVisible();
    await expect(iconsDivider.locator("[data-slot='leading-icon']")).toHaveCount(1);
    await expect(iconsDivider.locator("[data-slot='trailing-icon']")).toHaveCount(1);
  });

  test("M3 motion: standard easing on opacity transition", async ({ page }) => {
    await page.goto(storyUrl("data-display-divider--default"));
    const rule = page.getByRole("separator");
    await expect(rule).toBeVisible();
    const styles = await rule.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionProperty: cs.transitionProperty,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    expect(styles.transitionTimingFunction).toContain(EASE_STANDARD);
    expect(styles.transitionProperty).toContain("opacity");
  });

  test("decorative rules inside labelled divider stay aria-hidden", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--slots"));
    const dividerRoot = page.locator("[role='separator']").first();
    const leading = dividerRoot.locator("[data-slot='rule-leading']");
    const trailing = dividerRoot.locator("[data-slot='rule-trailing']");
    await expect(leading).toBeVisible();
    await expect(trailing).toBeVisible();
    expect(await leading.getAttribute("aria-hidden")).toBe("true");
    expect(await trailing.getAttribute("aria-hidden")).toBe("true");
  });

  test("aria-label override surfaces as the accessible name", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-divider--accessibility"));
    const rule = page.getByRole("separator", { name: "Section break" });
    await expect(rule).toBeVisible();
  });

  test("playground renders + accepts a runtime label control", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=data-display-divider--playground&viewMode=story&globals=theme:light;reducedMotion:reduce",
    );
    const dividerRoot = page.locator("[role='separator']").first();
    await expect(dividerRoot).toBeVisible();
    await expect(dividerRoot.locator("[data-slot='label']")).toHaveCount(1);
  });
});
