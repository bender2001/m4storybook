import { expect, test } from "@playwright/test";

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_PRIMARY = "rgb(103, 80, 164)";
const LIGHT_ON_PRIMARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY = "rgb(98, 91, 113)";
const LIGHT_ON_SECONDARY = "rgb(255, 255, 255)";
const LIGHT_SECONDARY_CONTAINER = "rgb(232, 222, 248)";
const LIGHT_ON_SECONDARY_CONTAINER = "rgb(29, 25, 43)";
const LIGHT_OUTLINE = "rgb(121, 116, 126)";
const TRANSPARENT = "rgba(0, 0, 0, 0)";
const EASE_EMPHASIZED = "cubic-bezier(0.2, 0, 0, 1)";

test.describe("Button Group - M3 Expressive parity", () => {
  test("group renders role=group and each item remains a button", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--default"));
    const group = page.getByRole("group");
    await expect(group).toBeVisible();
    await expect(group).toHaveAttribute("data-variant", "connected");
    await expect(group.getByRole("button")).toHaveCount(3);
  });

  test("default value drives aria-pressed on the matching button", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--default"));
    const center = page.getByRole("button", { name: "Center" });
    const left = page.getByRole("button", { name: "Left" });
    await expect(center).toHaveAttribute("aria-pressed", "true");
    await expect(left).toHaveAttribute("aria-pressed", "false");
  });

  test("connected group spans its container and distributes buttons evenly", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--default"));
    const group = page.getByRole("group");
    const items = group.locator("[data-button-group-segment]");
    const [groupBox, firstBox, secondBox] = await Promise.all([
      group.boundingBox(),
      items.nth(0).boundingBox(),
      items.nth(1).boundingBox(),
    ]);
    if (!groupBox || !firstBox || !secondBox) throw new Error("missing geometry");

    expect(groupBox.width).toBeGreaterThan(500);
    expect(firstBox.width).toBeCloseTo(secondBox.width, 0);
  });

  test("standard group uses M3 size-specific spacing", async ({ page }) => {
    await page.goto(storyUrl("inputs-button-group--sizes"));
    const groups = page.locator("[data-button-group-root]");

    const gaps = await Promise.all(
      [0, 1, 2, 3, 4].map((i) =>
        groups.nth(i).evaluate((el) => window.getComputedStyle(el).gap),
      ),
    );

    expect(gaps).toEqual(["18px", "12px", "8px", "8px", "8px"]);
  });

  test("visual heights match M3 XS/S/M/L/XL tokens", async ({ page }) => {
    await page.goto(storyUrl("inputs-button-group--sizes"));
    const groups = page.locator("[data-button-group-root]");

    const heights = await Promise.all(
      [0, 1, 2, 3, 4].map((i) =>
        groups
          .nth(i)
          .locator("[data-button-group-button]")
          .first()
          .evaluate((el) => window.getComputedStyle(el).height),
      ),
    );

    expect(heights).toEqual(["32px", "40px", "56px", "96px", "136px"]);
  });

  test("XS and S keep 48dp accessible hit targets", async ({ page }) => {
    await page.goto(storyUrl("inputs-button-group--sizes"));
    const groups = page.locator("[data-button-group-root]");

    const hitTargets = await Promise.all(
      [0, 1].map((i) =>
        groups
          .nth(i)
          .locator("[data-button-group-segment]")
          .first()
          .evaluate((el) => window.getComputedStyle(el).height),
      ),
    );

    expect(hitTargets).toEqual(["48px", "48px"]);
  });

  test("filled standard group paints primary at rest and secondary when selected", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--variants"));
    const group = page.locator("[data-button-group-root]").first();
    const selected = group.locator("[data-selected] [data-button-group-button]");
    const rest = group.locator("[data-segment-index='1'] [data-button-group-button]");

    await expect(rest).toHaveCSS("background-color", LIGHT_PRIMARY);
    await expect(rest).toHaveCSS("color", LIGHT_ON_PRIMARY);
    await expect(selected).toHaveCSS("background-color", LIGHT_SECONDARY);
    await expect(selected).toHaveCSS("color", LIGHT_ON_SECONDARY);
  });

  test("outlined connected group has transparent rest fill and selected tonal fill", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--variants"));
    const group = page.locator("[data-button-group-root]").nth(1);
    const rest = group.locator("[data-segment-index='0'] [data-button-group-button]");
    const selected = group.locator("[data-selected] [data-button-group-button]");

    await expect(rest).toHaveCSS("background-color", TRANSPARENT);
    await expect(rest).toHaveCSS("border-top-color", LIGHT_OUTLINE);
    await expect(selected).toHaveCSS(
      "background-color",
      LIGHT_SECONDARY_CONTAINER,
    );
    await expect(selected).toHaveCSS("color", LIGHT_ON_SECONDARY_CONTAINER);
  });

  test("standard selected button morphs shape and adjusts adjacent widths", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--variants"));
    const group = page.locator("[data-button-group-root]").first();
    const first = group.locator("[data-button-group-segment]").nth(0);
    const second = group.locator("[data-button-group-segment]").nth(1);
    await page.waitForTimeout(420);

    const [firstWidth, secondWidth, radius] = await Promise.all([
      first.evaluate((el) => el.getBoundingClientRect().width),
      second.evaluate((el) => el.getBoundingClientRect().width),
      first
        .locator("[data-button-group-button]")
        .evaluate((el) =>
          parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
        ),
    ]);

    expect(firstWidth).toBeGreaterThan(secondWidth);
    expect(radius).toBe(8);
  });

  test("connected selected button changes only its own shape", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--variants"));
    const group = page.locator("[data-button-group-root]").nth(1);
    const selected = group.locator("[data-selected] [data-button-group-button]");
    const neighbor = group.locator("[data-segment-index='0'] [data-button-group-button]");

    const [selectedRadius, neighborRadius] = await Promise.all([
      selected.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
      ),
      neighbor.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
      ),
    ]);

    expect(selectedRadius).toBeGreaterThanOrEqual(28);
    expect(neighborRadius).toBeGreaterThanOrEqual(28);
  });

  test("square shape uses square outer corners", async ({ page }) => {
    await page.goto(storyUrl("inputs-button-group--shapes"));
    const squareGroup = page.locator("[data-button-group-root]").nth(1);
    const first = squareGroup
      .locator("[data-segment-index='0'] [data-button-group-button]");
    const radius = await first.evaluate((el) =>
      parseFloat(window.getComputedStyle(el).borderTopLeftRadius),
    );
    expect(radius).toBe(8);
  });

  test("selectionRequired prevents clearing the active single-select item", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--default"));
    const center = page.getByRole("button", { name: "Center" });
    await expect(center).toHaveAttribute("aria-pressed", "true");
    await center.click();
    await expect(center).toHaveAttribute("aria-pressed", "true");
  });

  test("multi-select mode allows multiple aria-pressed buttons", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--with-icons"));
    const group = page.locator("[data-button-group-root]").first();
    const mic = group.getByRole("button", { name: "Microphone" });
    const camera = group.getByRole("button", { name: "Camera" });

    await expect(mic).toHaveAttribute("aria-pressed", "true");
    await camera.click();
    await expect(mic).toHaveAttribute("aria-pressed", "true");
    await expect(camera).toHaveAttribute("aria-pressed", "true");
  });

  test("disabled group suppresses state-layer and disables buttons", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--states"));
    const group = page.locator("[data-button-group-root]").nth(2);
    const button = group.getByRole("button", { name: "Left" });
    const layerOpacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));

    expect(layerOpacity).toBe(0);
    await expect(button).toBeDisabled();
  });

  test("hover paints state-layer at 0.08 on a non-selected button", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-button-group--default", "light", "no-preference"),
    );
    const button = page.getByRole("button", { name: "Left" });
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await button.hover();
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.08, 2);
  });

  test("focus paints state-layer at 0.10 opacity", async ({ page }) => {
    await page.goto(
      storyUrl("inputs-button-group--default", "light", "no-preference"),
    );
    const button = page.getByRole("button", { name: "Left" });
    await button.evaluate((el: HTMLButtonElement) => el.focus());
    await page.waitForTimeout(260);
    const opacity = await button
      .locator("[data-state-layer]")
      .evaluate((el) => parseFloat(window.getComputedStyle(el).opacity));
    expect(opacity).toBeCloseTo(0.1, 2);
  });

  test("pressed connected button uses pressed inner corner token", async ({
    page,
  }) => {
    await page.goto(
      storyUrl("inputs-button-group--default", "light", "no-preference"),
    );
    const left = page.getByRole("button", { name: "Left" });
    const box = await left.boundingBox();
    if (!box) throw new Error("missing button bounds");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(360);
    const radius = await left
      .locator("[data-button-group-button]")
      .evaluate((el) =>
        parseFloat(window.getComputedStyle(el).borderTopRightRadius),
      );
    expect(radius).toBe(4);
    await page.mouse.up();
  });

  test("Space and Enter activate focused buttons", async ({ page }) => {
    await page.goto(storyUrl("inputs-button-group--states"));
    const group = page.locator("[data-button-group-root]").first();
    const left = group.getByRole("button", { name: "Left" });
    const right = group.getByRole("button", { name: "Right" });

    await left.focus();
    await page.keyboard.press("Space");
    await expect(left).toHaveAttribute("aria-pressed", "true");

    await right.focus();
    await page.keyboard.press("Enter");
    await expect(right).toHaveAttribute("aria-pressed", "true");
  });

  test("M3 emphasized motion token is applied to visual buttons", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--default"));
    const button = page
      .getByRole("button", { name: "Left" })
      .locator("[data-button-group-button]");
    const styles = await button.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        transitionDuration: cs.transitionDuration,
        transitionTimingFunction: cs.transitionTimingFunction,
      };
    });
    const firstDuration = styles.transitionDuration.split(",")[0].trim();
    expect(firstDuration).toBe("0.3s");
    expect(styles.transitionTimingFunction).toContain(EASE_EMPHASIZED);
  });

  test("dark theme swaps role colors on the filled selected button", async ({
    page,
  }) => {
    await page.goto(storyUrl("inputs-button-group--variants", "dark"));
    const group = page.locator("[data-button-group-root]").first();
    const selected = group.locator("[data-selected] [data-button-group-button]");
    const bg = await selected.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe(LIGHT_SECONDARY);
    expect(bg).not.toBe(LIGHT_SECONDARY_CONTAINER);
    expect(bg).not.toBe(LIGHT_ON_SECONDARY_CONTAINER);
  });
});
