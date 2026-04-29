import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "@storybook/test";
import { useEffect, useState } from "react";
import { Progress } from "./Progress";

/**
 * Stories pin progress bars inside a fixed-width host so the linear
 * tracks render at deterministic widths across runs.
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
    data-host="progress-surface"
    style={{ width }}
    className={
      "rounded-shape-md bg-surface p-4 text-on-surface " + (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Progress. Re-skins the MUI LinearProgress + CircularProgress APIs onto the M3 progress-indicator surface (https://m3.material.io/components/progress-indicators/specs). Linear and circular variants paint the active indicator + track via M3 tokens (filled / tonal / outlined / text), three density sizes drive thickness/diameter (sm 4dp / 24dp, md 8dp / 48dp default, lg 12dp / 64dp), determinate/indeterminate modes and the M3 Expressive stop-indicator are first-class.",
      },
    },
  },
  argTypes: {
    type: { control: "inline-radio", options: ["linear", "circular"] },
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    mode: {
      control: "inline-radio",
      options: ["determinate", "indeterminate"],
    },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    showStop: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    type: "linear",
    variant: "filled",
    size: "md",
    shape: "full",
    mode: "determinate",
    value: 60,
    showStop: true,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Progress {...args} aria-label="Default progress" />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Progress variant="filled" value={60} aria-label="Filled" />
      </Surface>
      <Surface>
        <Progress variant="tonal" value={60} aria-label="Tonal" />
      </Surface>
      <Surface>
        <Progress variant="outlined" value={60} aria-label="Outlined" />
      </Surface>
      <Surface>
        <Progress variant="text" value={60} aria-label="Text" />
      </Surface>
      <Surface>
        <div className="flex items-center gap-4">
          <Progress
            type="circular"
            variant="filled"
            value={60}
            aria-label="Circular filled"
          />
          <Progress
            type="circular"
            variant="tonal"
            value={60}
            aria-label="Circular tonal"
          />
          <Progress
            type="circular"
            variant="outlined"
            value={60}
            aria-label="Circular outlined"
          />
          <Progress
            type="circular"
            variant="text"
            value={60}
            aria-label="Circular text"
          />
        </div>
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Progress size="sm" value={50} aria-label="Linear sm" />
      </Surface>
      <Surface>
        <Progress size="md" value={50} aria-label="Linear md" />
      </Surface>
      <Surface>
        <Progress size="lg" value={50} aria-label="Linear lg" />
      </Surface>
      <Surface>
        <div className="flex items-center gap-4">
          <Progress
            type="circular"
            size="sm"
            value={50}
            aria-label="Circular sm"
          />
          <Progress
            type="circular"
            size="md"
            value={50}
            aria-label="Circular md"
          />
          <Progress
            type="circular"
            size="lg"
            value={50}
            aria-label="Circular lg"
          />
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
        <Progress value={60} aria-label="Default" />
      </Surface>
      <Surface>
        <Progress value={60} disabled aria-label="Disabled" />
      </Surface>
      <Surface>
        <Progress value={60} error aria-label="Error" />
      </Surface>
      <Surface>
        <Progress value={60} tabIndex={0} aria-label="Focusable" />
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
            <Progress shape={shape} value={60} aria-label={`Shape ${shape}`} />
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
        <Progress
          value={60}
          label="Uploading…"
          aria-label="With label"
        />
      </Surface>
      <Surface>
        <Progress
          value={60}
          leadingIcon={
            <svg viewBox="0 0 24 24" width={20} height={20}>
              <path
                fill="currentColor"
                d="M12 4 4 12h5v8h6v-8h5z"
              />
            </svg>
          }
          trailingIcon={<span className="text-label-m">60%</span>}
          aria-label="With icons"
        />
      </Surface>
      <Surface>
        <div className="flex items-center gap-4">
          <Progress
            type="circular"
            size="lg"
            value={75}
            label="75%"
            aria-label="Circular with center label"
          />
        </div>
      </Surface>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const MotionDemo = () => {
      const [value, setValue] = useState(20);
      useEffect(() => {
        const t = window.setInterval(
          () => setValue((v) => (v + 7) % 100),
          900,
        );
        return () => window.clearInterval(t);
      }, []);
      return (
        <div className="flex flex-col gap-4">
          <Surface>
            <Progress
              value={value}
              aria-label="Determinate sweep"
            />
          </Surface>
          <Surface>
            <Progress mode="indeterminate" aria-label="Indeterminate linear" />
          </Surface>
          <Surface>
            <div className="flex items-center gap-4">
              <Progress
                type="circular"
                value={value}
                aria-label="Determinate circular"
              />
              <Progress
                type="circular"
                mode="indeterminate"
                aria-label="Indeterminate circular"
              />
            </div>
          </Surface>
        </div>
      );
    };
    return <MotionDemo />;
  },
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Progress
          value={42}
          valueMin={0}
          valueMax={100}
          aria-label="Determinate progress at 42%"
        />
      </Surface>
      <Surface>
        <Progress
          mode="indeterminate"
          aria-label="Indeterminate progress, no aria-valuenow"
        />
      </Surface>
      <Surface>
        <Progress
          value={3}
          valueMin={0}
          valueMax={5}
          label="Step 3 of 5"
          aria-label="Step indicator"
        />
      </Surface>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    type: "linear",
    variant: "filled",
    size: "md",
    shape: "full",
    mode: "determinate",
    value: 60,
    showStop: true,
    disabled: false,
    error: false,
    label: "Adjust the controls in the addons panel.",
  },
  render: (args) => (
    <Surface>
      <Progress {...args} aria-label="Playground" />
    </Surface>
  ),
};

/**
 * Storybook interaction spec. Mounts a determinate linear progress,
 * asserts ARIA wiring, then flips to indeterminate and asserts
 * aria-valuenow drops.
 */
export const InteractionSpec: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const InteractionShell = () => {
      const [mode, setMode] = useState<"determinate" | "indeterminate">(
        "determinate",
      );
      return (
        <Surface>
          <Progress
            mode={mode}
            value={42}
            aria-label="Interaction"
            data-test-id="progress-interaction"
          />
          <button
            type="button"
            data-test-id="progress-mode-toggle"
            onClick={() =>
              setMode((m) =>
                m === "determinate" ? "indeterminate" : "determinate",
              )
            }
            className="mt-3 rounded-shape-full bg-primary px-3 py-1 text-on-primary"
          >
            Toggle mode
          </button>
        </Surface>
      );
    };
    return <InteractionShell />;
  },
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector(
      "[data-component='progress']",
    ) as HTMLElement | null;
    const toggle = canvasElement.querySelector(
      "[data-test-id='progress-mode-toggle']",
    ) as HTMLButtonElement | null;

    await step("progress mounts with role=progressbar", async () => {
      expect(root).not.toBeNull();
      expect(root?.getAttribute("role")).toBe("progressbar");
    });

    await step("determinate exposes aria-valuenow", async () => {
      expect(root?.getAttribute("aria-valuenow")).toBe("42");
      expect(root?.getAttribute("aria-valuemin")).toBe("0");
      expect(root?.getAttribute("aria-valuemax")).toBe("100");
    });

    await step("toggling to indeterminate drops aria-valuenow", async () => {
      toggle?.click();
      // wait a tick for React to re-render
      await new Promise((r) => setTimeout(r, 50));
      const refreshed = canvasElement.querySelector(
        "[data-component='progress']",
      ) as HTMLElement | null;
      expect(refreshed?.getAttribute("data-mode")).toBe("indeterminate");
      expect(refreshed?.getAttribute("aria-valuenow")).toBeNull();
    });
  },
};
