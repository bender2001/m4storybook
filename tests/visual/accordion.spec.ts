import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Accordion / Expansion
 * Panel. Every assertion reads computed style so a token drift breaks
 * the test.
 *
 * Spec: https://m3.material.io/components/expansion-panels
 *
 * Color roles per variant (light theme):
 *   - elevated  -> surface-container-low + on-surface
 *                  + elevation-1 box-shadow
 *   - filled    -> surface-container-highest + on-surface
 *   - outlined  -> surface + 1dp outline-variant + on-surface
 *
 * Shape: shape-md (12px) by default.
 * Density: 48 / 56 / 72 px header height for sm / md / lg.
 * Title role: title-m (16px). Subhead/body role: body-m (14px) /
 * on-surface-variant.
 * Motion: medium2 (300ms) emphasized easing on chevron rotation +
 * panel height + opacity transitions.
 * Interactive: header is a real <button>, aria-expanded toggles, the
 * state-layer paints at the M3 0.08 / 0.10 hover / focus opacity
 * tokens.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SURFACE_CONTAINER_HIGHEST = "rgb(230, 224, 233)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_SURFACE_CONTAINER_HIGHEST = "rgb(54, 52, 59)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Accordion - M3 design parity", () => {
  test("default renders a filled accordion at shape-md (12px) + title-m header", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--default"));
    const item = page.locator("[data-variant][data-shape]").first();
    await expect(item).toBeVisible();
    await expect(item).toHaveAttribute("data-variant", "filled");
    await expect(item).toHaveAttribute("data-shape", "md");
    const radius = await item.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(radius).toBe("12px");
    const title = item.locator("[data-slot='title']").first();
    const fontSize = await title.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("16px");
  });

  test("elevated variant paints surface-container-low + on-surface + elevation-1", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--variants"));
    const item = page.locator("[data-variant='elevated']").first();
    const styles = await item.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        color: cs.color,
        shadow: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(styles.shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("filled variant paints surface-container-highest + on-surface", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--variants"));
    const item = page.locator("[data-variant='filled']").first();
    const styles = await item.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_HIGHEST);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });

  test("outlined variant paints surface fill + 1dp outline-variant border", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--variants"));
    const item = page.locator("[data-variant='outlined']").first();
    const styles = await item.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderTop: cs.borderTopWidth,
        borderColor: cs.borderTopColor,
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE);
    expect(styles.borderTop).toBe("1px");
    expect(styles.borderColor).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("size scale matches density: 48 / 56 / 72 px header heights", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--sizes"));
    const heights = await Promise.all(
      [
        "[data-size='sm']",
        "[data-size='md']",
        "[data-size='lg']",
      ].map(async (sel) => {
        const header = page.locator(`${sel} [data-slot='header']`).first();
        await expect(header).toBeVisible();
        return header.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(heights).toEqual(["48px", "56px", "72px"]);
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const item = page.locator(`[data-shape='${shape}']`).first();
      await expect(item).toBeVisible();
      const radius = await item.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius).toBe(value);
    }
  });

  test("header renders as a real <button> with aria-expanded + aria-controls", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--default"));
    const header = page.getByRole("button", { name: /Section two/ });
    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute("aria-expanded", "false");
    const controls = await header.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
  });

  test("clicking the header expands the panel and rotates the chevron", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-accordion--default", "light", "no-preference"),
    );
    const header = page.getByRole("button", { name: /Section two/ });
    await header.click();
    await expect(header).toHaveAttribute("aria-expanded", "true");
    const item = page.locator("[data-component='accordion-item']").nth(1);
    await expect(item).toHaveAttribute("data-expanded", "true");
    const chevron = item.locator("[data-slot='chevron']").first();
    await page.waitForTimeout(500);
    const transform = await chevron.evaluate(
      (el) => window.getComputedStyle(el).transform,
    );
    // 180deg rotation: matrix(-1, 0, 0, -1, 0, 0) (allowing for FP drift)
    expect(transform).toMatch(/matrix\(-1,\s*-?0,\s*-?0,\s*-1/);
  });

  test("expanded panel renders with role=region + aria-labelledby", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--default"));
    const region = page.getByRole("region", { name: "Section one" });
    await expect(region).toBeVisible();
    const labelledBy = await region.getAttribute("aria-labelledby");
    expect(labelledBy).toBe("one-header");
  });

  test("hover paints state layer at M3 0.08 hover opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-accordion--states", "light", "no-preference"),
    );
    const header = page.getByRole("button", { name: /Interactive/ });
    await header.hover();
    await page.waitForTimeout(280);
    const opacity = await header.getAttribute("data-state-layer-opacity");
    expect(parseFloat(opacity ?? "0")).toBeCloseTo(0.08, 2);
    const layer = header.locator("[data-slot='state-layer']");
    const layerOpacity = await layer.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(layerOpacity)).toBeCloseTo(0.08, 2);
  });

  test("focus paints state layer at M3 0.10 focus opacity", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-accordion--states", "light", "no-preference"),
    );
    const header = page.getByRole("button", { name: /Interactive/ });
    await header.focus();
    await page.waitForTimeout(280);
    const opacity = await header.getAttribute("data-state-layer-opacity");
    expect(parseFloat(opacity ?? "0")).toBeCloseTo(0.1, 2);
  });

  test("disabled item exposes aria-disabled + opacity 0.38 on the header", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--states"));
    const item = page.locator("[data-disabled='true']").first();
    await expect(item).toBeVisible();
    const header = item.locator("[data-slot='header']").first();
    await expect(header).toBeDisabled();
    const opacity = await header.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("slots render leading-icon + title + subhead + chevron + panel", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--slots"));
    const item = page.locator("[data-expanded='true']").first();
    await expect(item).toBeVisible();
    await expect(item.locator("[data-slot='leading-icon']")).toHaveCount(1);
    await expect(item.locator("[data-slot='title']").first()).toBeVisible();
    await expect(item.locator("[data-slot='subhead']").first()).toBeVisible();
    await expect(item.locator("[data-slot='chevron']").first()).toBeVisible();
    await expect(item.locator("[data-slot='panel']")).toHaveCount(1);
    await expect(
      item.locator("[data-slot='panel-content']"),
    ).toHaveCount(1);
  });

  test("title slot uses the M3 title-m type role (16px / weight 500)", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--slots"));
    const title = page.locator("[data-slot='title']").first();
    await expect(title).toBeVisible();
    const styles = await title.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    expect(styles.fontSize).toBe("16px");
    expect(styles.fontWeight).toBe("500");
  });

  test("subhead slot uses the M3 body-m type role (14px) + on-surface-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--slots"));
    const subhead = page.locator("[data-slot='subhead']").first();
    await expect(subhead).toBeVisible();
    const styles = await subhead.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("panel content uses body-m + on-surface-variant text color", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--slots"));
    const body = page.locator("[data-slot='panel-content']").first();
    await expect(body).toBeVisible();
    const styles = await body.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize, color: cs.color };
    });
    expect(styles.fontSize).toBe("14px");
    expect(styles.color).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-accordion--default", "light", "no-preference"),
    );
    const item = page.locator("[data-variant]").first();
    const styles = await item.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("box-shadow");
    expect(styles.property).toContain("background-color");
    expect(styles.duration).toContain("0.3s");
  });

  test("state layer paints standard easing on opacity transition", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-accordion--states", "light", "no-preference"),
    );
    const layer = page
      .getByRole("button", { name: /Interactive/ })
      .locator("[data-slot='state-layer']");
    const styles = await layer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
      };
    });
    expect(styles.property).toContain("opacity");
    expect(styles.timing).toContain(EASE_STANDARD);
  });

  test("multi-mode keeps two panels open simultaneously", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--multiple"));
    const a = page.getByRole("button", { name: /Multi-open A/ });
    const b = page.getByRole("button", { name: /Multi-open B/ });
    await expect(a).toHaveAttribute("aria-expanded", "true");
    await expect(b).toHaveAttribute("aria-expanded", "true");
  });

  test("single-mode collapses the previously open panel when another is opened", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-accordion--default", "light", "no-preference"),
    );
    const second = page.getByRole("button", { name: /Section two/ });
    const first = page.getByRole("button", { name: /Section one/ });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await second.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  });

  test("Enter key toggles the panel via keyboard", async ({ page }) => {
    await page.goto(
      storyUrl("surfaces-accordion--states", "light", "no-preference"),
    );
    const header = page.getByRole("button", { name: /Interactive/ });
    await header.focus();
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-expanded", "true");
  });

  test("dark theme swaps the filled variant to the dark surface-container-highest", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--variants", "dark"));
    const item = page.locator("[data-variant='filled']").first();
    const bg = await item.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_HIGHEST);
  });

  test("playground story renders + accepts a runtime variant control", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-accordion--playground"));
    const item = page.locator("[data-variant]").first();
    await expect(item).toBeVisible();
    await expect(item.locator("[data-slot='title']")).toHaveCount(1);
  });
});
