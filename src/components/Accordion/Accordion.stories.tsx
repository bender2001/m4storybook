import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Accordion, AccordionItem } from "./Accordion";

/** Inline 24dp icons. Keeps the stories network-free + deterministic. */
const InfoGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const StarGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const SettingsGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19.14 12.94a7.14 7.14 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.05 7.05 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.14 7.14 0 0 0 0 1.88L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96c.49.39 1.03.7 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.23.09.49 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
  </svg>
);

const meta: Meta<typeof Accordion> = {
  title: "Surfaces/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Accordion / Expansion Panel. Three M3 variants (elevated / filled / outlined), three density sizes, seven shape steps, single- or multi-panel expansion, and a complete leading-icon / title / subhead / trailing-chevron / panel slot matrix. Per https://m3.material.io/components/expansion-panels.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["elevated", "filled", "outlined"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    multiple: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    multiple: false,
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[480px]">
      <Accordion defaultExpanded={["one"]}>
        <AccordionItem id="one" title="Section one" subhead="Default open">
          M3 Expressive expansion-panel. Body uses body-m + on-surface-variant.
        </AccordionItem>
        <AccordionItem id="two" title="Section two" subhead="Click to expand">
          Panels animate height + opacity with the M3 emphasized easing.
        </AccordionItem>
        <AccordionItem id="three" title="Section three">
          Subhead is optional.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[840px] grid-cols-3 gap-6">
      <Accordion variant="elevated" defaultExpanded={["e1"]}>
        <AccordionItem id="e1" title="Elevated" subhead="elevation-1">
          surface-container-low surface.
        </AccordionItem>
        <AccordionItem id="e2" title="Resting" subhead="closed by default">
          Lifts to elevation-2 on hover.
        </AccordionItem>
      </Accordion>
      <Accordion variant="filled" defaultExpanded={["f1"]}>
        <AccordionItem id="f1" title="Filled" subhead="no shadow">
          surface-container-highest fill.
        </AccordionItem>
        <AccordionItem id="f2" title="Resting" subhead="closed by default">
          Default M3 expansion-panel surface.
        </AccordionItem>
      </Accordion>
      <Accordion variant="outlined" defaultExpanded={["o1"]}>
        <AccordionItem id="o1" title="Outlined" subhead="1dp border">
          surface + outline-variant border.
        </AccordionItem>
        <AccordionItem id="o2" title="Resting" subhead="closed by default">
          Use for low-emphasis groupings.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[560px] flex-col gap-6">
      <Accordion size="sm">
        <AccordionItem id="sm-1" title="Small" subhead="48dp header">
          Compact density.
        </AccordionItem>
      </Accordion>
      <Accordion size="md">
        <AccordionItem id="md-1" title="Medium" subhead="56dp header">
          Default density — most common surface.
        </AccordionItem>
      </Accordion>
      <Accordion size="lg">
        <AccordionItem id="lg-1" title="Large" subhead="72dp header">
          Spacious density — used for hero / feature surfaces.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-2 gap-6">
      <Accordion>
        <AccordionItem
          id="interactive"
          title="Interactive"
          subhead="Hover, focus, or press"
        >
          State layer paints at 0.08 / 0.10 / 0.10 hover / focus / pressed.
        </AccordionItem>
      </Accordion>
      <Accordion defaultExpanded={["expanded"]}>
        <AccordionItem
          id="expanded"
          title="Expanded"
          subhead="aria-expanded=true"
        >
          Open panel — chevron rotates 180deg.
        </AccordionItem>
      </Accordion>
      <Accordion>
        <AccordionItem
          id="disabled"
          title="Disabled"
          subhead="opacity 0.38"
          disabled
        >
          Disabled accordion blocks pointer + keyboard input.
        </AccordionItem>
      </Accordion>
      <Accordion variant="outlined">
        <AccordionItem
          id="resting"
          title="Resting"
          subhead="outlined variant"
        >
          1dp outline-variant border.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[720px] grid-cols-3 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((shape) => (
        <Accordion key={shape} variant="filled" shape={shape}>
          <AccordionItem id={`shape-${shape}`} title={`shape-${shape}`}>
            Corner radius token: shape-{shape}.
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[480px]">
      <Accordion variant="outlined" defaultExpanded={["with-icons"]}>
        <AccordionItem
          id="with-icons"
          title="With leading icon"
          subhead="By author · 5 min read"
          leadingIcon={<InfoGlyph />}
        >
          Supporting text uses the body-m / on-surface-variant tokens. The
          leading slot accepts any 24dp glyph and inherits the
          on-surface-variant role.
        </AccordionItem>
        <AccordionItem
          id="with-star"
          title="Star icon"
          leadingIcon={<StarGlyph />}
        >
          Each item owns its own state-layer + chevron.
        </AccordionItem>
        <AccordionItem
          id="with-settings"
          title="Settings"
          subhead="Tooling preferences"
          leadingIcon={<SettingsGlyph />}
        >
          Subheads collapse to one line via `truncate`.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[480px]">
      <Accordion>
        <AccordionItem
          id="motion-1"
          title="Hover or expand me"
          subhead="Expressive motion"
        >
          On expand the panel animates height + opacity using the M3
          emphasized easing curve. The chevron rotates 180deg with the
          same emphasized tween.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[480px]">
      <Accordion defaultExpanded={["a11y-1"]}>
        <AccordionItem id="a11y-1" title="Keyboard support">
          Header is a real button with aria-expanded + aria-controls.
          Enter and Space toggle the panel; Tab moves between items.
        </AccordionItem>
        <AccordionItem id="a11y-2" title="Screen-reader semantics">
          Panel renders as role=region labelled by the header id.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Multiple: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[480px]">
      <Accordion multiple defaultExpanded={["m1", "m2"]}>
        <AccordionItem id="m1" title="Multi-open A">
          Multi-mode keeps both panels open at the same time.
        </AccordionItem>
        <AccordionItem id="m2" title="Multi-open B">
          Useful for FAQ / settings surfaces.
        </AccordionItem>
        <AccordionItem id="m3" title="Closed">
          Closed by default.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    multiple: false,
  },
  render: (args) => (
    <div className="w-[480px]">
      <Accordion {...args}>
        <AccordionItem id="pg-1" title="First panel" subhead="Subhead">
          Body content uses the body-m / on-surface-variant tokens.
        </AccordionItem>
        <AccordionItem id="pg-2" title="Second panel">
          Tweak the controls to see the bindings change.
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

/**
 * Storybook interaction test: mounts an accordion, asserts the
 * initial aria state, simulates a click + keyboard activate, and
 * verifies onExpandedChange fires with the new ids.
 */
export const InteractionSpec: Story = {
  args: {
    onExpandedChange: fn(),
  },
  render: (args) => (
    <div className="w-[480px]">
      <Accordion {...args}>
        <AccordionItem id="x1" title="First panel">
          First panel body.
        </AccordionItem>
        <AccordionItem id="x2" title="Second panel">
          Second panel body.
        </AccordionItem>
      </Accordion>
    </div>
  ),
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "First panel" });
    const second = canvas.getByRole("button", { name: "Second panel" });

    await step("Renders headers as buttons with aria-expanded=false", async () => {
      expect(first).toHaveAttribute("aria-expanded", "false");
      expect(second).toHaveAttribute("aria-expanded", "false");
    });

    await step("Click expands the first panel", async () => {
      await userEvent.click(first);
      expect(first).toHaveAttribute("aria-expanded", "true");
      expect(args.onExpandedChange).toHaveBeenLastCalledWith(["x1"]);
    });

    await step("Click on the second panel collapses the first (single mode)", async () => {
      await userEvent.click(second);
      expect(first).toHaveAttribute("aria-expanded", "false");
      expect(second).toHaveAttribute("aria-expanded", "true");
      expect(args.onExpandedChange).toHaveBeenLastCalledWith(["x2"]);
    });

    await step("Enter key toggles via keyboard", async () => {
      first.focus();
      await userEvent.keyboard("{Enter}");
      expect(first).toHaveAttribute("aria-expanded", "true");
    });
  },
};
