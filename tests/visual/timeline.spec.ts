import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3-tokenized Timeline.
 *
 * Spec sources:
 *   - MUI Lab Timeline        https://mui.com/material-ui/react-timeline/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 list density         https://m3.material.io/components/lists/specs
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 motion tokens        https://m3.material.io/styles/motion
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * Material 3 has no formal Timeline spec, so this re-skins MUI Lab
 * Timeline onto M3 tokens (per the project's "MUI fallback" rule).
 * The active-dot cursor is a halo painted in `ring-primary` on the
 * focused dot, springing between rows via a shared `layoutId` motion
 * span — the same M3 Expressive selection morph used by Tabs /
 * Stepper / Pagination / DataGrid / TreeView.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_SECONDARY = "rgb(98, 91, 113)";
const LIGHT_TERTIARY = "rgb(125, 82, 96)";
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

test.describe("Timeline - M3 design parity", () => {
  test("default timeline renders role=list + role=listitem + aria attributes", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--default"));
    const wrapper = page.locator("[data-component='timeline']").first();
    await expect(wrapper).toBeVisible();
    await expect(wrapper).toHaveAttribute("data-variant", "text");
    await expect(wrapper).toHaveAttribute("data-size", "md");
    await expect(wrapper).toHaveAttribute("data-shape", "md");
    await expect(wrapper).toHaveAttribute("data-position", "right");
    const list = page.locator("[role='list']").first();
    await expect(list).toBeVisible();
    const items = page.locator("[role='listitem']");
    expect(await items.count()).toBeGreaterThan(0);
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("advanced-timeline--variants"));
    const expected: Record<string, string> = {
      text: TRANSPARENT,
      filled: LIGHT_SURFACE_CONTAINER_HIGHEST,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: TRANSPARENT,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const wrap = page
        .locator(`[data-component='timeline'][data-variant='${variant}']`)
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
    await page.goto(storyUrl("advanced-timeline--variants"));
    const wrap = page
      .locator("[data-component='timeline'][data-variant='outlined']")
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
    await page.goto(storyUrl("advanced-timeline--variants"));
    const wrap = page
      .locator("[data-component='timeline'][data-variant='elevated']")
      .first();
    const shadow = await wrap.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(shadow).toContain("rgba(0, 0, 0, 0.3)");
    expect(shadow).toContain("rgba(0, 0, 0, 0.15)");
    expect(shadow).toContain("6px");
  });

  test("size scale: 24 / 28 / 36 px dot diameters for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--sizes"));
    const measured = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const dot = page
          .locator(
            `[data-component='timeline'][data-size='${size}'] [data-slot='dot']`,
          )
          .first();
        await expect(dot).toBeVisible();
        return dot.evaluate((el) => window.getComputedStyle(el).height);
      }),
    );
    expect(measured).toEqual(["24px", "28px", "36px"]);
  });

  test("body label typography steps body-s / body-m / body-l for sm / md / lg", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--sizes"));
    const expected: Record<string, string> = {
      sm: "12px",
      md: "14px",
      lg: "16px",
    };
    for (const [size, fontSize] of Object.entries(expected)) {
      const label = page
        .locator(
          `[data-component='timeline'][data-size='${size}'] [data-slot='label']`,
        )
        .first();
      const measured = await label.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );
      expect(measured, `size=${size}`).toBe(fontSize);
    }
  });

  test("disabled item paints the M3 disabled wash + aria-disabled", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(storyUrl("advanced-timeline--states"));
    const item = page
      .locator(
        "[data-component='timeline-item'][data-id='disabled']",
      )
      .first();
    await expect(item).toBeVisible();
    // Opacity is routed through motion.li's `animate` prop because
    // motion/react writes inline `opacity` that beats the CSS class.
    // Poll until the spring settles on 0.38.
    await expect
      .poll(() =>
        item.evaluate((el) => parseFloat(window.getComputedStyle(el).opacity)),
      )
      .toBeCloseTo(0.38, 2);
    const content = page
      .locator(
        "[data-component='timeline-content'][data-id='disabled']",
      )
      .first();
    await expect(content).toHaveAttribute("aria-disabled", "true");
  });

  test("error item paints the M3 error foreground role", async ({ page }) => {
    await page.goto(storyUrl("advanced-timeline--states"));
    const content = page
      .locator(
        "[data-component='timeline-content'][data-id='error']",
      )
      .first();
    await expect(content).toBeVisible();
    const color = await content.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    expect(color).toBe(LIGHT_ERROR);
  });

  test("selected row paints secondary-container + on-secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--states"));
    const selected = page
      .locator(
        "[data-component='timeline-content'][data-selected='true']",
      )
      .first();
    await expect(selected).toBeVisible();
    const styles = await selected.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("shape scale renders the canonical M3 radii", async ({ page }) => {
    await page.goto(storyUrl("advanced-timeline--shapes"));
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
        .locator(`[data-component='timeline'][data-shape='${shape}']`)
        .first();
      const radius = await wrap.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
    const fullPill = page
      .locator("[data-component='timeline'][data-shape='full']")
      .first();
    const fullRadius = await fullPill.evaluate(
      (el) => window.getComputedStyle(el).borderTopLeftRadius,
    );
    expect(fullRadius).toBe("9999px");
  });

  test("opposite content + dot icon + secondary slots all render", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--slots"));
    const all = page
      .locator(
        "[data-component='timeline-item'][data-id='all-slots']",
      )
      .first();
    await expect(all).toBeVisible();
    const opp = all.locator("[data-slot='opposite-content']");
    const icon = all.locator("[data-slot='dot-icon']");
    const sec = all.locator("[data-slot='secondary']");
    const lab = all.locator("[data-slot='label']");
    await expect(opp).toBeVisible();
    await expect(icon).toBeVisible();
    await expect(sec).toBeVisible();
    await expect(lab).toHaveText("All slots filled");
  });

  test("dot color matrix: primary + secondary + tertiary fills resolve to M3 roles", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--default"));
    const expected: Record<string, string> = {
      kickoff: LIGHT_PRIMARY,
      design: LIGHT_SECONDARY,
    };
    for (const [id, color] of Object.entries(expected)) {
      const dot = page
        .locator(
          `[data-component='timeline-item'][data-id='${id}'] [data-slot='dot']`,
        )
        .first();
      const bg = await dot.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `id=${id}`).toBe(color);
    }
  });

  test("tertiary outlined dot paints transparent fill with tertiary ring", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--default"));
    const dot = page
      .locator(
        "[data-component='timeline-item'][data-id='build'] [data-slot='dot']",
      )
      .first();
    const styles = await dot.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        ring: cs.boxShadow,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    // Tailwind ring is rendered as an inset box-shadow that contains
    // the ring color string. Tertiary -> rgb(125, 82, 96).
    expect(styles.ring).toContain(LIGHT_TERTIARY.slice(4, -1));
  });

  test("dashed connector renders as a dashed border instead of a solid bar", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--default"));
    const connector = page
      .locator(
        "[data-component='timeline-item'][data-id='build'] [data-slot='connector']",
      )
      .first();
    const styles = await connector.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        style: cs.borderLeftStyle,
        bg: cs.backgroundColor,
      };
    });
    expect(styles.style).toBe("dashed");
    expect(styles.bg).toBe(TRANSPARENT);
  });

  test("last item omits the trailing connector", async ({ page }) => {
    await page.goto(storyUrl("advanced-timeline--default"));
    const lastItem = page
      .locator(
        "[data-component='timeline-item'][data-id='ship']",
      )
      .first();
    await expect(lastItem).toBeVisible();
    const connector = lastItem.locator("[data-slot='connector']");
    await expect(connector).toHaveCount(0);
  });

  test("position=alternate flips even items to the left layout", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--positions"));
    await page.waitForLoadState("networkidle");
    const wrap = page
      .locator("[data-component='timeline'][data-position='alternate']")
      .first();
    const items = wrap.locator("[data-component='timeline-item']");
    await expect(items.first()).toBeAttached();
    await expect.poll(() => items.count()).toBeGreaterThanOrEqual(2);
    const layouts = await items.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-layout")),
    );
    expect(layouts.length).toBeGreaterThanOrEqual(2);
    expect(layouts[0]).toBe("right");
    expect(layouts[1]).toBe("left");
  });

  test("position=left forces every item to the left layout", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--positions"));
    await page.waitForLoadState("networkidle");
    const wrap = page
      .locator("[data-component='timeline'][data-position='left']")
      .first();
    const items = wrap.locator("[data-component='timeline-item']");
    await expect(items.first()).toBeAttached();
    await expect.poll(() => items.count()).toBeGreaterThanOrEqual(2);
    const layouts = await items.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-layout")),
    );
    expect(layouts.every((l) => l === "left")).toBe(true);
  });

  test("M3 motion: emphasized easing + medium2 (300ms) on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("advanced-timeline--default", "light", "no-preference"),
    );
    const wrap = page.locator("[data-component='timeline']").first();
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

  test("ARIA wiring: selectable timeline marks the focused row aria-current=step", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--accessibility"));
    const focused = page
      .locator(
        "[data-component='timeline-content'][aria-current='step']",
      )
      .first();
    await expect(focused).toBeVisible();
    await expect(focused).toHaveAttribute("data-id", "design");
  });

  test("active-dot cursor paints a primary ring on the focused row", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--accessibility"));
    const cursor = page
      .locator("[data-slot='timeline-cursor']")
      .first();
    await expect(cursor).toBeVisible();
    const ring = await cursor.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(ring).toContain(LIGHT_PRIMARY.slice(4, -1));
  });

  test("dark theme swaps elevated timeline to dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--accessibility", "dark"));
    const wrap = page.locator("[data-component='timeline']").first();
    const bg = await wrap.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("clicking an interactive row flips aria-selected and stays focusable", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--selectable"));
    const row = page
      .locator(
        "[data-component='timeline-content'][data-id='kickoff']",
      )
      .first();
    const before = await row.getAttribute("aria-selected");
    await row.click();
    const after = await row.getAttribute("aria-selected");
    expect(before).not.toBe(after);
  });

  test("ArrowDown advances focus to the next row in selectable mode", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--selectable"));
    const first = page
      .locator(
        "[data-component='timeline-content'][data-id='design']",
      )
      .first();
    await first.focus();
    await page.keyboard.press("ArrowDown");
    const focused = page
      .locator(
        "[data-component='timeline-content'][data-focused='true']",
      )
      .first();
    await expect(focused).toHaveAttribute("data-id", "build");
  });

  test("playground story renders a timeline with the canonical default props", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--playground"));
    const wrap = page.locator("[data-component='timeline']").first();
    await expect(wrap).toBeVisible();
    await expect(wrap).toHaveAttribute("data-variant", "filled");
    await expect(wrap).toHaveAttribute("data-size", "md");
    await expect(wrap).toHaveAttribute("data-selectable", "true");
  });

  test("text variant renders transparent host with on-surface foreground", async ({
    page,
  }) => {
    await page.goto(storyUrl("advanced-timeline--variants"));
    const wrap = page
      .locator("[data-component='timeline'][data-variant='text']")
      .first();
    const styles = await wrap.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_ON_SURFACE);
  });
});
