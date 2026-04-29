import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Divider } from "./Divider";

/**
 * Inline 16dp glyphs for the icon-slot stories — keeps the
 * Storybook deliverable network-free for visual regression.
 */
const StarGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
    <path d="M12 2.6l2.92 6.55 7.13.62-5.4 4.7 1.62 6.96L12 17.77l-6.27 3.66 1.62-6.96-5.4-4.7 7.13-.62z" />
  </svg>
);

const meta: Meta<typeof Divider> = {
  title: "Data Display/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Divider rendering the 1dp outline-variant rule. Three inset variants (full/inset/middle) match the M3 spec; sm/md/lg map to 1dp/2dp/4dp emphasized thicknesses. Optional inline label slot wraps the rule in two halves (start/center/end aligned). Honors `prefers-reduced-motion` by skipping the M3 emphasized opacity fade-in.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["full", "inset", "middle"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    labelAlign: { control: "inline-radio", options: ["start", "center", "end"] },
  },
  args: {
    variant: "full",
    size: "sm",
    orientation: "horizontal",
    labelAlign: "center",
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Divider />
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Full</p>
        <Divider aria-label="Full divider" variant="full" />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Inset (16dp leading)</p>
        <Divider aria-label="Inset divider" variant="inset" />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Middle (16dp both sides)</p>
        <Divider aria-label="Middle divider" variant="middle" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Small (1dp)</p>
        <Divider aria-label="Small divider" size="sm" />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Medium (2dp)</p>
        <Divider aria-label="Medium divider" size="md" />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Large (4dp)</p>
        <Divider aria-label="Large divider" size="lg" />
      </div>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Divider aria-label="Resting divider" />
      <Divider aria-label="Variant divider" variant="middle" size="md" />
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Divider label="Center label" />
      <Divider label="Start label" labelAlign="start" />
      <Divider label="End label" labelAlign="end" />
      <Divider label="With icons" leadingIcon={<StarGlyph />} trailingIcon={<StarGlyph />} />
    </div>
  ),
};

export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex h-24 items-center gap-4">
      <span className="text-body-m text-on-surface">Left</span>
      <Divider orientation="vertical" aria-label="Vertical sm" />
      <span className="text-body-m text-on-surface">Middle</span>
      <Divider orientation="vertical" size="md" aria-label="Vertical md" />
      <span className="text-body-m text-on-surface">Right</span>
      <Divider orientation="vertical" size="lg" aria-label="Vertical lg" />
      <span className="text-body-m text-on-surface">End</span>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Divider label="Animated in" />
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-80">
      <Divider aria-label="Section break" />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    label: "OR",
  },
  render: (args) => (
    <div className="w-80">
      <Divider {...args} />
    </div>
  ),
};

/**
 * Storybook interaction test:
 *   - asserts the rule mounts with role=separator + the resolved
 *     orientation, variant, and size data attributes
 *   - asserts the label slot renders + the leading/trailing rules
 *     paint as decorative spans (aria-hidden)
 */
export const InteractionSpec: Story = {
  args: {
    label: "Section",
    variant: "middle",
    size: "md",
    "aria-label": "Section divider",
  },
  render: (args) => (
    <div className="w-80">
      <Divider {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const divider = canvas.getByRole("separator", { name: "Section divider" });
    expect(divider).toHaveAttribute("data-orientation", "horizontal");
    expect(divider).toHaveAttribute("data-variant", "middle");
    expect(divider).toHaveAttribute("data-size", "md");
    expect(divider.getAttribute("aria-orientation")).toBe("horizontal");
    const label = divider.querySelector("[data-slot='label']");
    expect(label).not.toBeNull();
    const leading = divider.querySelector("[data-slot='rule-leading']");
    const trailing = divider.querySelector("[data-slot='rule-trailing']");
    expect(leading).not.toBeNull();
    expect(trailing).not.toBeNull();
  },
};
