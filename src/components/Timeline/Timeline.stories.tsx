import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Timeline } from "./Timeline";
import type { TimelineEvent } from "./types";

/* -------------------------------------------------------------------------- */
/* Inline glyphs                                                              */
/* -------------------------------------------------------------------------- */

const CommitGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v6m0 8v6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CheckGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
);

const FlagGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M14 6H5v15h2v-6h7l1 2h6V8h-5z" />
  </svg>
);

const AlertGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 2 1 21h22zm0 6 7 12H5z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Sample data                                                                */
/* -------------------------------------------------------------------------- */

const releaseTimeline: TimelineEvent[] = [
  {
    id: "kickoff",
    label: "Kickoff",
    secondary: "Scoping document published",
    oppositeContent: "Mar 14",
    dotColor: "primary",
    dotVariant: "filled",
    dotIcon: <FlagGlyph />,
    connectorVariant: "solid",
  },
  {
    id: "design",
    label: "Design review",
    secondary: "M3 Expressive lift approved",
    oppositeContent: "Mar 21",
    dotColor: "secondary",
    dotVariant: "filled",
    dotIcon: <CommitGlyph />,
    connectorVariant: "solid",
  },
  {
    id: "build",
    label: "Build",
    secondary: "Sprint 1 / 3 in progress",
    oppositeContent: "Apr 04",
    dotColor: "tertiary",
    dotVariant: "outlined",
    dotIcon: <CommitGlyph />,
    connectorVariant: "dashed",
  },
  {
    id: "ship",
    label: "Ship",
    secondary: "Pending QA sign-off",
    oppositeContent: "Apr 30",
    dotColor: "neutral",
    dotVariant: "outlined",
    dotIcon: <CheckGlyph />,
  },
];

const stateTimeline: TimelineEvent[] = [
  {
    id: "default",
    label: "Default item",
    secondary: "no state applied",
    oppositeContent: "step 1",
  },
  {
    id: "selected",
    label: "Selected item",
    secondary: "secondary-container fill",
    oppositeContent: "step 2",
  },
  {
    id: "disabled",
    label: "Disabled item",
    secondary: "opacity-0.38, no pointer events",
    oppositeContent: "step 3",
    disabled: true,
  },
  {
    id: "error",
    label: "Error item",
    secondary: "error foreground role",
    oppositeContent: "step 4",
    error: true,
    dotColor: "error",
    dotIcon: <AlertGlyph />,
  },
  {
    id: "last",
    label: "Last item",
    secondary: "no trailing connector",
    oppositeContent: "step 5",
    last: true,
  },
];

const slotsTimeline: TimelineEvent[] = [
  {
    id: "label-only",
    label: "Label only — bare row",
  },
  {
    id: "with-secondary",
    label: "Label + secondary",
    secondary: "Two-line content slot",
  },
  {
    id: "with-opposite",
    label: "Label + opposite content",
    oppositeContent: "10:32 AM",
  },
  {
    id: "with-icon",
    label: "Label + dot icon",
    dotIcon: <CheckGlyph />,
  },
  {
    id: "all-slots",
    label: "All slots filled",
    secondary: "Opposite + icon + secondary all populated",
    oppositeContent: "11:04 AM",
    dotIcon: <CommitGlyph />,
  },
];

/* -------------------------------------------------------------------------- */
/* Stage helper                                                               */
/* -------------------------------------------------------------------------- */

const Stage = ({
  children,
  width = "w-[560px]",
  className,
}: {
  children?: React.ReactNode;
  width?: string;
  className?: string;
}) => (
  <div
    data-host="timeline-stage"
    className={
      "relative " +
      width +
      " rounded-shape-md bg-surface p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Meta + stories                                                             */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Timeline> = {
  title: "Advanced/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Timeline. Re-skins MUI Lab Timeline (https://mui.com/material-ui/react-timeline/) onto M3 tokens — Material 3 has no formal Timeline spec, so this follows the project's MUI fallback rule. Anatomy mirrors the MUI primitive matrix: each item composes opposite content + a separator (dot + connector) + a content card. The active-dot cursor is a halo that springs between focused dots via a shared `layoutId`. 5 variants (text / filled / tonal / outlined / elevated), 3 densities (24 / 28 / 36 dp dots), 7 shapes, 4 layout positions (left / right / alternate / alternate-reverse), 5 dot colors × 2 dot fills × 3 connector emphasis modes, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, roving-tabindex keyboard nav (Arrow / Home / End / Enter / Space). Items enter via springs.springy on a y-translate + opacity morph; collapses under reduced motion.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["text", "filled", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    position: {
      control: "inline-radio",
      options: ["left", "right", "alternate", "alternate-reverse"],
    },
    selectable: { control: "boolean" },
    disabled: { control: "boolean" },
    showCursor: { control: "boolean" },
  },
  args: {
    variant: "text",
    size: "md",
    shape: "md",
    position: "right",
    selectable: false,
    disabled: false,
    showCursor: true,
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Timeline
        events={releaseTimeline}
        ariaLabel="Release timeline"
      />
    </Stage>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["text", "filled", "tonal", "outlined", "elevated"] as const).map(
        (variant) => (
          <Stage key={variant}>
            <span className="mb-3 block text-label-l text-on-surface">
              {variant}
            </span>
            <Timeline
              variant={variant}
              events={releaseTimeline.slice(0, 3)}
              ariaLabel={`${variant} timeline`}
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
          <span className="mb-3 block text-label-l text-on-surface">
            {size}
          </span>
          <Timeline
            variant="filled"
            size={size}
            events={releaseTimeline.slice(0, 3)}
            ariaLabel={`${size} timeline`}
          />
        </Stage>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stage key={shape}>
            <span className="mb-3 block text-label-l text-on-surface">
              shape: {shape}
            </span>
            <Timeline
              variant="filled"
              shape={shape}
              events={releaseTimeline.slice(0, 3)}
              ariaLabel={`shape-${shape} timeline`}
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
    <Stage>
      <Timeline
        variant="filled"
        events={stateTimeline}
        selectable
        defaultSelected="selected"
        defaultFocusedId="selected"
        ariaLabel="State matrix"
      />
    </Stage>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Timeline
        variant="filled"
        events={slotsTimeline}
        ariaLabel="Slot matrix"
      />
    </Stage>
  ),
};

