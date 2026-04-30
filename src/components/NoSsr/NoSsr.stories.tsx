import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "@storybook/test";
import { useState, type ReactElement } from "react";
import { NoSsr } from "./NoSsr";

const StarGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const ChevronGlyph = (): ReactElement => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M9 6l6 6-6 6 1.4 1.4L17.8 12 10.4 4.6z" />
  </svg>
);

const meta: Meta<typeof NoSsr> = {
  title: "Utils/No SSR",
  component: NoSsr,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "M3-tokenized No SSR slot. MUI's `<NoSsr />` is a deferred-render utility that mounts children only on the client; M3 has no equivalent, so we re-skin it as a surface-aware deferred slot with five M3 surface variants, three densities, the full M3 shape scale, three deferred-mount strategies (mount / defer / idle), and emphasized 300ms motion for the pending → mounted transition. Re-skin source: MUI NoSsr — https://mui.com/material-ui/react-no-ssr/.",
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
    strategy: {
      control: "inline-radio",
      options: ["mount", "defer", "idle"],
    },
    defer: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "lg",
    strategy: "mount",
    defer: false,
    selected: false,
    disabled: false,
    error: false,
    children: "Deferred children mount only on the client.",
  },
};

export default meta;
type Story = StoryObj<typeof NoSsr>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <NoSsr variant="text" size="sm" shape="md" label="text">
        Transparent host (deferred slot only)
      </NoSsr>
      <NoSsr variant="filled" size="sm" shape="md" label="filled">
        surface (M3 default)
      </NoSsr>
      <NoSsr variant="tonal" size="sm" shape="md" label="tonal">
        secondary-container
      </NoSsr>
      <NoSsr variant="outlined" size="sm" shape="md" label="outlined">
        1dp outline-variant border
      </NoSsr>
      <NoSsr variant="elevated" size="sm" shape="md" label="elevated">
        surface-container-low + elevation-1
      </NoSsr>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <NoSsr variant="filled" size="sm" shape="md" label="sm">
        Small density (12dp pad / body-s / 48dp min-height)
      </NoSsr>
      <NoSsr variant="filled" size="md" shape="md" label="md">
        Medium density (24dp pad / body-m / 64dp min-height)
      </NoSsr>
      <NoSsr variant="filled" size="lg" shape="md" label="lg">
        Large density (40dp pad / body-l / 80dp min-height)
      </NoSsr>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <NoSsr
            key={shape}
            variant="filled"
            size="sm"
            shape={shape}
            label={`shape-${shape}`}
          >
            shape token: {shape}
          </NoSsr>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <NoSsr variant="filled" size="sm" shape="md">
        Resting
      </NoSsr>
      <NoSsr variant="filled" size="sm" shape="md" selected>
        Selected (secondary-container + aria-selected)
      </NoSsr>
      <NoSsr variant="filled" size="sm" shape="md" disabled>
        Disabled (opacity 0.38 + aria-disabled)
      </NoSsr>
      <NoSsr variant="filled" size="sm" shape="md" error>
        Error (error-container + aria-invalid)
      </NoSsr>
      <NoSsr variant="elevated" size="sm" shape="md">
        Elevated (surface-container-low + elevation-1)
      </NoSsr>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <NoSsr
        variant="filled"
        size="sm"
        shape="md"
        label="Deferred panel with leading icon"
        leadingIcon={<StarGlyph />}
      />
      <NoSsr
        variant="filled"
        size="sm"
        shape="md"
        label="Deferred panel with trailing icon"
        trailingIcon={<ChevronGlyph />}
      />
      <NoSsr
        variant="outlined"
        size="sm"
        shape="md"
        label="Deferred panel with both icons + body"
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
      >
        Body content sits below the header row, mounted on the client.
      </NoSsr>
    </div>
  ),
};

export const Strategies: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <NoSsr
        variant="filled"
        size="sm"
        shape="md"
        strategy="mount"
        label="strategy = mount"
      >
        Children commit on the first useEffect tick (MUI default).
      </NoSsr>
      <NoSsr
        variant="filled"
        size="sm"
        shape="md"
        strategy="defer"
        label="strategy = defer"
      >
        Children commit one animation frame after mount.
      </NoSsr>
      <NoSsr
        variant="filled"
        size="sm"
        shape="md"
        strategy="idle"
        label="strategy = idle"
      >
        Children commit when the browser is idle.
      </NoSsr>
    </div>
  ),
};

export const Fallback: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <NoSsr
        variant="outlined"
        size="sm"
        shape="md"
        strategy="defer"
        label="With fallback"
        fallback={<span>Loading deferred children…</span>}
      >
        Deferred children replace the fallback after one animation frame.
      </NoSsr>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <NoSsr
        variant="filled"
        size="sm"
        shape="md"
        label="medium2 / emphasized"
        trailingIcon={<ChevronGlyph />}
      >
        Container transitions ride medium2 (300ms) on emphasized easing.
      </NoSsr>
      <NoSsr
        variant="elevated"
        size="sm"
        shape="md"
        label="reduced-motion safe"
        trailingIcon={<ChevronGlyph />}
      >
        Reduced motion collapses transitions to instant.
      </NoSsr>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <NoSsr
        as="section"
        variant="outlined"
        size="sm"
        shape="md"
        aria-label="Polymorphic section"
        label="Polymorphic"
      >
        Default `as=&quot;section&quot;` — deferred slot reads as a region landmark.
      </NoSsr>
      <NoSsr
        as="div"
        variant="filled"
        size="sm"
        shape="md"
        label="div host"
      >
        Override `as=&quot;div&quot;` — host drops the implicit region role.
      </NoSsr>
      <NoSsr
        variant="outlined"
        size="sm"
        shape="md"
        error
        aria-label="Error region"
        label="Error region"
      >
        aria-invalid is set automatically when `error` is true.
      </NoSsr>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "lg",
    label: "NoSsr playground",
    children: "Adjust the controls to explore the deferred-slot matrix.",
  },
};

/**
 * @storybook/test interaction spec. Asserts the NoSsr deferred mount
 * commits children to the DOM, flips aria-busy, and the data-mounted
 * attribute reflects the deferred-render lifecycle.
 */
export const InteractionSpec: Story = {
  args: {
    "aria-label": "Interaction NoSsr",
    label: "Interaction NoSsr",
  },
  render: function InteractionRender(args) {
    const [mounts, setMounts] = useState(0);
    return (
      <div className="flex flex-col gap-3 p-4">
        <NoSsr
          {...args}
          as="section"
          variant="filled"
          size="md"
          shape="md"
          strategy="defer"
          fallback={<span data-testid="ns-fallback">Pending…</span>}
          onMount={() => setMounts((n) => n + 1)}
        >
          <span data-testid="ns-body">Deferred body</span>
        </NoSsr>
        <span data-testid="ns-mount-count">{mounts}</span>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Interaction NoSsr" });

    await step("NoSsr mounts as a labelled region landmark", async () => {
      expect(region).toBeInTheDocument();
      expect(region.getAttribute("data-component")).toBe("no-ssr");
      expect(region.getAttribute("data-strategy")).toBe("defer");
    });

    await step("Deferred children commit after the strategy resolves", async () => {
      await waitFor(() => {
        expect(region.getAttribute("data-mounted")).toBe("true");
      });
      expect(region.getAttribute("aria-busy")).toBeNull();
      expect(canvas.getByTestId("ns-body")).toBeInTheDocument();
    });

    await step("onMount fires exactly once for the deferred commit", async () => {
      await waitFor(() => {
        expect(canvas.getByTestId("ns-mount-count").textContent).toBe("1");
      });
    });
  },
};
