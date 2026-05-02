import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { ButtonGroup } from "./ButtonGroup";

const ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

const FILE_OPTIONS = [
  { value: "mine", label: "My files" },
  { value: "shared", label: "Shared" },
  { value: "computers", label: "Computers" },
];

const FORMAT_OPTIONS = [
  { value: "bold", label: "B", ariaLabel: "Bold" },
  { value: "italic", label: "I", ariaLabel: "Italic" },
  { value: "underline", label: "U", ariaLabel: "Underline" },
];

const Icon = ({ name }: { name: "mic" | "video" | "hand" | "more" | "call" }) => {
  const paths = {
    mic: "M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z",
    video:
      "M4 6h10a2 2 0 0 1 2 2v1.2l4-2.4v10.4l-4-2.4V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z",
    hand: "M7 12V5a1.5 1.5 0 0 1 3 0v5h1V4a1.5 1.5 0 0 1 3 0v6h1V6a1.5 1.5 0 0 1 3 0v7.5A6.5 6.5 0 0 1 11.5 20H10a6 6 0 0 1-5.2-3L3 13.8a1.4 1.4 0 0 1 2.3-1.6L7 14v-2Z",
    more: "M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    call: "M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.25 1l-2.2 2.4Z",
  } as const;

  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
      <path d={paths[name]} />
    </svg>
  );
};

const CALL_OPTIONS = [
  { value: "mic", icon: <Icon name="mic" />, ariaLabel: "Microphone" },
  { value: "camera", icon: <Icon name="video" />, ariaLabel: "Camera" },
  { value: "raise", icon: <Icon name="hand" />, ariaLabel: "Raise hand" },
  { value: "more", icon: <Icon name="more" />, ariaLabel: "More options" },
  {
    value: "end",
    icon: <Icon name="call" />,
    ariaLabel: "End call",
    buttonColor: "tonal" as const,
  },
];

const meta: Meta<typeof ButtonGroup> = {
  title: "Buttons/Button Group",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Material 3 Expressive button groups. Two variants: standard and connected. Groups are invisible containers; the buttons inside use filled, tonal, outlined, or elevated color styles.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "connected"],
    },
    buttonColor: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "elevated"],
    },
    buttonVariant: {
      control: false,
      table: { disable: true },
    },
    size: { control: "inline-radio", options: ["xs", "s", "m", "l", "xl"] },
    shape: { control: "inline-radio", options: ["round", "square"] },
    selectionMode: {
      control: "inline-radio",
      options: ["none", "single", "multi"],
    },
    selectionRequired: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    options: { control: false },
  },
  args: {
    options: FILE_OPTIONS,
    variant: "connected",
    buttonColor: "tonal",
    size: "m",
    shape: "round",
    selectionMode: "single",
    selectionRequired: true,
    defaultValue: "mine",
    "aria-label": "Folders",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: { onChange: fn() },
};

export const Variants: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <ButtonGroup
        {...args}
        options={ALIGN_OPTIONS}
        variant="standard"
        buttonColor="filled"
        defaultValue="left"
      />
      <div className="w-full">
        <ButtonGroup
          {...args}
          options={ALIGN_OPTIONS}
          variant="connected"
          buttonColor="outlined"
          defaultValue="center"
        />
      </div>
      <div className="w-full">
        <ButtonGroup
          {...args}
          variant="connected"
          buttonColor="tonal"
          options={FILE_OPTIONS}
          defaultValue="shared"
          aria-label="Folders"
        />
      </div>
      <ButtonGroup
        {...args}
        options={ALIGN_OPTIONS}
        variant="standard"
        buttonColor="elevated"
        shape="square"
        defaultValue="right"
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col items-start gap-5">
      <ButtonGroup {...args} options={ALIGN_OPTIONS} variant="standard" size="xs" defaultValue="left" />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} variant="standard" size="s" defaultValue="center" />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} variant="standard" size="m" defaultValue="right" />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} variant="standard" size="l" defaultValue="left" />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} variant="standard" size="xl" defaultValue="center" />
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ButtonGroup {...args} options={ALIGN_OPTIONS} shape="round" defaultValue="left" />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} shape="square" defaultValue="center" />
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ButtonGroup {...args} options={ALIGN_OPTIONS} defaultValue={null} selectionRequired={false} />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} defaultValue="center" />
      <ButtonGroup {...args} options={ALIGN_OPTIONS} disabled defaultValue="right" />
      <ButtonGroup
        {...args}
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center", disabled: true },
          { value: "right", label: "Right" },
        ]}
        defaultValue="left"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true }, actions: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <ButtonGroup
        variant="standard"
        buttonColor="tonal"
        size="m"
        selectionMode="none"
        options={CALL_OPTIONS}
        aria-label="Call controls"
      />
      <ButtonGroup
        variant="connected"
        buttonColor="outlined"
        size="s"
        selectionMode="multi"
        defaultValue={["bold"]}
        options={FORMAT_OPTIONS}
        aria-label="Text formatting"
      />
    </div>
  ),
};

export const Playground: Story = {
  args: { onChange: fn() },
};

export const Interaction: Story = {
  args: {
    onChange: fn(),
    defaultValue: null,
    selectionRequired: false,
    "aria-label": "Alignment",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const center = canvas.getByRole("button", { name: "Center" });
    await userEvent.click(center);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenCalledWith("center");
    });
    expect(center).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(center);
    await waitFor(() => {
      expect(args.onChange).toHaveBeenLastCalledWith(null);
    });
    expect(center).toHaveAttribute("aria-pressed", "false");
  },
};
