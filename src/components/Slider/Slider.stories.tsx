import { useState } from "react";
import type { ChangeEvent } from "react";
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
          "Material 3 slider with standard horizontal single-thumb behavior, optional stops, optional value indicator, and XS-XL size tokens. The native range input owns keyboard and form semantics while the visible track, handle, stops, and value indicator paint M3 tokens.",
      },
    },
  },
  argTypes: {
    ticks: { control: "boolean" },
    labeled: { control: "boolean" },
    valueLabel: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "s", "m", "l", "xl"] },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    label: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    helperText: { control: "text" },
    onInput: { action: "input" },
    onChange: { action: "changed" },
  },
  args: {
    label: "Volume",
    name: "volume",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 40,
    size: "xs",
    ticks: false,
    labeled: true,
    disabled: false,
    error: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { onInput: fn(), onChange: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider {...args} label="Standard" defaultValue={42} />
      <Slider
        {...args}
        label="Stops"
        ticks
        step={10}
        defaultValue={30}
      />
      <Slider
        {...args}
        label="Value indicator"
        labeled
        defaultValue={55}
        valueLabel={(value) => `${value}%`}
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider {...args} size="xs" label="XS" defaultValue={20} />
      <Slider {...args} size="s" label="S" defaultValue={35} />
      <Slider {...args} size="m" label="M" defaultValue={50} />
      <Slider {...args} size="l" label="L" defaultValue={65} />
      <Slider {...args} size="xl" label="XL" defaultValue={80} />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Slider {...args} label="Enabled" defaultValue={20} />
      <Slider
        {...args}
        label="With stops"
        ticks
        step={10}
        defaultValue={60}
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
        ticks
        label="Brightness"
        step={25}
        leadingIcon={<VolumeIcon />}
        trailingIcon={<VolumeMaxIcon />}
        defaultValue={50}
      />
    </div>
  ),
};

const ExternalValueRender = () => {
  const [value, setValue] = useState(50);

  return (
    <div className="flex items-end gap-4">
      <div className="min-w-0 flex-1">
        <Slider
          label="Brightness"
          value={value}
          onInput={setValue}
          onChange={setValue}
          aria-label="Brightness"
        />
      </div>
      <label className="flex flex-col gap-1 text-label-m text-on-surface-variant">
        Value
        <input
          className="h-10 w-16 rounded-shape-xs border border-outline bg-surface px-2 text-body-m text-on-surface outline-none focus:border-primary"
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setValue(Number(event.target.value));
          }}
        />
      </label>
    </div>
  );
};

export const ExternalValue: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => <ExternalValueRender />,
};

export const Playground: Story = {
  args: {
    onInput: fn(),
    onChange: fn(),
    helperText: "Use the controls panel to drive the slider configuration",
  },
};

export const Interaction: Story = {
  args: { onInput: fn(), onChange: fn(), defaultValue: 40 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider");

    slider.focus();
    expect(slider).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(args.onInput).toHaveBeenCalledWith(41);
    });

    await userEvent.keyboard("{End}");
    await waitFor(() => {
      expect(args.onInput).toHaveBeenCalledWith(100);
      expect(args.onChange).toHaveBeenCalledWith(100);
    });

    expect(slider).toHaveAttribute("aria-valuetext", "100");
  },
};
