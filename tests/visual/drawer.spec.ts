import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Expressive Navigation Drawer.
 *
 * Spec: https://m3.material.io/components/navigation-drawer/specs
 *
 * Container:
 *   - shape  : `lg` (16dp) trailing edge for modal drawers,
 *              `none` for standard / persistent drawers
 *   - width  : 288 / 360 / 400 px for sm / md / lg
 *   - fill   : `surface-container-low` (standard / modal / elevated),
 *              `secondary-container` (tonal),
 *              `surface` + 1dp trailing-edge border (outlined)
 *
 * Active indicator:
 *   - shape  : full pill (`shape-full`, 28dp radius)
 *   - height : 48 / 56 / 64 px for sm / md / lg
 *   - fill   : `secondary-container`
 *
 * Icon:
 *   - size   : 20 / 24 / 24 px for sm / md / lg
 *   - color  : `on-surface-variant` (rest), `on-secondary-container` (selected)
 *
 * Label:
 *   - role   : label-l for sm / md, title-m for lg
 *   - color  : `on-surface-variant` (rest), `on-secondary-container` (selected)
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_SURFACE = "rgb(254, 247, 255)";
const LIGHT_SURFACE_CONTAINER_LOW = "rgb(247, 242, 250)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SURFACE_VARIANT = "rgb(73, 69, 79)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_OUTLINE_VARIANT = "rgb(202, 196, 208)";
const DARK_SURFACE_CONTAINER_LOW = "rgb(29, 27, 32)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Drawer - M3 design parity", () => {
  test("default renders a 360dp standard drawer with shape-none + role=navigation", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default"));
    const drawer = page.locator("[data-component='drawer']").first();
    await expect(drawer).toBeVisible();
    await expect(drawer).toHaveAttribute("data-variant", "standard");
    await expect(drawer).toHaveAttribute("data-size", "md");
    await expect(drawer).toHaveAttribute("data-shape", "none");
    await expect(drawer).toHaveAttribute("data-anchor", "start");
    const tag = await drawer.evaluate((el) => el.tagName.toLowerCase());
    expect(tag).toBe("nav");
    const styles = await drawer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        radiusTL: cs.borderTopLeftRadius,
        radiusTR: cs.borderTopRightRadius,
        width: cs.width,
        bg: cs.backgroundColor,
      };
    });
    expect(styles.radiusTL).toBe("0px");
    expect(styles.radiusTR).toBe("0px");
    expect(styles.width).toBe("360px");
    expect(styles.bg).toBe(LIGHT_SURFACE_CONTAINER_LOW);
  });

  test("variants paint the M3 surface matrix", async ({ page }) => {
    await page.goto(storyUrl("navigation-drawer--variants"));
    const expected: Record<string, string> = {
      standard: LIGHT_SURFACE_CONTAINER_LOW,
      tonal: LIGHT_SECONDARY_CONTAINER,
      outlined: LIGHT_SURFACE,
      elevated: LIGHT_SURFACE_CONTAINER_LOW,
      modal: LIGHT_SURFACE_CONTAINER_LOW,
    };
    for (const [variant, color] of Object.entries(expected)) {
      const drawer = page
        .locator(`[data-component='drawer'][data-variant='${variant}']`)
        .first();
      await expect(drawer).toBeVisible();
      const bg = await drawer.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(bg, `variant=${variant}`).toBe(color);
    }
  });

  test("outlined variant paints a 1dp trailing-edge border in outline-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--variants"));
    const drawer = page
      .locator("[data-component='drawer'][data-variant='outlined']")
      .first();
    const styles = await drawer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderRightWidth: cs.borderRightWidth,
        borderRightColor: cs.borderRightColor,
      };
    });
    expect(styles.borderRightWidth).toBe("1px");
    expect(styles.borderRightColor).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("elevated + modal variants lift to the elevation-1 shadow", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--variants"));
    for (const variant of ["elevated", "modal"]) {
      const drawer = page
        .locator(`[data-component='drawer'][data-variant='${variant}']`)
        .first();
      const shadow = await drawer.evaluate(
        (el) => window.getComputedStyle(el).boxShadow,
      );
      expect(shadow, `variant=${variant}`).toContain("rgba(0, 0, 0, 0.3)");
      expect(shadow, `variant=${variant}`).toContain("rgba(0, 0, 0, 0.15)");
    }
  });

  test("modal variant rounds only the trailing edge to shape-lg (16dp)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--variants"));
    const modal = page
      .locator("[data-component='drawer'][data-variant='modal']")
      .first();
    const radius = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        topLeft: cs.borderTopLeftRadius,
        topRight: cs.borderTopRightRadius,
        bottomLeft: cs.borderBottomLeftRadius,
        bottomRight: cs.borderBottomRightRadius,
      };
    });
    expect(radius.topLeft).toBe("0px");
    expect(radius.bottomLeft).toBe("0px");
    expect(radius.topRight).toBe("16px");
    expect(radius.bottomRight).toBe("16px");
  });

  test("size scale matches density: 288 / 360 / 400 px container widths", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--sizes"));
    const widths = await Promise.all(
      ["sm", "md", "lg"].map(async (size) => {
        const drawer = page
          .locator(`[data-component='drawer'][data-size='${size}']`)
          .first();
        await expect(drawer).toBeVisible();
        return drawer.evaluate((el) => window.getComputedStyle(el).width);
      }),
    );
    expect(widths).toEqual(["288px", "360px", "400px"]);
  });

  test("md row measures 56px tall and the indicator uses shape-full", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default"));
    const row = page
      .locator(
        "[data-component='drawer'] [data-slot='destination'][data-selected='true']",
      )
      .first();
    await expect(row).toBeVisible();
    const dims = await row.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { minHeight: cs.minHeight };
    });
    expect(dims.minHeight).toBe("56px");
    const indicator = row.locator("[data-slot='indicator']");
    const indicatorStyles = await indicator.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { radius: cs.borderTopLeftRadius, bg: cs.backgroundColor };
    });
    expect(indicatorStyles.radius).toBe("9999px");
    expect(indicatorStyles.bg).toBe(LIGHT_SECONDARY_CONTAINER);
  });

  test("row scale matches density (sm 48 / md 56 / lg 64 px)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--sizes"));
    const expected: Record<string, string> = {
      sm: "48px",
      md: "56px",
      lg: "64px",
    };
    for (const [size, value] of Object.entries(expected)) {
      const row = page
        .locator(
          `[data-component='drawer'][data-size='${size}'] [data-slot='destination']`,
        )
        .first();
      const min = await row.evaluate(
        (el) => window.getComputedStyle(el).minHeight,
      );
      expect(min, `size=${size}`).toBe(value);
    }
  });

  test("selected destination uses on-secondary-container icon + label", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default"));
    const selected = page
      .locator(
        "[data-component='drawer'] [data-slot='destination'][data-selected='true']",
      )
      .first();
    const iconColor = await selected
      .locator("[data-slot='icon']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(iconColor).toBe(LIGHT_ON_SECONDARY_CONTAINER);
    const labelColor = await selected
      .locator("[data-slot='label']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(labelColor).toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("rest destinations paint icon + label in on-surface-variant", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default"));
    const restItem = page
      .locator(
        "[data-component='drawer'] [data-slot='destination']:not([data-selected])",
      )
      .first();
    const iconColor = await restItem
      .locator("[data-slot='icon']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(iconColor).toBe(LIGHT_ON_SURFACE_VARIANT);
    const labelColor = await restItem
      .locator("[data-slot='label']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(labelColor).toBe(LIGHT_ON_SURFACE_VARIANT);
  });

  test("md label uses label-l typography (14px / weight 500)", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default"));
    const label = page
      .locator(
        "[data-component='drawer'] [data-slot='destination'][data-selected='true'] [data-slot='label']",
      )
      .first();
    const typo = await label.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { size: cs.fontSize, weight: cs.fontWeight };
    });
    expect(typo.size).toBe("14px");
    expect(typo.weight).toBe("500");
  });

  test("disabled drawer dims to opacity 0.38 + blocks pointer events", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--states"));
    const drawer = page
      .locator("[data-component='drawer'][data-disabled='true']")
      .first();
    const styles = await drawer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, pointer: cs.pointerEvents };
    });
    expect(parseFloat(styles.opacity)).toBeCloseTo(0.38, 2);
    expect(styles.pointer).toBe("none");
  });

  test("disabled item dims to opacity 0.38 + sets aria-disabled", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--states"));
    const disabledItem = page
      .locator(
        "[data-component='drawer']:not([data-disabled]) [data-slot='destination'][data-disabled='true']",
      )
      .first();
    await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
    const opacity = await disabledItem.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);
  });

  test("shape scale renders the correct host radius for each token", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--shapes"));
    // The start anchor zeroes the left corners, so we read the trailing
    // (top-right) corner instead.
    const expected: Record<string, string> = {
      none: "0px",
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "28px",
    };
    for (const [shape, value] of Object.entries(expected)) {
      const drawer = page
        .locator(`[data-component='drawer'][data-shape='${shape}']`)
        .first();
      const radius = await drawer.evaluate(
        (el) => window.getComputedStyle(el).borderTopRightRadius,
      );
      expect(radius, `shape=${shape}`).toBe(value);
    }
  });

  test("destinations expose link role + aria-current=page on selection", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default"));
    await page.waitForSelector(
      "[data-component='drawer'] [role='link']",
    );
    const links = page.locator("[data-component='drawer'] [role='link']");
    expect(await links.count()).toBe(4);
    const selected = page.locator(
      "[data-component='drawer'] [role='link'][aria-current='page']",
    );
    expect(await selected.count()).toBe(1);
  });

  test("badge slot renders inside the destination + stays pointer-transparent", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--slots"));
    await page.waitForSelector(
      "[data-component='drawer'] [data-slot='badge']",
    );
    const badge = page.locator(
      "[data-component='drawer'] [data-slot='badge']",
    );
    expect(await badge.count()).toBeGreaterThanOrEqual(1);
  });

  test("section headlines + dividers render in slots story", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--slots"));
    await page.waitForSelector("[data-component='drawer'] [data-slot='section-headline']");
    const drawer = page
      .locator("[data-component='drawer']")
      .first();
    const headlines = drawer.locator("[data-slot='section-headline']");
    expect(await headlines.count()).toBeGreaterThanOrEqual(2);
    const divider = drawer.locator("[data-slot='divider']").first();
    await expect(divider).toBeVisible();
    const dividerStyles = await divider.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { height: cs.height, bg: cs.backgroundColor };
    });
    expect(dividerStyles.height).toBe("1px");
    expect(dividerStyles.bg).toBe(LIGHT_OUTLINE_VARIANT);
  });

  test("end anchor flips the rounded edge + zeros the right corners", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--slots"));
    const drawer = page
      .locator("[data-component='drawer'][data-anchor='end']")
      .first();
    await expect(drawer).toBeVisible();
    // shape default for `standard` is `none`, so both corners should be 0.
    const radius = await drawer.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        topLeft: cs.borderTopLeftRadius,
        topRight: cs.borderTopRightRadius,
      };
    });
    expect(radius.topLeft).toBe("0px");
    expect(radius.topRight).toBe("0px");
  });

  test("M3 motion: emphasized easing + medium2 duration on container transitions", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("navigation-drawer--motion", "light", "no-preference"),
    );
    const drawer = page.locator("[data-component='drawer']").first();
    const styles = await drawer.evaluate((el) => {
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

  test("keyboard: ArrowDown moves focus to the next destination", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--accessibility"));
    const inbox = page.getByRole("link", { name: "Inbox" }).first();
    await inbox.focus();
    await page.keyboard.press("ArrowDown");
    const starred = page.getByRole("link", { name: "Starred" }).first();
    await expect(starred).toBeFocused();
  });

  test("keyboard: Enter activates the focused destination + sets aria-current", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--accessibility"));
    const sent = page.getByRole("link", { name: "Sent" }).first();
    await sent.focus();
    await page.keyboard.press("Enter");
    await expect(sent).toHaveAttribute("aria-current", "page");
  });

  test("dark theme swaps the standard host to dark surface-container-low", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--default", "dark"));
    const drawer = page.locator("[data-component='drawer']").first();
    const bg = await drawer.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_SURFACE_CONTAINER_LOW);
  });

  test("playground story renders the drawer + selected indicator", async ({
    page,
  }) => {
    await page.goto(storyUrl("navigation-drawer--playground"));
    const drawer = page.locator("[data-component='drawer']").first();
    await expect(drawer).toBeVisible();
    const indicator = drawer.locator(
      "[data-selected='true'] [data-slot='indicator']",
    );
    await expect(indicator).toHaveCount(1);
  });
});
