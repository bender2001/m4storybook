import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { type ReactElement } from "react";
import { CssBaseline } from "./CssBaseline";

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

const meta: Meta<typeof CssBaseline> = {
  title: "Utils/CSS Baseline",
  component: CssBaseline,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "M3-tokenized CSS Baseline. Polymorphic reset shell that resets margin, applies M3 surface + on-surface roles, antialiased font smoothing, and box-sizing across the subtree. Five surface variants, three densities, full M3 shape scale, MUI-compatible `enableColorScheme`, plus the standard M3 motion envelope. Re-skin source: MUI CssBaseline — https://mui.com/material-ui/react-css-baseline/. Token sources: surface roles, type scale, elevation tokens, motion easings.",
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
    scoped: { control: "boolean" },
    enableColorScheme: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "none",
    scoped: true,
    enableColorScheme: false,
    selected: false,
    disabled: false,
    error: false,
    children: "M3 baseline reset cascades through descendants.",
  },
};

export default meta;
type Story = StoryObj<typeof CssBaseline>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <CssBaseline variant="text" size="sm" shape="md" label="text">
        Transparent host (scoped reset only)
      </CssBaseline>
      <CssBaseline variant="filled" size="sm" shape="md" label="filled">
        surface (matches MUI body baseline)
      </CssBaseline>
      <CssBaseline variant="tonal" size="sm" shape="md" label="tonal">
        secondary-container
      </CssBaseline>
      <CssBaseline variant="outlined" size="sm" shape="md" label="outlined">
        1dp outline-variant border
      </CssBaseline>
      <CssBaseline variant="elevated" size="sm" shape="md" label="elevated">
        surface-container-low + elevation-1
      </CssBaseline>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <CssBaseline variant="filled" size="sm" shape="md" label="sm">
        Small density (12dp pad / body-s / 48dp min-height)
      </CssBaseline>
      <CssBaseline variant="filled" size="md" shape="md" label="md">
        Medium density (24dp pad / body-m / 64dp min-height)
      </CssBaseline>
      <CssBaseline variant="filled" size="lg" shape="md" label="lg">
        Large density (40dp pad / body-l / 80dp min-height)
      </CssBaseline>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <CssBaseline
            key={shape}
            variant="filled"
            size="sm"
            shape={shape}
            label={`shape-${shape}`}
          >
            shape token: {shape}
          </CssBaseline>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <CssBaseline variant="filled" size="sm" shape="md">
        Resting
      </CssBaseline>
      <CssBaseline variant="filled" size="sm" shape="md" selected>
        Selected (secondary-container + aria-selected)
      </CssBaseline>
      <CssBaseline variant="filled" size="sm" shape="md" disabled>
        Disabled (opacity 0.38 + aria-disabled)
      </CssBaseline>
      <CssBaseline variant="filled" size="sm" shape="md" error>
        Error (error-container + aria-invalid)
      </CssBaseline>
      <CssBaseline variant="elevated" size="sm" shape="md">
        Elevated (surface-container-low + elevation-1)
      </CssBaseline>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <CssBaseline
        variant="filled"
        size="sm"
        shape="md"
        label="Baseline with leading icon"
        leadingIcon={<StarGlyph />}
      />
      <CssBaseline
        variant="filled"
        size="sm"
        shape="md"
        label="Baseline with trailing icon"
        trailingIcon={<ChevronGlyph />}
      />
      <CssBaseline
        variant="outlined"
        size="sm"
        shape="md"
        label="Baseline with both icons + body"
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
      >
        Body content sits below the header row.
      </CssBaseline>
    </div>
  ),
};

export const ColorScheme: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <CssBaseline
        variant="filled"
        size="sm"
        shape="md"
        label="enableColorScheme = false"
      >
        Native form controls follow the document color-scheme.
      </CssBaseline>
      <CssBaseline
        variant="filled"
        size="sm"
        shape="md"
        enableColorScheme
        label="enableColorScheme = true"
      >
        Host writes color-scheme: light dark so descendants honour both palettes.
      </CssBaseline>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <CssBaseline
        variant="filled"
        size="sm"
        shape="md"
        label="medium2 / emphasized"
        trailingIcon={<ChevronGlyph />}
      >
        Baseline transitions ride medium2 (300ms) on emphasized easing.
      </CssBaseline>
      <CssBaseline
        variant="elevated"
        size="sm"
        shape="md"
        label="reduced-motion safe"
        trailingIcon={<ChevronGlyph />}
      >
        Reduced motion collapses transitions to instant.
      </CssBaseline>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <CssBaseline
        as="section"
        variant="outlined"
        size="sm"
        shape="md"
        aria-label="Polymorphic section"
        label="Polymorphic"
      >
        Default `as=&quot;section&quot;` — scoped reset reads as a region landmark.
      </CssBaseline>
      <CssBaseline
        as="div"
        variant="filled"
        size="sm"
        shape="md"
        label="div host"
      >
        Override `as=&quot;div&quot;` — host drops the implicit region role.
      </CssBaseline>
      <CssBaseline
        variant="outlined"
        size="sm"
        shape="md"
        error
        aria-label="Error region"
        label="Error region"
      >
        aria-invalid is set automatically when `error` is true.
      </CssBaseline>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    label: "CssBaseline playground",
    children: "Adjust the controls to explore the baseline matrix.",
  },
};

/**
 * @storybook/test interaction spec. Asserts the CssBaseline mounts as a
 * labelled region landmark with the correct ARIA wiring + token data
 * attributes; the reset host itself is non-interactive (it is a scoped
 * baseline), so the spec validates structure rather than event handling.
 */
export const InteractionSpec: Story = {
  args: {
    "aria-label": "Interaction Baseline",
    label: "Interaction Baseline",
    children: "Reset host does not paint a state layer.",
  },
  render: (args) => (
    <CssBaseline
      {...args}
      as="section"
      variant="filled"
      size="md"
      shape="md"
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Interaction Baseline" });

    await step("CssBaseline mounts as a labelled region landmark", async () => {
      expect(region).toBeInTheDocument();
      expect(region.getAttribute("data-component")).toBe("css-baseline");
      expect(region.getAttribute("data-variant")).toBe("filled");
      expect(region.getAttribute("data-size")).toBe("md");
      expect(region.getAttribute("data-shape")).toBe("md");
      expect(region.getAttribute("data-scoped")).toBe("true");
    });

    await step("Header label slot renders the configured label", async () => {
      const label = region.querySelector("[data-slot='label']");
      expect(label).not.toBeNull();
      expect(label?.textContent).toBe("Interaction Baseline");
    });

    await step("Body slot renders the children block", async () => {
      const body = region.querySelector("[data-slot='body']");
      expect(body).not.toBeNull();
      expect(body?.textContent).toContain("Reset host does not paint");
    });
  },
};
