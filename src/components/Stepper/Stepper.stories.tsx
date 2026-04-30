import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Stepper } from "./Stepper";
import type { StepperStep } from "./types";

const sampleSteps: StepperStep[] = [
  { key: "select", label: "Select campaign settings" },
  { key: "create", label: "Create an ad group" },
  { key: "review", label: "Create an ad" },
];

const richSteps: StepperStep[] = [
  {
    key: "select",
    label: "Select campaign settings",
    description: "Pick the goal that fits the campaign.",
  },
  {
    key: "create",
    label: "Create an ad group",
    description: "Group your ads by audience or theme.",
  },
  {
    key: "review",
    label: "Review + launch",
    description: "Confirm pricing + go live.",
    optional: "Optional",
  },
];

const verticalSteps: StepperStep[] = [
  {
    key: "select",
    label: "Select campaign settings",
    description: "Choose the goal that fits the campaign.",
    content: (
      <p>
        Choose between display, video, or shopping placements to match your
        brand objectives.
      </p>
    ),
  },
  {
    key: "create",
    label: "Create an ad group",
    description: "Group your ads by audience or theme.",
    content: (
      <p>
        Ad groups bundle creatives that share the same target audience and
        bidding strategy.
      </p>
    ),
  },
  {
    key: "review",
    label: "Review + launch",
    optional: "Optional",
    content: <p>Confirm pricing, audience, and creatives, then launch.</p>,
  },
];

const Stage = ({
  children,
  className,
  width = "w-[680px]",
}: {
  children?: React.ReactNode;
  className?: string;
  width?: string;
}) => (
  <div
    data-host="stepper-stage"
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

const meta: Meta<typeof Stepper> = {
  title: "Navigation/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Stepper. Re-skins MUI's `<Stepper />` (https://mui.com/material-ui/react-stepper/) onto M3 navigation tokens. The active-step container morphs from `shape-full` (circle) to the selected `shape` token via a springy motion/react transition - the same M3 Expressive selection pattern used by Pagination + Navigation Rail. Connector segments fill from `outline-variant` to `primary` via a width/height transition. 5 variants (filled / tonal / outlined / text / elevated), 3 sizes, 2 orientations (horizontal / vertical), 7 shapes, optional alternative-label layout, hover 0.08 / focus 0.10 / pressed 0.10 state-layers on reachable steps, and roving-tabindex keyboard nav (Arrow / Home / End / Enter / Space).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    activeStep: { control: { type: "number", min: 0, max: 5 } },
    linear: { control: "boolean" },
    alternativeLabel: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    orientation: "horizontal",
    shape: "md",
    linear: true,
    alternativeLabel: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Stepper steps={sampleSteps} activeStep={1} ariaLabel="Default stepper" />
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
            <Stepper
              variant={variant}
              steps={sampleSteps}
              activeStep={1}
              ariaLabel={`${variant} stepper`}
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
          <Stepper
            size={size}
            steps={sampleSteps}
            activeStep={1}
            ariaLabel={`${size} stepper`}
          />
        </Stage>
      ))}
    </div>
  ),
};

export const Orientations: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          horizontal
        </span>
        <Stepper
          orientation="horizontal"
          steps={sampleSteps}
          activeStep={1}
          ariaLabel="horizontal stepper"
        />
      </Stage>
      <Stage width="w-[420px]">
        <span className="block text-label-l text-on-surface mb-3">
          vertical
        </span>
        <Stepper
          orientation="vertical"
          steps={verticalSteps}
          activeStep={1}
          ariaLabel="vertical stepper"
        />
      </Stage>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stage key={shape}>
            <span className="block text-label-l text-on-surface mb-3">
              {shape}
            </span>
            <Stepper
              shape={shape}
              steps={sampleSteps}
              activeStep={1}
              ariaLabel={`shape ${shape}`}
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
          first step
        </span>
        <Stepper
          steps={sampleSteps}
          activeStep={0}
          ariaLabel="first step stepper"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          mid-progress
        </span>
        <Stepper
          steps={sampleSteps}
          activeStep={1}
          ariaLabel="mid-progress stepper"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          last step
        </span>
        <Stepper
          steps={sampleSteps}
          activeStep={2}
          ariaLabel="last step stepper"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">error</span>
        <Stepper
          steps={[
            { key: "select", label: "Select campaign settings" },
            { key: "create", label: "Create an ad group", error: true },
            { key: "review", label: "Create an ad" },
          ]}
          activeStep={1}
          ariaLabel="error stepper"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled stepper
        </span>
        <Stepper
          steps={sampleSteps}
          activeStep={1}
          disabled
          ariaLabel="disabled stepper"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled step
        </span>
        <Stepper
          steps={[
            { key: "select", label: "Select campaign settings" },
            {
              key: "create",
              label: "Create an ad group",
              disabled: true,
            },
            { key: "review", label: "Create an ad" },
          ]}
          activeStep={0}
          linear={false}
          ariaLabel="disabled step stepper"
        />
      </Stage>
    </div>
  ),
};

