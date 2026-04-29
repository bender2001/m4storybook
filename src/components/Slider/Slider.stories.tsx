import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { Slider } from "./Slider";

const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M3 10v4h4l5 5V5L7 10H3z" />
  </svg>
);

const VolumeMaxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const meta: Meta<typeof Slider> = {
  title: "Inputs/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive Slider with continuous and discrete variants. Pill-shaped handle morphs on press, value bubble appears while focused or dragged. The visually-hidden native `<input type=\"range\">` owns keyboard + form value, while the visible track / handle paint M3 tokens. See https://m3.material.io/components/sliders/specs.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["continuous", "discrete"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    showValueLabel: { control: "boolean" },
    label: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    helperText: { control: "text" },
    onChange: { action: "changed" },
    onChangeCommitted: { action: "committed" },
  },
  args: {
    label: "Volume",
    name: "volume",
    variant: "continuous",
    size: "md",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 40,
    disabled: false,
    error: false,
    showValueLabel: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { onChange: fn(), onChangeCommitted: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider
        {...args}
        variant="continuous"
        label="Continuous"
        defaultValue={42}
      />
      <Slider
        {...args}
        variant="discrete"
        label="Discrete (step 10)"
        step={10}
        defaultValue={30}
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider {...args} size="sm" label="Small (32dp)" defaultValue={25} />
      <Slider {...args} size="md" label="Medium (44dp)" defaultValue={50} />
      <Slider {...args} size="lg" label="Large (56dp)" defaultValue={75} />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider {...args} label="Resting" defaultValue={20} />
      <Slider
        {...args}
        label="With selection"
        defaultValue={60}
        helperText="Drag the handle"
      />
      <Slider
        {...args}
        label="Error"
        error
        helperText="Out of range"
        defaultValue={90}
      />
      <Slider {...args} label="Disabled" disabled defaultValue={35} />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider
        {...args}
        label="Volume"
        leadingIcon={<VolumeIcon />}
        trailingIcon={<VolumeMaxIcon />}
        defaultValue={55}
      />
      <Slider
        {...args}
        variant="discrete"
        label="Brightness (step 25)"
        step={25}
        leadingIcon={<VolumeIcon />}
        trailingIcon={<VolumeMaxIcon />}
        defaultValue={50}
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    onChange: fn(),
    onChangeCommitted: fn(),
    helperText: "Use the controls panel to drive the variant + size",
  },
};

/**
 * Storybook interaction test: focuses the slider, drives the value
 * with ArrowRight, asserts the change handler fires with the new
 * value, then jumps to the max with End and asserts the commit.
 */
export const Interaction: Story = {
  args: { onChange: fn(), onChangeCommitted: fn(), defaultValue: 40 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");

    slider.focus();
    expect(slider).toHaveFocus();

    // ArrowRight increments by step (1).
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(41);
    });

    // End jumps to the max (100) and commits.
    await userEvent.keyboard("{End}");
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith(100);
      expect(args.onChangeCommitted).toHaveBeenCalledWith(100);
    });

    // ARIA reflects the new value via the native input.
    expect(slider).toHaveAttribute("aria-valuetext", "100");
  },
};
