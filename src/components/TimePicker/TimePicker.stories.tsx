import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { TimePicker } from "./TimePicker";
import type { TimePickerValue } from "./types";

const seedTime = (h: number, m: number): TimePickerValue => ({ hours: h, minutes: m });

const Stage = ({
  children,
  width = "w-[360px]",
  className,
}: {
  children?: ReactNode;
  width?: string;
  className?: string;
}) => (
  <div
    data-host="time-picker-stage"
    className={
      "relative " +
      width +
      " rounded-shape-md bg-surface-container-low p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const FlightIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
  </svg>
);

const meta: Meta<typeof TimePicker> = {
  title: "Advanced/Time Picker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized TimePicker. Re-skins MUI X TimePicker (https://mui.com/x/react-date-pickers/time-picker/) onto M3 tokens. The selection blob is a circular `bg-primary` cursor that springs between dial cells via a shared `layoutId` and morphs from `shape-xs` to the selected `shape` token via motion/react springs. 5 variants (filled / tonal / outlined / text / elevated), 3 densities (40 / 56 / 64 dp triggers, 224 / 256 / 288 dp dials), 7 shapes, 12-hour AM/PM or 24-hour cycle, hour ↔ minute mode swap, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, and roving-tabindex keyboard nav (Arrow / Home / End / PageUp / PageDown / Enter / Space / Escape).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    hourCycle: { control: "inline-radio", options: [12, 24] },
    minuteStep: { control: "inline-radio", options: [1, 5, 10, 15] },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    label: { control: "text" },
    supportingText: { control: "text" },
    placeholder: { control: "text" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "xl",
    hourCycle: 12,
    minuteStep: 5,
    label: "Departure",
    supportingText: "HH:MM",
    placeholder: "HH:MM",
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <TimePicker
        label="Departure"
        supportingText="HH:MM"
        defaultValue={seedTime(10, 35)}
        ariaLabel="Departure time"
      />
    </Stage>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["filled", "tonal", "outlined", "text", "elevated"] as const).map(
        (variant) => (
          <Stage key={variant}>
            <span className="block text-label-l text-on-surface mb-3">
              {variant}
            </span>
            <TimePicker
              variant={variant}
              label="Departure"
              supportingText="HH:MM"
              defaultValue={seedTime(10, 35)}
              ariaLabel={`${variant} time picker`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stage key={size}>
          <span className="block text-label-l text-on-surface mb-3">
            {size}
          </span>
          <TimePicker
            size={size}
            label="Departure"
            defaultValue={seedTime(10, 35)}
            ariaLabel={`${size} time picker`}
          />
        </Stage>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stage key={shape} className="pb-[480px]">
            <span className="block text-label-l text-on-surface mb-3">
              {shape}
            </span>
            <TimePicker
              shape={shape}
              label="Departure"
              defaultValue={seedTime(10, 35)}
              defaultOpen
              ariaLabel={`${shape} time picker`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          empty
        </span>
        <TimePicker label="Departure" placeholder="HH:MM" />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          selected
        </span>
        <TimePicker
          label="Departure"
          defaultValue={seedTime(14, 20)}
          ariaLabel="selected time picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          error
        </span>
        <TimePicker
          label="Departure"
          supportingText="Time is required"
          error
          ariaLabel="error time picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled
        </span>
        <TimePicker
          label="Departure"
          supportingText="Locked until next quarter"
          defaultValue={seedTime(10, 35)}
          disabled
          ariaLabel="disabled time picker"
        />
      </Stage>
    </div>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <TimePicker
        label="Departure"
        supportingText="HH:MM"
        defaultValue={seedTime(10, 35)}
        leadingIcon={<FlightIcon />}
        ariaLabel="departure time picker"
      />
    </Stage>
  ),
};

export const OpenPanel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[480px]">
      <TimePicker
        label="Departure"
        defaultValue={seedTime(10, 35)}
        defaultOpen
        ariaLabel="open time picker"
      />
    </Stage>
  ),
};

export const OpenPanelMinutes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[480px]">
      <TimePicker
        label="Departure"
        defaultValue={seedTime(10, 35)}
        defaultOpen
        defaultMode="minutes"
        ariaLabel="open minutes time picker"
      />
    </Stage>
  ),
};

export const TwentyFourHour: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[480px]">
      <TimePicker
        label="Departure (24h)"
        hourCycle={24}
        defaultValue={seedTime(18, 45)}
        defaultOpen
        ariaLabel="24-hour time picker"
      />
    </Stage>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage className="pb-[480px]">
      <TimePicker
        label="Departure"
        defaultValue={seedTime(10, 35)}
        defaultOpen
        ariaLabel="motion time picker"
      />
    </Stage>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          aria-haspopup + aria-expanded
        </span>
        <TimePicker
          label="Departure"
          supportingText="HH:MM"
          defaultValue={seedTime(10, 35)}
          ariaLabel="Accessible time picker"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          aria-label only
        </span>
        <TimePicker
          ariaLabel="Pick a departure time"
          defaultValue={seedTime(10, 35)}
        />
      </Stage>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "xl",
    hourCycle: 12,
    minuteStep: 5,
    label: "Departure",
    supportingText: "HH:MM",
    placeholder: "HH:MM",
    disabled: false,
    error: false,
  },
  render: (args) => (
    <Stage>
      <TimePicker
        {...args}
        defaultValue={seedTime(10, 35)}
        ariaLabel="playground time picker"
      />
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onValueChange: fn(), onOpenChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [value, setValue] = useState<TimePickerValue | null>(seedTime(10, 35));
      return (
        <div data-testid="tp-host" className="space-y-4">
          <span data-testid="tp-value" className="block text-on-surface">
            value: {value ? `${String(value.hours).padStart(2, "0")}:${String(value.minutes).padStart(2, "0")}` : "(none)"}
          </span>
          <Stage className="pb-[480px]">
            <TimePicker
              {...args}
              label="Departure"
              value={value}
              onValueChange={(next) => {
                setValue(next);
                args.onValueChange?.(next);
              }}
              ariaLabel="interactive time picker"
            />
          </Stage>
        </div>
      );
    };
    return <InteractiveHost />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("trigger exposes aria-haspopup + aria-expanded=false", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /interactive time picker/i,
      });
      expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    await step("clicking the trigger opens the time dialog", async () => {
      const trigger = await canvas.findByRole("button", {
        name: /interactive time picker/i,
      });
      await userEvent.click(trigger);
      expect(args.onOpenChange).toHaveBeenCalledWith(true);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      const dialog = await canvas.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    await step("hour field is active by default", async () => {
      const dialog = await canvas.findByRole("dialog");
      const hourField = within(dialog).getByLabelText(/Hours,/i);
      expect(hourField).toHaveAttribute("aria-pressed", "true");
    });
  },
};
