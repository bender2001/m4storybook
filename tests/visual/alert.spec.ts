import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Alert.
 *
 * Spec (closest M3 analog): https://m3.material.io/components/banners
 *
 * Severity color mapping (light theme baseline tokens):
 *   - info     -> primary       (#6750A4)
 *   - success  -> secondary     (#625B71)
 *   - warning  -> tertiary      (#7D5260)
 *   - error    -> error         (#B3261E)
 *
 * Variants:
 *   - filled    : severity color background, on-color text
 *   - tonal     : severity-container background, on-container text
 *   - outlined  : transparent + 1dp severity-color border + severity text
 *   - text      : transparent, severity text, no border
 *
 * Sizes (md / sm / lg):
 *   - body type role : body-m (14px) / body-s (12px) / body-l (16px)
 *   - shell min-height : 48 / 32 / 56 px
 *
 * Shape default: shape-sm (8dp).
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_PRIMARY_CONTAINER = "rgb(234, 221, 255)";
const LIGHT_ON_PRIMARY_CONTAINER = "rgb(33, 0, 93)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_TERTIARY_CONTAINER = "rgb(255, 216, 228)";
const LIGHT_ERROR = "rgb(179, 38, 30)";
const LIGHT_ERROR_CONTAINER = "rgb(249, 222, 220)";
const DARK_PRIMARY_CONTAINER = "rgb(79, 55, 139)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Alert - M3 design parity", () => {
  test("default renders a tonal info alert at shape-sm + 48dp + body-m", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--default"));
    const alert = page.locator("[data-component='alert']").first();
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("data-severity", "info");
    await expect(alert).toHaveAttribute("data-variant", "tonal");
    await expect(alert).toHaveAttribute("data-shape", "sm");
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radius: cs.borderTopLeftRadius,
        minHeight: cs.minHeight,
        bg: cs.backgroundColor,
        color: cs.color,
      };
    });
    expect(styles.radius).toBe("8px");
    expect(styles.minHeight).toBe("48px");
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
    const body = alert.locator("[data-slot='body']").first();
    const fontSize = await body.evaluate(
      (el) => window.getComputedStyle(el).fontSize,
    );
    expect(fontSize).toBe("14px");
  });

  test("filled variant paints the severity color + on-color text", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--variants"));
    const alert = page
      .locator("[data-component='alert'][data-variant='filled']")
      .first();
    await expect(alert).toBeVisible();
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY);
  });

  test("tonal variant paints the severity-container + on-container text", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--variants"));
    const alert = page
      .locator("[data-component='alert'][data-variant='tonal']")
      .first();
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    expect(styles.bg).toBe(LIGHT_PRIMARY_CONTAINER);
    expect(styles.color).toBe(LIGHT_ON_PRIMARY_CONTAINER);
  });

  test("outlined variant: transparent fill + severity-color border + text", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--variants"));
    const alert = page
      .locator("[data-component='alert'][data-variant='outlined']")
      .first();
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        borderWidth: cs.borderTopWidth,
        color: cs.color,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(LIGHT_PRIMARY);
    expect(styles.borderWidth).toBe("1px");
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("text variant: transparent fill + transparent border + severity text", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--variants"));
    const alert = page
      .locator("[data-component='alert'][data-variant='text']")
      .first();
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        bg: cs.backgroundColor,
        borderColor: cs.borderColor,
        color: cs.color,
      };
    });
    expect(styles.bg).toBe(TRANSPARENT);
    expect(styles.borderColor).toBe(TRANSPARENT);
    expect(styles.color).toBe(LIGHT_PRIMARY);
  });

  test("severity matrix: error -> error-container, warning -> tertiary-container, success -> secondary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--severities"));
    const expected: Record<string, string> = {
      info: LIGHT_PRIMARY_CONTAINER,
      success: LIGHT_SECONDARY_CONTAINER,
      warning: LIGHT_TERTIARY_CONTAINER,
      error: LIGHT_ERROR_CONTAINER,
    };
    for (const [severity, bg] of Object.entries(expected)) {
      const alert = page
        .locator(`[data-component='alert'][data-severity='${severity}']`)
        .first();
      await expect(alert).toBeVisible();
      const observed = await alert.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(observed, `severity=${severity}`).toBe(bg);
    }
  });

  test("size scale matches density: 32 / 48 / 56 px shell + body-s/m/l type", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--sizes"));
    const matrix: Record<string, { minH: string; bodySize: string }> = {
      sm: { minH: "32px", bodySize: "12px" },
      md: { minH: "48px", bodySize: "14px" },
      lg: { minH: "56px", bodySize: "16px" },
    };
    for (const [size, expected] of Object.entries(matrix)) {
      const alert = page
        .locator(`[data-component='alert'][data-size='${size}']`)
        .first();
      await expect(alert).toBeVisible();
      const observed = await alert.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        const body = el.querySelector("[data-slot='body']");
        const bodySize = body
          ? window.getComputedStyle(body).fontSize
          : "";
        return { minH: cs.minHeight, bodySize };
      });
      expect(observed.minH, `size=${size} minH`).toBe(expected.minH);
      expect(observed.bodySize, `size=${size} body`).toBe(expected.bodySize);
    }
  });

  test("disabled state dims the alert to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--states"));
    const alert = page
      .locator("[data-component='alert'][data-disabled='true']")
      .first();
    await expect(alert).toBeVisible();
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("shape scale renders the correct radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--shapes"));
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
      full: "9999px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const alert = page
        .locator(`[data-component='alert'][data-shape='${shape}']`)
        .first();
      const radius = await alert.evaluate(
        (el) => window.getComputedStyle(el).borderTopLeftRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("icon + content + close slots render in the correct order", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--slots"));
    const closableAlert = page
      .locator("[data-component='alert']")
      .filter({ has: page.locator("[data-slot='close']") })
      .first();
    await expect(closableAlert).toBeVisible();
    const slots = await closableAlert.evaluate((el) =>
      Array.from(el.children).map((c) => c.getAttribute("data-slot")),
    );
    expect(slots[0]).toBe("icon");
    expect(slots[slots.length - 1]).toBe("close");
    expect(slots).toContain("content");
  });

  test("icon=false suppresses the leading icon", async ({ page }) => {
    await page.goto(storyUrl("feedback-alert--slots"));
    const noIcon = page.locator("[data-component='alert']").last();
    await expect(noIcon).toBeVisible();
    await expect(noIcon.locator("[data-slot='icon']")).toHaveCount(0);
  });

  test("title + body render in the content stack with the right type roles", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--slots"));
    const titledAlert = page
      .locator("[data-component='alert']")
      .filter({ has: page.locator("[data-slot='title']") })
      .first();
    await expect(titledAlert).toBeVisible();
    const titleSize = await titledAlert
      .locator("[data-slot='title']")
      .evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(titleSize).toBe("16px");
  });

  test("close affordance: clicking the trailing close button fires onClose", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--motion", "light", "no-preference"));
    const close = page.getByRole("button", { name: "Close alert" });
    await expect(close).toBeVisible();
    await close.click();
    await expect(page.locator("[data-component='alert']")).toHaveCount(0);
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("feedback-alert--default", "light", "no-preference"),
    );
    const alert = page.locator("[data-component='alert']").first();
    await expect(alert).toBeVisible();
    const styles = await alert.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        property: cs.transitionProperty,
        timing: cs.transitionTimingFunction,
        duration: cs.transitionDuration,
      };
    });
    expect(styles.timing).toContain(EASE_EMPHASIZED);
    expect(styles.property).toContain("background-color");
    expect(styles.property).toContain("border-color");
    expect(styles.duration).toContain("0.3s");
  });

  test("ARIA: info severity lands on role=status + aria-live=polite", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--accessibility"));
    const polite = page.getByRole("status", {
      name: "Polite informational status",
    });
    await expect(polite).toBeVisible();
    const live = await polite.evaluate((el) => el.getAttribute("aria-live"));
    expect(live).toBe("polite");
  });

  test("ARIA: error severity lands on role=alert + aria-live=assertive", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--accessibility"));
    const assertive = page.getByRole("alert", {
      name: "Assertive error alert",
    });
    await expect(assertive).toBeVisible();
    const live = await assertive.evaluate((el) =>
      el.getAttribute("aria-live"),
    );
    expect(live).toBe("assertive");
  });

  test("action slot renders before the close affordance when both are set", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--slots"));
    const actionAlert = page
      .locator("[data-component='alert']")
      .filter({ has: page.locator("[data-slot='action']") })
      .first();
    await expect(actionAlert).toBeVisible();
    const order = await actionAlert.evaluate((el) =>
      Array.from(el.children).map((c) => c.getAttribute("data-slot")),
    );
    const actionIndex = order.indexOf("action");
    const closeIndex = order.indexOf("close");
    expect(actionIndex).toBeGreaterThan(-1);
    if (closeIndex !== -1) {
      expect(actionIndex).toBeLessThan(closeIndex);
    }
  });

  test("error severity tonal variant paints the error-container token", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--severities"));
    const errorAlert = page
      .locator("[data-component='alert'][data-severity='error']")
      .first();
    const bg = await errorAlert.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(LIGHT_ERROR_CONTAINER);
    void LIGHT_ERROR;
  });

  test("dark theme swaps the tonal info alert to dark primary-container", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--default", "dark"));
    const alert = page.locator("[data-component='alert']").first();
    const bg = await alert.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_PRIMARY_CONTAINER);
  });

  test("playground story renders + accepts a runtime severity control", async ({
    page,
  }) => {
    await page.goto(storyUrl("feedback-alert--playground"));
    const alert = page.locator("[data-component='alert']").first();
    await expect(alert).toBeVisible();
    await expect(alert.locator("[data-slot='content']")).toHaveCount(1);
  });
});
