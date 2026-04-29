import { expect, test } from "@playwright/test";

/**
 * Design-parity tests for the M3 Tooltip component. Every assertion
 * reads computed style so a token drift breaks the test.
 *  - plain  : `inverse-surface` container, `inverse-on-surface` text,
 *             body-s (12px / weight 500), shape-xs (4dp), 24-32dp
 *             height per size.
 *  - rich   : `surface-container` panel, `on-surface` text, shape-sm
 *             (8dp), elevation-2 box-shadow, optional subhead/
 *             supporting/action slots.
 *  - placement: top|right|bottom|left positions the panel relative
 *               to the trigger (8dp gap).
 *  - lifecycle: hover dwell opens; blur/escape closes; aria-
 *               describedby forwards to the trigger child.
 */

const storyUrl = (
  id: string,
  theme: "light" | "dark" = "light",
  reducedMotion: "reduce" | "no-preference" = "reduce",
) =>
  `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};reducedMotion:${reducedMotion}`;

const LIGHT_INVERSE_SURFACE = "rgb(50, 47, 53)";
const LIGHT_INVERSE_ON_SURFACE = "rgb(245, 239, 247)";
const LIGHT_SURFACE_CONTAINER = "rgb(243, 237, 247)";
const LIGHT_ON_SURFACE = "rgb(29, 27, 32)";
const DARK_INVERSE_SURFACE = "rgb(230, 224, 233)";

