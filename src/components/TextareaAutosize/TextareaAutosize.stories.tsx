import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactElement } from "react";
import { TextareaAutosize } from "./TextareaAutosize";

const NoteGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const ClearGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const meta: Meta<typeof TextareaAutosize> = {
  title: "Utils/Textarea Autosize",
  component: TextareaAutosize,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Textarea Autosize. Re-skins the MUI TextareaAutosize API (https://mui.com/material-ui/react-textarea-autosize/) onto the M3 text-field surface (https://m3.material.io/components/text-fields/specs). The textarea grows between a `minRows` floor (default 1) and a `maxRows` ceiling (default unbounded) using a `scrollHeight` measurement on every change. Five M3 surface variants (standard / tonal / outlined / text / elevated), three density sizes, full M3 shape token scale, leading + trailing icon + label + helperText slots, and emphasized 300ms motion via Tailwind transitions.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    minRows: { control: { type: "number", min: 1, max: 12 } },
    maxRows: { control: { type: "number", min: 1, max: 24 } },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    selected: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    shape: "xs",
    minRows: 3,
    maxRows: 8,
    disabled: false,
    error: false,
    selected: false,
    placeholder: "Compose a message…",
    label: "Message",
    helperText: "Grows up to 8 rows then scrolls.",
  },
};

export default meta;
type Story = StoryObj<typeof TextareaAutosize>;

export const Default: Story = {
  args: {
    defaultValue: "Hello M3 expressive textarea.",
  },
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextareaAutosize
        variant="standard"
        size="md"
        shape="xs"
        label="standard"
        defaultValue="surface-container-highest tray with a primary border on focus"
      />
      <TextareaAutosize
        variant="tonal"
        size="md"
        shape="xs"
        label="tonal"
        defaultValue="secondary-container fill"
      />
      <TextareaAutosize
        variant="outlined"
        size="md"
        shape="xs"
        label="outlined"
        defaultValue="transparent surface, 1dp outline border"
      />
      <TextareaAutosize
        variant="text"
        size="md"
        shape="xs"
        label="text"
        defaultValue="transparent fill, no border"
      />
      <TextareaAutosize
        variant="elevated"
        size="md"
        shape="xs"
        label="elevated"
        defaultValue="surface-container-low + elevation-3"
      />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextareaAutosize
        size="sm"
        label="sm"
        defaultValue="40dp tray, body-s typography"
      />
      <TextareaAutosize
        size="md"
        label="md"
        defaultValue="56dp tray, body-m typography (M3 default)"
      />
      <TextareaAutosize
        size="lg"
        label="lg"
        defaultValue="72dp tray, body-l typography"
      />
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <TextareaAutosize
            key={shape}
            shape={shape}
            size="md"
            label={`shape-${shape}`}
            defaultValue={`shape token: ${shape}`}
          />
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextareaAutosize
        size="md"
        label="Resting"
        defaultValue="Click to focus the textarea."
      />
      <TextareaAutosize
        size="md"
        selected
        label="Selected"
        defaultValue="Selected paints secondary-container + aria-selected"
      />
      <TextareaAutosize
        size="md"
        disabled
        label="Disabled"
        defaultValue="Disabled — opacity 0.38 + aria-disabled"
      />
      <TextareaAutosize
        size="md"
        error
        label="Error"
        helperText="Required field."
        defaultValue="Error paints error-container + aria-invalid"
      />
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  name: "Slots (label + helper + icons)",
  render: () => (
    <div className="flex flex-col gap-4">
      <TextareaAutosize
        size="md"
        label="Compose note"
        helperText="Markdown supported."
        leadingIcon={<NoteGlyph />}
        trailingIcon={<ClearGlyph />}
        defaultValue="Leading 24dp + trailing 24dp icons frame the tray."
      />
      <TextareaAutosize
        size="md"
        variant="outlined"
        label="Outlined slot demo"
        helperText="Helper text stays body-s."
        leadingIcon={<NoteGlyph />}
        defaultValue="Outlined variant with leading icon only."
      />
    </div>
  ),
};

export const Autosize: Story = {
  parameters: { controls: { disable: true } },
  render: function AutosizeRender() {
    const [value, setValue] = useState(
      "This textarea grows as you type.\nTry hitting return a few times.",
    );
    return (
      <div className="flex flex-col gap-3">
        <TextareaAutosize
          variant="outlined"
          size="md"
          minRows={2}
          maxRows={6}
          label="Autosize demo"
          helperText="minRows=2, maxRows=6 — scrolls past the ceiling."
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <TextareaAutosize
        size="md"
        label="medium2 / emphasized"
        helperText="Tray transitions ride medium2 (300ms) on emphasized easing."
        defaultValue="Focus me to watch the focus border morph."
      />
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3">
      <TextareaAutosize
        size="md"
        label="Accessible textarea"
        helperText="Helper text wires aria-describedby; aria-multiline=true is set."
        defaultValue="The textarea exposes aria-multiline + aria-describedby."
      />
      <TextareaAutosize
        size="md"
        error
        label="Error wiring"
        helperText="Error flips aria-invalid + paints helperText in error."
        defaultValue="aria-invalid + role=alert wiring."
      />
    </div>
  ),
};

export const Playground: Story = {
  args: {
    defaultValue: "Adjust the controls to explore the autosize matrix.",
  },
};

/**
 * @storybook/test interaction spec. Types into the textarea and asserts
 * onChange fires + the textarea height grows beyond the resting min.
 */
export const InteractionSpec: Story = {
  args: {
    onChange: fn(),
    label: "Interaction textarea",
    helperText: "Type to grow.",
    minRows: 2,
    maxRows: 6,
  },
  render: function InteractionRender(args) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <TextareaAutosize
          {...args}
          variant="outlined"
          size="md"
          ariaLabel="Interaction textarea"
        />
      </div>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText(
      "Interaction textarea",
    ) as HTMLTextAreaElement;

    await step(
      "Textarea mounts with aria-multiline + role=textbox",
      async () => {
        expect(textarea).toBeInTheDocument();
        expect(textarea.getAttribute("aria-multiline")).toBe("true");
      },
    );

    await step("Typing fires onChange and grows the textarea", async () => {
      const startHeight = textarea.getBoundingClientRect().height;
      textarea.focus();
      await userEvent.type(
        textarea,
        "Line 1{Enter}Line 2{Enter}Line 3{Enter}Line 4",
      );
      expect(args.onChange).toHaveBeenCalled();
      const endHeight = textarea.getBoundingClientRect().height;
      expect(endHeight).toBeGreaterThan(startHeight);
    });
  },
};