export const AlternativeLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Stepper
        steps={sampleSteps}
        activeStep={1}
        alternativeLabel
        ariaLabel="alternative-label stepper"
      />
    </Stage>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Stepper
        steps={[
          {
            key: "settings",
            label: "Settings",
            icon: (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="62%"
                height="62%"
                fill="currentColor"
              >
                <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7 7 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7 7 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64L4.57 11c-.04.32-.07.65-.07.98 0 .33.03.65.07.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.23.42.31.61.22l2.49-1a7 7 0 0 0 1.69.98l.38 2.65c.06.24.27.42.49.42h4c.25 0 .45-.18.49-.42l.38-2.65a7 7 0 0 0 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
              </svg>
            ),
          },
          {
            key: "billing",
            label: "Billing",
            icon: (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="62%"
                height="62%"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
            ),
          },
          {
            key: "complete",
            label: "Complete",
            icon: (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="62%"
                height="62%"
                fill="currentColor"
              >
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19l12-12-1.4-1.4z" />
              </svg>
            ),
          },
        ]}
        activeStep={1}
        ariaLabel="custom-icon stepper"
      />
    </Stage>
  ),
};

export const NonLinear: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Stepper
        steps={richSteps}
        activeStep={1}
        linear={false}
        ariaLabel="non-linear stepper"
      />
    </Stage>
  ),
};

export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage width="w-[460px]">
      <Stepper
        orientation="vertical"
        steps={verticalSteps}
        activeStep={1}
        ariaLabel="vertical stepper"
      />
    </Stage>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    orientation: "horizontal",
    shape: "md",
    activeStep: 1,
    linear: true,
    alternativeLabel: false,
    disabled: false,
  },
  render: (args) => (
    <Stage>
      <Stepper
        {...args}
        steps={richSteps}
        ariaLabel="playground stepper"
      />
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onStepChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [active, setActive] = useState(0);
      return (
        <div data-testid="stepper-host" className="space-y-4">
          <span data-testid="active-key" className="block text-on-surface">
            active: {richSteps[active]?.key ?? "(none)"}
          </span>
          <Stage>
            <Stepper
              {...args}
              steps={richSteps}
              activeStep={active}
              linear={false}
              ariaLabel="interactive stepper"
              onStepChange={(next, key) => {
                setActive(next);
                args.onStepChange?.(next, key);
              }}
            />
          </Stage>
        </div>
      );
    };
    return <InteractiveHost />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const activeKey = await canvas.findByTestId("active-key");

    await step("first step renders aria-current=step", async () => {
      const list = await canvas.findByRole("list", {
        name: /interactive stepper/i,
      });
      expect(list).toHaveAttribute("aria-orientation", "horizontal");
      const items = await canvas.findAllByRole("listitem");
      expect(items[0]).toHaveAttribute("aria-current", "step");
    });

    await step(
      "clicking a future step calls onStepChange + advances active",
      async () => {
        const buttons = canvas
          .getAllByRole("button")
          .filter((b) => b.getAttribute("data-slot") === "step-button");
        await userEvent.click(buttons[2]);
        expect(args.onStepChange).toHaveBeenCalledWith(2, "review");
        expect(activeKey).toHaveTextContent("active: review");
      },
    );
  },
};