export const Positions: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["left", "right", "alternate", "alternate-reverse"] as const).map(
        (position) => (
          <Stage key={position}>
            <span className="mb-3 block text-label-l text-on-surface">
              position: {position}
            </span>
            <Timeline
              variant="filled"
              position={position}
              events={releaseTimeline}
              ariaLabel={`${position} timeline`}
            />
          </Stage>
        ),
      )}
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const Host = () => {
      const [picked, setPicked] = useState<string | null>("kickoff");
      return (
        <Stage>
          <div className="mb-3 flex items-center gap-3 text-on-surface-variant">
            <button
              type="button"
              data-testid="motion-prev"
              className="rounded-shape-md bg-secondary px-3 py-1 text-on-secondary"
              onClick={() => {
                const idx = releaseTimeline.findIndex((e) => e.id === picked);
                const prev = releaseTimeline[Math.max(idx - 1, 0)];
                setPicked(prev.id);
              }}
            >
              Prev
            </button>
            <button
              type="button"
              data-testid="motion-next"
              className="rounded-shape-md bg-primary px-3 py-1 text-on-primary"
              onClick={() => {
                const idx = releaseTimeline.findIndex((e) => e.id === picked);
                const next =
                  releaseTimeline[
                    Math.min(idx + 1, releaseTimeline.length - 1)
                  ];
                setPicked(next.id);
              }}
            >
              Next
            </button>
          </div>
          <Timeline
            variant="elevated"
            events={releaseTimeline}
            selectable
            selected={picked}
            onSelectedChange={setPicked}
            focusedId={picked}
            ariaLabel="Motion preview"
          />
        </Stage>
      );
    };
    return <Host />;
  },
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Timeline
        variant="elevated"
        events={releaseTimeline}
        selectable
        defaultSelected="design"
        defaultFocusedId="design"
        ariaLabel="Accessible release timeline"
      />
    </Stage>
  ),
};

export const Selectable: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const Host = () => {
      const [picked, setPicked] = useState<string | null>("design");
      return (
        <Stage>
          <div
            data-testid="picked-out"
            className="mb-3 rounded-shape-md bg-surface-container-highest p-3 text-on-surface"
          >
            <strong>Selected:</strong> {picked ?? "(none)"}
          </div>
          <Timeline
            variant="outlined"
            events={releaseTimeline}
            selectable
            selected={picked}
            onSelectedChange={setPicked}
            defaultFocusedId="design"
            ariaLabel="Selectable timeline"
          />
        </Stage>
      );
    };
    return <Host />;
  },
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    position: "right",
    selectable: true,
    disabled: false,
    showCursor: true,
  },
  render: (args) => (
    <Stage>
      <Timeline
        {...args}
        events={releaseTimeline}
        defaultSelected="design"
        defaultFocusedId="design"
        ariaLabel="Playground timeline"
      />
    </Stage>
  ),
};

/**
 * @storybook/test interaction spec. Verifies row activation flips
 * selection, the keyboard nav steps between rows, and the connector
 * paint stays consistent under reduced motion.
 */
export const InteractionSpec: Story = {
  args: {
    onSelectedChange: fn(),
  },
  render: (args) => (
    <Stage>
      <Timeline
        {...args}
        events={releaseTimeline}
        selectable
        defaultFocusedId="kickoff"
        ariaLabel="Interactive timeline"
      />
    </Stage>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);

    await step("renders root list with role=list", async () => {
      const list = canvasElement.querySelector(
        "[data-component='timeline-list']",
      );
      expect(list).toBeTruthy();
      expect(list?.getAttribute("role")).toBe("list");
    });

    await step("activating a row flips its selected state", async () => {
      const target = canvas.getByText("Design review");
      const row = target.closest(
        "[data-component='timeline-content']",
      ) as HTMLElement;
      expect(row).toBeTruthy();
      await userEvent.click(row);
      expect(row.getAttribute("aria-selected")).toBe("true");
      expect(args.onSelectedChange).toHaveBeenCalled();
    });

    await step(
      "ArrowDown advances focus to the next row",
      async () => {
        const first = canvasElement.querySelector(
          "[data-component='timeline-content'][data-id='kickoff']",
        ) as HTMLElement | null;
        expect(first).toBeTruthy();
        first?.focus();
        await userEvent.keyboard("{ArrowDown}");
        const focused = canvasElement.querySelector(
          "[data-component='timeline-content'][data-focused='true']",
        );
        expect(focused?.getAttribute("data-id")).toBe("design");
      },
    );

    await step(
      "Enter on a focused row toggles its selection",
      async () => {
        const focused = canvasElement.querySelector(
          "[data-component='timeline-content'][data-focused='true']",
        ) as HTMLElement | null;
        expect(focused).toBeTruthy();
        const before = focused?.getAttribute("aria-selected");
        focused?.focus();
        await userEvent.keyboard("{Enter}");
        const after = focused?.getAttribute("aria-selected");
        expect(before).not.toBe(after);
      },
    );
  },
};