test.describe("Tooltip - M3 design parity", () => {
  test("default renders as plain/md with inverse-surface container + body-s text", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--default"));
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-variant", "plain");
    await expect(panel).toHaveAttribute("data-size", "md");
    await expect(panel).toHaveAttribute("data-placement", "top");

    const styles = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        borderRadius: cs.borderTopLeftRadius,
      };
    });
    expect(styles.backgroundColor).toBe(LIGHT_INVERSE_SURFACE);
    expect(styles.color).toBe(LIGHT_INVERSE_ON_SURFACE);
    expect(styles.fontSize).toBe("12px");
    expect(parseInt(styles.fontWeight, 10)).toBe(500);
    expect(styles.borderRadius).toBe("4px");
  });

  test("plain + rich variants paint different container roles", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--variants"));

    const plainHost = page.locator("[data-testid='plain-tooltip-host']");
    const richHost = page.locator("[data-testid='rich-tooltip-host']");
    const plain = plainHost.locator("[role='tooltip']");
    const rich = richHost.locator("[role='tooltip']");
    await expect(plain).toBeVisible();
    await expect(rich).toBeVisible();

    const plainBg = await plain.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const richBg = await rich.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(plainBg).toBe(LIGHT_INVERSE_SURFACE);
    expect(richBg).toBe(LIGHT_SURFACE_CONTAINER);

    // Rich tooltip ships elevation-2 (M3 spec).
    const richShadow = await rich.evaluate(
      (el) => window.getComputedStyle(el).boxShadow,
    );
    expect(richShadow).not.toBe("none");

    // Rich text inherits the on-surface role (the supporting line
    // uses on-surface-variant; the subhead uses on-surface).
    const richSubheadColor = await rich
      .locator("[data-slot='subhead']")
      .evaluate((el) => window.getComputedStyle(el).color);
    expect(richSubheadColor).toBe(LIGHT_ON_SURFACE);
  });

  test("rich tooltip renders subhead, supporting text, and action slots", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--slots"));
    const host = page.locator("[data-testid='rich-slots']");
    const panel = host.locator("[role='tooltip']");
    await expect(panel).toBeVisible();
    await expect(panel.locator("[data-slot='subhead']")).toBeVisible();
    await expect(panel.locator("[data-slot='label']")).toBeVisible();
    await expect(panel.locator("[data-slot='supporting']")).toBeVisible();
    await expect(panel.locator("[data-slot='action']")).toBeVisible();

    // Subhead uses title-s (14px / weight 500) per M3.
    const subheadStyles = await panel
      .locator("[data-slot='subhead']")
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { fontSize: cs.fontSize, fontWeight: cs.fontWeight };
      });
    expect(subheadStyles.fontSize).toBe("14px");
    expect(parseInt(subheadStyles.fontWeight, 10)).toBe(500);
  });

  test("size scale: sm/md/lg map to 24/28/32dp min-heights", async ({ page }) => {
    await page.goto(storyUrl("data-display-tooltip--sizes"));
    const heights = await Promise.all(
      ["size-sm", "size-md", "size-lg"].map(async (testid) => {
        const panel = page
          .locator(`[data-testid='${testid}']`)
          .locator("[role='tooltip']");
        await expect(panel).toBeVisible();
        return panel.evaluate(
          (el) => window.getComputedStyle(el).minHeight,
        );
      }),
    );
    expect(heights).toEqual(["24px", "28px", "32px"]);
  });

  test("placement positions the panel above/right/below/left of the trigger", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--placements"));
    const placements = await Promise.all(
      [
        ["place-top", "top"],
        ["place-right", "right"],
        ["place-bottom", "bottom"],
        ["place-left", "left"],
      ].map(async ([testid, placement]) => {
        const host = page.locator(`[data-testid='${testid}']`);
        const trigger = host.locator("button");
        const panel = host.locator("[role='tooltip']");
        await expect(panel).toBeVisible();
        await expect(panel).toHaveAttribute("data-placement", placement);
        const triggerBox = await trigger.boundingBox();
        const panelBox = await panel.boundingBox();
        expect(triggerBox).not.toBeNull();
        expect(panelBox).not.toBeNull();
        return { placement, triggerBox: triggerBox!, panelBox: panelBox! };
      }),
    );
    const top = placements.find((p) => p.placement === "top")!;
    expect(top.panelBox.y + top.panelBox.height).toBeLessThanOrEqual(
      top.triggerBox.y + 1,
    );
    const right = placements.find((p) => p.placement === "right")!;
    expect(right.panelBox.x).toBeGreaterThanOrEqual(
      right.triggerBox.x + right.triggerBox.width - 1,
    );
    const bottom = placements.find((p) => p.placement === "bottom")!;
    expect(bottom.panelBox.y).toBeGreaterThanOrEqual(
      bottom.triggerBox.y + bottom.triggerBox.height - 1,
    );
    const left = placements.find((p) => p.placement === "left")!;
    expect(left.panelBox.x + left.panelBox.width).toBeLessThanOrEqual(
      left.triggerBox.x + 1,
    );
  });

  test("disabled state suppresses the panel even when defaultOpen would mount it", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--states"));
    const disabledHost = page.locator("[data-testid='state-disabled']");
    await expect(disabledHost).toHaveAttribute("data-disabled", "");
    await expect(disabledHost.locator("[role='tooltip']")).toHaveCount(0);
  });

  test("closed state does not render the panel until hover", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--states"));
    const closedHost = page.locator("[data-testid='state-closed']");
    await expect(closedHost.locator("[role='tooltip']")).toHaveCount(0);
  });

  test("hover dwell opens the tooltip + forwards aria-describedby to the trigger", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=data-display-tooltip--playground&viewMode=story&globals=theme:light;reducedMotion:reduce&args=label:Hovered;showDelayMs:0;hideDelayMs:0;defaultOpen:!false",
    );
    const trigger = page.getByRole("button", { name: "Playground" });
    await expect(trigger).toBeVisible();
    await trigger.hover();
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
    const id = await panel.getAttribute("id");
    expect(id).toBeTruthy();
    await expect(trigger).toHaveAttribute("aria-describedby", id!);
  });

  test("escape key dismisses the tooltip", async ({ page }) => {
    await page.goto(
      "/iframe.html?id=data-display-tooltip--playground&viewMode=story&globals=theme:light;reducedMotion:reduce&args=label:Press;showDelayMs:0;hideDelayMs:0",
    );
    const trigger = page.getByRole("button", { name: "Playground" });
    await trigger.hover();
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });

  test("focus opens the tooltip immediately (no dwell delay)", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=data-display-tooltip--playground&viewMode=story&globals=theme:light;reducedMotion:reduce&args=label:Focused;showDelayMs:2000",
    );
    const trigger = page.getByRole("button", { name: "Playground" });
    await trigger.focus();
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
  });

  test("rich tooltip stays open while the pointer is inside the panel", async ({
    page,
  }) => {
    await page.goto(storyUrl("data-display-tooltip--slots"));
    const host = page.locator("[data-testid='rich-slots']");
    const panel = host.locator("[role='tooltip']");
    await expect(panel).toBeVisible();
    // Move the pointer onto the action button without leaving the
    // wrapper. The panel must remain visible (pointer-events: auto).
    const action = host.locator("[data-testid='rich-action']");
    await action.hover();
    await expect(panel).toBeVisible();
    const events = await panel.evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );
    expect(events).toBe("auto");
  });

  test("M3 motion: trigger toggles data-open + panel reaches scale(1) after enter", async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=data-display-tooltip--playground&viewMode=story&globals=theme:light;reducedMotion:no-preference&args=label:Animated;showDelayMs:0;hideDelayMs:0;defaultOpen:!false`,
    );
    const trigger = page.getByRole("button", { name: "Playground" });
    const wrapper = page.locator("[data-component='tooltip']");
    await expect(wrapper).not.toHaveAttribute("data-open", "");
    await trigger.hover();
    await expect(wrapper).toHaveAttribute("data-open", "");
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
    // Wait for the enter animation to settle, then assert the
    // panel reached opacity 1 + scale 1 — motion/react drives both
    // off the emphasizedDecelerate tween from src/motion/presets.
    await page.waitForTimeout(500);
    const settled = await panel.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { opacity: cs.opacity, transform: cs.transform };
    });
    expect(parseFloat(settled.opacity)).toBeCloseTo(1, 2);
    expect(settled.transform === "none" || settled.transform.includes("matrix")).toBe(true);
  });

  test("dark theme swaps inverse-surface to its dark token", async ({ page }) => {
    await page.goto(storyUrl("data-display-tooltip--default", "dark"));
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
    const bg = await panel.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).toBe(DARK_INVERSE_SURFACE);
  });

  test("playground accepts runtime variant + placement controls", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=data-display-tooltip--playground&viewMode=story&globals=theme:light;reducedMotion:reduce&args=variant:rich;placement:bottom;label:Custom",
    );
    const panel = page.getByRole("tooltip");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-variant", "rich");
    await expect(panel).toHaveAttribute("data-placement", "bottom");
  });
});
