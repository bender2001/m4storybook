import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";
import { useState } from "react";
import { Skeleton } from "./Skeleton";

/**
 * Stories pin skeletons inside a fixed-width host so the placeholders
 * render at deterministic widths across runs.
 */
const Surface = ({
  children,
  width = 320,
  className,
}: {
  children?: React.ReactNode;
  width?: number;
  className?: string;
}) => (
  <div
    data-host="skeleton-surface"
    style={{ width }}
    className={
      "rounded-shape-md bg-surface p-4 text-on-surface " + (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Skeleton> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Skeleton. Re-skins the MUI Skeleton API onto the M3 surface tonal step (`surface-container-high`) so loading states read as a tonal recess, not a disabled control. Four geometric types (text / rectangular / rounded / circular), four token-driven variants (filled / tonal / outlined / text), three density sizes, and three animation modes (pulse / wave / none) cover the full MUI contract.",
      },
    },
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["text", "rectangular", "rounded", "circular"],
    },
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    animation: {
      control: "inline-radio",
      options: ["pulse", "wave", "none"],
    },
    lines: { control: { type: "number", min: 1, max: 6, step: 1 } },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    type: "text",
    variant: "filled",
    size: "md",
    animation: "pulse",
    lines: 1,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Skeleton {...args} aria-label="Default skeleton" />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Skeleton type="rounded" variant="filled" aria-label="Filled" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" variant="tonal" aria-label="Tonal" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" variant="outlined" aria-label="Outlined" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" variant="text" aria-label="Text" />
      </Surface>
    </div>
  ),
};

export const Types: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Skeleton type="text" aria-label="Text type" />
      </Surface>
      <Surface>
        <Skeleton type="rectangular" aria-label="Rectangular type" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" aria-label="Rounded type" />
      </Surface>
      <Surface>
        <Skeleton type="circular" aria-label="Circular type" />
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <div className="flex flex-col gap-3">
          <Skeleton type="text" size="sm" aria-label="Text sm" />
          <Skeleton type="text" size="md" aria-label="Text md" />
          <Skeleton type="text" size="lg" aria-label="Text lg" />
        </div>
      </Surface>
      <Surface>
        <div className="flex flex-col gap-3">
          <Skeleton type="rounded" size="sm" aria-label="Rounded sm" />
          <Skeleton type="rounded" size="md" aria-label="Rounded md" />
          <Skeleton type="rounded" size="lg" aria-label="Rounded lg" />
        </div>
      </Surface>
      <Surface>
        <div className="flex items-center gap-4">
          <Skeleton type="circular" size="sm" aria-label="Circular sm" />
          <Skeleton type="circular" size="md" aria-label="Circular md" />
          <Skeleton type="circular" size="lg" aria-label="Circular lg" />
        </div>
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Skeleton type="rounded" aria-label="Default" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" disabled aria-label="Disabled" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" error aria-label="Error" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" tabIndex={0} aria-label="Focusable" />
      </Surface>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Surface key={shape}>
            <Skeleton
              type="rectangular"
              shape={shape}
              aria-label={`Shape ${shape}`}
            />
          </Surface>
        ),
      )}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Skeleton type="text" lines={3} aria-label="Three text lines" />
      </Surface>
      <Surface>
        <div className="flex items-center gap-3">
          <Skeleton type="circular" size="md" aria-label="Avatar placeholder" />
          <div className="flex-1">
            <Skeleton type="text" lines={2} aria-label="Two-line caption" />
          </div>
        </div>
      </Surface>
      <Surface>
        <Skeleton
          type="rounded"
          leadingIcon={
            <svg viewBox="0 0 24 24" width={20} height={20}>
              <path
                fill="currentColor"
                d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"
              />
            </svg>
          }
          trailingIcon={<span className="text-label-m">Loading…</span>}
          aria-label="With icons"
        />
      </Surface>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Skeleton type="rounded" animation="pulse" aria-label="Pulse" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" animation="wave" aria-label="Wave" />
      </Surface>
      <Surface>
        <Skeleton type="rounded" animation="none" aria-label="Static" />
      </Surface>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Skeleton
          type="text"
          lines={2}
          aria-label="Loading article preview"
        />
      </Surface>
      <Surface>
        <Skeleton type="rounded" aria-label="Loading hero image" />
      </Surface>
      <Surface>
        <div className="flex items-center gap-3">
          <Skeleton
            type="circular"
            size="md"
            aria-label="Loading user avatar"
          />
          <Skeleton type="text" lines={1} aria-label="Loading user name" />
        </div>
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    type: "rounded",
    variant: "filled",
    size: "md",
    animation: "pulse",
    lines: 1,
    disabled: false,
    error: false,
  },
  render: (args) => (
    <Surface>
      <Skeleton {...args} aria-label="Playground" />
    </Surface>
  ),
};

/**
 * Storybook interaction spec. Verifies role/aria-busy wiring and the
 * static placeholder still mounts correctly when animation is `none`.
 */
export const InteractionSpec: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const InteractionShell = () => {
      const [animation, setAnimation] = useState<"pulse" | "wave" | "none">(
        "pulse",
      );
      return (
        <Surface>
          <Skeleton
            type="rounded"
            animation={animation}
            aria-label="Interaction skeleton"
            data-test-id="skeleton-interaction"
          />
          <button
            type="button"
            data-test-id="skeleton-animation-toggle"
            onClick={() =>
              setAnimation((current) =>
                current === "pulse"
                  ? "wave"
                  : current === "wave"
                    ? "none"
                    : "pulse",
              )
            }
            className="mt-3 rounded-shape-full bg-primary px-3 py-1 text-on-primary"
          >
            Cycle animation
          </button>
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector(
      "[data-component='skeleton']",
    ) as HTMLElement | null;
    const toggle = canvasElement.querySelector(
      "[data-test-id='skeleton-animation-toggle']",
    ) as HTMLButtonElement | null;

    await step("skeleton mounts with role=status + aria-busy", async () => {
      expect(root).not.toBeNull();
      expect(root?.getAttribute("role")).toBe("status");
      expect(root?.getAttribute("aria-busy")).toBe("true");
      expect(root?.getAttribute("aria-live")).toBe("polite");
    });

    await step("default animation is pulse", async () => {
      expect(root?.getAttribute("data-animation")).toBe("pulse");
    });

    await step("toggle cycles pulse -> wave -> none", async () => {
      toggle?.click();
      await new Promise((r) => setTimeout(r, 50));
      const refreshed = canvasElement.querySelector(
        "[data-component='skeleton']",
      ) as HTMLElement | null;
      expect(refreshed?.getAttribute("data-animation")).toBe("wave");
      toggle?.click();
      await new Promise((r) => setTimeout(r, 50));
      const refreshed2 = canvasElement.querySelector(
        "[data-component='skeleton']",
      ) as HTMLElement | null;
      expect(refreshed2?.getAttribute("data-animation")).toBe("none");
    });
  },
};
