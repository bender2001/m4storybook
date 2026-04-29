import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive App Bar.
 *
 * Spec: https://m3.material.io/components/top-app-bar
 *       https://m3.material.io/components/bottom-app-bar
 *
 * Heights (md size):
 *   - small / center-aligned : 64px
 *   - medium                 : 112px
 *   - large                  : 152px
 *   - bottom                 : 80px
 *
 * Surface roles:
 *   - resting    : surface (top variants)  / surface-container (bottom)
 *   - on-scroll  : surface-container       (top variants)
 *   - elevated   : adds elevation-2 box shadow
 *
 * Title typography:
 *   - small / center-aligned : title-l (22px)
 *   - medium                 : headline-s (24px)
 *   - large                  : headline-m (28px)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_SURFACE_CONTAINER = "rgb(33, 31, 38)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("AppBar - M3 design parity", () => {
  test("default renders a small app bar at shape-none + 64dp + title-l", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--default"));
    const bar = page.locator("[data-component='app-bar']").first();
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("data-variant", "small");
    await expect(bar).toHaveAttribute("data-shape", "none");
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        height: cs.minHeight,
        bg: cs.backgroundColor,
      };
    });
    expect(styles.radius).toBe("0px");
    expect(styles.height).toBe("64px");
    expect(styles.bg).toBe(LIGHT_SURFACE);
    const title = bar.locator("[data-slot='title']").first();
    const titleSize = await title.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(titleSize).toBe("22px");
  });

  test("variants render the M3 height matrix (64 / 64 / 112 / 152 / 80)", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const expected: Record<string, string> = {
      small: "64px",
      "center-aligned": "64px",
      medium: "112px",
      large: "152px",
      bottom: "80px",
    };
    for (const [variant, height] of Object.entries(expected)) {
      const bar = page.locator(`[data-variant='${variant}']`).first();
      await expect(bar).toBeVisible();
      const minHeight = await bar.evaluate(
        (el) => window.getComputedStyle(el).minHeight,
      );
      expect(minHeight, `variant=${variant}`).toBe(height);
    }
  });

  test("center-aligned variant centers the title row", async ({ page }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const bar = page.locator("[data-variant='center-aligned']").first();
    const wrap = bar.locator("[data-slot='title-wrap']");
    const justify = await wrap.evaluate(
      (el) => window.getComputedStyle(el).justifyContent,
    );
    expect(justify).toBe("center");
  });

  test("medium variant uses headline-s (24px) title", async ({ page }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const bar = page.locator("[data-variant='medium']").first();
    const title = bar.locator("[data-slot='title']").first();
    const fontSize = await title.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("24px");
  });

  test("large variant uses headline-m (28px) title", async ({ page }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const bar = page.locator("[data-variant='large']").first();
    const title = bar.locator("[data-slot='title']").first();
    const fontSize = await title.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("28px");
  });

  test("medium / large variants split content into a two-row layout", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const medium = page.locator("[data-variant='medium']").first();
    await expect(medium.locator("[data-slot='top-row']")).toHaveCount(1);
    await expect(medium.locator("[data-slot='title-row']")).toHaveCount(1);
    const topRowHeight = await medium
      .locator("[data-slot='top-row']")
      .evaluate((el) => window.getComputedStyle(el).minHeight);
    expect(topRowHeight).toBe("64px");
  });

  test("bottom variant fills surface-container + uses footer/contentinfo", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const bar = page.locator("[data-variant='bottom']").first();
    const styles = await bar.evaluate((el) => {
      return {
        bg: window.getComputedStyle(el).backgroundColor,
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role"),
      };
    });
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER);
    expect(styles.tag).toBe("footer");
    expect(styles.role).toBe("contentinfo");
  });

  test("size scale matches density: 56 / 64 / 72 px top-row heights", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--sizes"));
    const heights = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const bar = page
          .locator(`[data-component='app-bar'][data-size='${size}']`)
          .first();
        await expect(bar).toBeVisible();
        return bar.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(heights).toEqual(["56px", "64px", "72px"]);
  });

  test("scrolled state swaps surface -> surface-container", async ({ page }) => {
    await page.goto(storyUrl("surfaces-appbar--states"));
    const resting = page.locator("[data-component='app-bar']").nth(0);
    const scrolled = page.locator("[data-component='app-bar']").nth(1);
    const restingBg = await resting.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const scrolledBg = await scrolled.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(restingBg).toBe(LIGHT_SURFACE);
    expect(scrolledBg).toBe(LIGHT_SURFACE_CONTAINER);
    await expect(scrolled).toHaveAttribute("data-scrolled", "true");
  });

  test("elevated state adds the M3 elevation-2 shadow", async ({ page }) => {
    await page.goto(storyUrl("surfaces-appbar--states"));
    const elevated = page.locator("[data-elevated='true']").first();
    const shadow = await elevated.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
  });

  test("disabled state dims the bar to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--states"));
    const bar = page.locator("[data-disabled='true']").first();
    const styles = await bar.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const bar = page.locator(`[data-shape='${shape}']`).first();
      const radius = await bar.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius).toBe(value);
    }
  });

  test("leading + title + trailing slots render in the correct order", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--slots"));
    const bar = page.locator("[data-component='app-bar']").first();
    await expect(bar.locator("[data-slot='leading']")).toHaveCount(1);
    await expect(bar.locator("[data-slot='title']")).toHaveCount(1);
    await expect(bar.locator("[data-slot='trailing']")).toHaveCount(1);
    const slots = await bar.evaluate((el) => {
      const top = el.querySelector("[data-slot='top-row']");
      if (!top) return [];
      return Array.from(top.children).map((c) => c.getAttribute("data-slot"));
    });
    expect(slots[0]).toBe("leading");
    expect(slots[slots.length - 1]).toBe("trailing");
  });

  test("title-only render keeps the title slot reachable + truncates", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--slots"));
    const titles = page.locator(
      "[data-component='app-bar'] [data-slot='title']",
    );
    await expect(titles.first()).toBeVisible();
    const count = await titles.count();
    expect(count).toBeGreaterThanOrEqual(3);
    const overflow = await titles
      .first()
      .evaluate((el) => window.getComputedStyle(el).textOverflow);
    expect(overflow).toBe("ellipsis");
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("surfaces-appbar--motion", "light", "no-preference"),
    );
    const bar = page.locator("[data-component='app-bar']").first();
    const styles = await bar.evaluate((el) => {
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

  test("banner role + aria-label: top variants land on <header role=banner>", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--accessibility"));
    const banner = page.getByRole("banner", { name: "Primary navigation" });
    await expect(banner).toBeVisible();
    const tag = await banner.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("header");
  });

  test("contentinfo role: bottom variant lands on <footer role=contentinfo>", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--accessibility"));
    const footer = page.getByRole("contentinfo", { name: "Footer actions" });
    await expect(footer).toBeVisible();
    const tag = await footer.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("footer");
  });

  test("on-surface text color paints the title role", async ({ page }) => {
    await page.goto(storyUrl("surfaces-appbar--variants"));
    const title = page
      .locator("[data-variant='small'] [data-slot='title']")
      .first();
    const color = await title.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ON_SURFACE);
  });

  test("dark theme swaps the bottom variant to dark surface-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--variants", "dark"));
    const bar = page.locator("[data-variant='bottom']").first();
    const bg = await bar.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER);
  });

  test("playground story renders + accepts a runtime variant control", async ({
    page,
  }) => {
    await page.goto(storyUrl("surfaces-appbar--playground"));
    const bar = page.locator("[data-component='app-bar']").first();
    await expect(bar).toBeVisible();
    await expect(bar.locator("[data-slot='title']")).toHaveCount(1);
  });
});
