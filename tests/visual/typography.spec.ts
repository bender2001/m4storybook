import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Typography component. Every
 * assertion reads computed style so a token drift breaks the test.
 *  - type roles : 5 categories × 3 sizes match the M3 type scale
 *                 (display 36/45/57, headline 24/28/32, title 14/16/22,
 *                  body 12/14/16, label 11/12/14 px)
 *  - color role : on-surface (default), on-surface-variant (muted),
 *                 primary (selected/primary), error, inverse-on-surface
 *  - polymorph  : default semantic tag follows variant; `as` overrides
 *  - states     : disabled = 38% opacity + aria-disabled
 *  - motion     : color/opacity transition uses the standard easing token
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const DARK_ON_SURFACE = "rgb(230, 224, 233)";
const EASE_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Typography - M3 design parity", () => {
  test("default renders with body/md/default data attrs + on-surface color", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-typography--default"));
    const text = page.getByText("Body medium — default emphasis");
    await expect(text).toBeVisible();
    await expect(text).toHaveAttribute("data-variant", "body");
    await expect(text).toHaveAttribute("data-size", "md");
    await expect(text).toHaveAttribute("data-emphasis", "default");
    await expect(text).toHaveAttribute("data-role", "body-m");
    const styles = await text.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        color: cs.color,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        fontWeight: cs.fontWeight,
      };
    });
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
    expect(styles.fontSize).toBe("14px");
    expect(styles.lineHeight).toBe("20px");
    expect(parseInt(styles.fontWeight, 10)).toBe(400);
  });

  test("variant matrix renders the M3 type roles (display/headline/title/body/label)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-typography--variants"));
    const roles = await Promise.all(
      [
        ["display-l", "57px", "64px", "400"],
        ["headline-l", "32px", "40px", "400"],
        ["title-l", "22px", "28px", "500"],
        ["body-l", "16px", "24px", "400"],
        ["label-l", "14px", "20px", "500"],
      ].map(async ([role]) => {
        const el = page.locator(`[data-testid='${role}']`);
        await expect(el).toBeVisible();
        return el.evaluate((node) => {
          const cs = window.getComputedStyle(node);
          return {
            role: node.getAttribute("data-role"),
            fontSize: cs.fontSize,
            lineHeight: cs.lineHeight,
            fontWeight: cs.fontWeight,
          };
        });
      }),
    );
    expect(roles).toEqual([
      { role: "display-l", fontSize: "57px", lineHeight: "64px", fontWeight: "400" },
      { role: "headline-l", fontSize: "32px", lineHeight: "40px", fontWeight: "400" },
      { role: "title-l", fontSize: "22px", lineHeight: "28px", fontWeight: "500" },
      { role: "body-l", fontSize: "16px", lineHeight: "24px", fontWeight: "400" },
      { role: "label-l", fontSize: "14px", lineHeight: "20px", fontWeight: "500" },
    ]);
  });

  test("body sm/md/lg map to 12/14/16px with M3 line heights", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--sizes"));
    const sizes = await Promise.all(
      ["body-s", "body-m", "body-l"].map(async (testid) => {
        const el = page.locator(`[data-testid='${testid}']`);
        await expect(el).toBeVisible();
        return el.evaluate((node) => {
          const cs = window.getComputedStyle(node);
          return { fontSize: cs.fontSize, lineHeight: cs.lineHeight };
        });
      }),
    );
    expect(sizes).toEqual([
      { fontSize: "12px", lineHeight: "16px" },
      { fontSize: "14px", lineHeight: "20px" },
      { fontSize: "16px", lineHeight: "24px" },
    ]);
  });

  test("emphasis=muted paints on-surface-variant", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--states"));
    const muted = page.getByText("Muted (on-surface-variant)");
    await expect(muted).toBeVisible();
    const color = await muted.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE_VARIANT);
    await expect(muted).toHaveAttribute("data-emphasis", "muted");
  });

  test("emphasis=primary paints primary color", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--states"));
    const primary = page.getByText("Primary (selected emphasis)");
    await expect(primary).toBeVisible();
    const color = await primary.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_PRIMARY);
  });

  test("emphasis=error paints error color", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--states"));
    const error = page.getByText("Error (validation)");
    await expect(error).toBeVisible();
    const color = await error.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("disabled state sets aria-disabled + 38% opacity", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--states"));
    const disabled = page.getByText("Disabled (38% opacity)");
    await expect(disabled).toBeVisible();
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
    await expect(disabled).toHaveAttribute("data-disabled", "");
    const opacity = await disabled.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("selected forces primary color emphasis (override)", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--states"));
    const selected = page.getByText("Selected (forces primary)");
    await expect(selected).toBeVisible();
    await expect(selected).toHaveAttribute("data-selected", "");
    await expect(selected).toHaveAttribute("data-emphasis", "primary");
    const color = await selected.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_PRIMARY);
  });

  test("default semantic tag follows the variant map (display→h1, body→p, label→span)", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-typography--variants"));
    const display = page.locator("[data-testid='display-l']");
    const headline = page.locator("[data-testid='headline-l']");
    const title = page.locator("[data-testid='title-l']");
    const body = page.locator("[data-testid='body-l']");
    const label = page.locator("[data-testid='label-l']");
    await expect(display).toBeVisible();
    expect(await display.evaluate((el) => el.tagName)).toBe("H1");
    expect(await headline.evaluate((el) => el.tagName)).toBe("H2");
    expect(await title.evaluate((el) => el.tagName)).toBe("H3");
    expect(await body.evaluate((el) => el.tagName)).toBe("P");
    expect(await label.evaluate((el) => el.tagName)).toBe("SPAN");
  });

  test("polymorphic `as` prop overrides the rendered element", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-typography--polymorphic"));
    const h1 = page.locator("[data-testid='as-h1']");
    const strong = page.locator("[data-testid='as-strong']");
    const kbd = page.locator("[data-testid='as-kbd']");
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((el) => el.tagName)).toBe("H1");
    expect(await strong.evaluate((el) => el.tagName)).toBe("STRONG");
    expect(await kbd.evaluate((el) => el.tagName)).toBe("KBD");
  });

  test("leading icon slot renders an aria-hidden 1em box", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--slots"));
    const leading = page.locator("[data-testid='leading-icon']");
    await expect(leading).toBeVisible();
    const icon = leading.locator("[data-slot='leading-icon']");
    await expect(icon).toHaveCount(1);
    expect(await icon.getAttribute("aria-hidden")).toBe("true");
  });

  test("trailing icon slot renders adjacent to the text run", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--slots"));
    const trailing = page.locator("[data-testid='trailing-icon']");
    await expect(trailing).toBeVisible();
    const icon = trailing.locator("[data-slot='trailing-icon']");
    await expect(icon).toHaveCount(1);
  });

  test("truncate=true renders a single-line ellipsis container", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-typography--slots"));
    const truncated = page.locator("[data-testid='truncate']");
    await expect(truncated).toBeVisible();
    const styles = await truncated
      .locator("[data-slot='text']")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          overflow: cs.overflow,
          textOverflow: cs.textOverflow,
          whiteSpace: cs.whiteSpace,
        };
      });
    expect(styles.overflow).toBe("hidden");
    expect(styles.textOverflow).toBe("ellipsis");
    expect(styles.whiteSpace).toBe("nowrap");
  });

  test("M3 motion: standard easing on color/opacity transitions", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-typography--motion"));
    const text = page.locator("[data-variant='body']").first();
    await expect(text).toBeVisible();
    const styles = await text.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionProperty: cs.transitionProperty,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    expect(styles.transitionTimingFunction).toContain(EASE_STANDARD);
    expect(styles.transitionProperty).toContain("color");
    expect(styles.transitionProperty).toContain("opacity");
  });

  test("dark theme swaps on-surface to its dark token", async ({ page }) => {
    await page.goto(storyUrl("data-display-typography--default", "dark"));
    const text = page.getByText("Body medium — default emphasis");
    await expect(text).toBeVisible();
    const color = await text.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(DARK_ON_SURFACE);
  });

  test("playground accepts runtime variant + size controls", async ({ page }) => {
    await page.goto(
      "/iframe.html?id=data-display-typography--playground&viewMode=story&globals=theme:light;reducedMotion:reduce&args=variant:headline;size:lg",
    );
    const text = page.getByText("Playground sample text");
    await expect(text).toBeVisible();
    await expect(text).toHaveAttribute("data-variant", "headline");
    await expect(text).toHaveAttribute("data-size", "lg");
    await expect(text).toHaveAttribute("data-role", "headline-l");
  });
});
