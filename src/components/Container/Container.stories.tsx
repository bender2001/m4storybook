import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { type ReactElement } from "react";
import { Container } from "./Container";

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

const meta: Meta<typeof Container> = {
  title: "Layout/Container",
  component: Container,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "M3-tokenized Container. Polymorphic layout shell that centres content horizontally and clamps it to a breakpoint-sized max-width. Five surface variants, three densities, full M3 shape scale, MUI-compatible `maxWidth` / `fixed` / `disableGutters` props, plus the standard M3 motion envelope. Re-skin source: MUI Container — https://mui.com/material-ui/react-container/. Token sources: surface roles, shape scale, elevation tokens, motion easings.",
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
    maxWidth: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl", false],
    },
    fixed: { control: "boolean" },
    disableGutters: { control: "boolean" },
    centered: { control: "boolean" },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    maxWidth: "md",
    fixed: false,
    disableGutters: false,
    centered: true,
    selected: false,
    disabled: false,
    error: false,
    children: "M3 Container layout shell.",
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Container variant="text" size="sm" shape="md" maxWidth="md" label="text">
        Transparent host (layout default)
      </Container>
      <Container variant="filled" size="sm" shape="md" maxWidth="md" label="filled">
        surface-container-highest
      </Container>
      <Container variant="tonal" size="sm" shape="md" maxWidth="md" label="tonal">
        secondary-container
      </Container>
      <Container variant="outlined" size="sm" shape="md" maxWidth="md" label="outlined">
        1dp outline-variant border
      </Container>
      <Container variant="elevated" size="sm" shape="md" maxWidth="md" label="elevated">
        surface-container-low + elevation-1
      </Container>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Container variant="filled" size="sm" shape="md" maxWidth="md" label="sm">
        Small density (12dp pad-y / 48dp min-height / title-s)
      </Container>
      <Container variant="filled" size="md" shape="md" maxWidth="md" label="md">
        Medium density (24dp pad-y / 64dp min-height / title-m)
      </Container>
      <Container variant="filled" size="lg" shape="md" maxWidth="md" label="lg">
        Large density (40dp pad-y / 80dp min-height / title-l)
      </Container>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Container
            key={shape}
            variant="filled"
            size="sm"
            shape={shape}
            maxWidth="md"
            label={`shape-${shape}`}
          >
            shape token: {shape}
          </Container>
        ),
      )}
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Container variant="filled" size="sm" shape="md" maxWidth="md">
        Resting
      </Container>
      <Container variant="filled" size="sm" shape="md" maxWidth="md" selected>
        Selected (secondary-container + aria-selected)
      </Container>
      <Container variant="filled" size="sm" shape="md" maxWidth="md" disabled>
        Disabled (opacity 0.38 + aria-disabled)
      </Container>
      <Container variant="filled" size="sm" shape="md" maxWidth="md" error>
        Error (error-container + aria-invalid)
      </Container>
      <Container variant="elevated" size="sm" shape="md" maxWidth="md">
        Elevated (surface-container-low + elevation-1)
      </Container>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Container
        variant="filled"
        size="sm"
        shape="md"
        maxWidth="md"
        label="Container with leading icon"
        leadingIcon={<StarGlyph />}
      />
      <Container
        variant="filled"
        size="sm"
        shape="md"
        maxWidth="md"
        label="Container with trailing icon"
        trailingIcon={<ChevronGlyph />}
      />
      <Container
        variant="outlined"
        size="sm"
        shape="md"
        maxWidth="md"
        label="Container with both icons + body"
        leadingIcon={<StarGlyph />}
        trailingIcon={<ChevronGlyph />}
      >
        Body content sits below the header row.
      </Container>
    </div>
  ),
};

export const Layout: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <Container variant="outlined" size="sm" shape="md" maxWidth="xs">
        maxWidth=&quot;xs&quot; (444px)
      </Container>
      <Container variant="outlined" size="sm" shape="md" maxWidth="sm">
        maxWidth=&quot;sm&quot; (600px)
      </Container>
      <Container variant="outlined" size="sm" shape="md" maxWidth="md">
        maxWidth=&quot;md&quot; (900px)
      </Container>
      <Container variant="outlined" size="sm" shape="md" maxWidth="lg">
        maxWidth=&quot;lg&quot; (1200px)
      </Container>
      <Container variant="outlined" size="sm" shape="md" maxWidth={false}>
        maxWidth=false (fills the available width)
      </Container>
      <Container
        variant="filled"
        size="sm"
        shape="md"
        maxWidth="sm"
        disableGutters
      >
        disableGutters drops the horizontal padding.
      </Container>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Container
        variant="filled"
        size="sm"
        shape="md"
        maxWidth="md"
        label="medium2 / emphasized"
        trailingIcon={<ChevronGlyph />}
      >
        Container transitions ride medium2 (300ms) on emphasized easing.
      </Container>
      <Container
        variant="elevated"
        size="sm"
        shape="md"
        maxWidth="md"
        label="reduced-motion safe"
        trailingIcon={<ChevronGlyph />}
      >
        Reduced motion collapses transitions to instant.
      </Container>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <Container
        as="section"
        variant="outlined"
        size="sm"
        shape="md"
        maxWidth="md"
        aria-label="Polymorphic section"
        label="Polymorphic"
      >
        Renders as &lt;section&gt; with role=region when `as` is overridden.
      </Container>
      <Container
        variant="filled"
        size="sm"
        shape="md"
        maxWidth="md"
        label="Default landmark"
      >
        Default `as=&quot;main&quot;` — primary landmark, no explicit role.
      </Container>
      <Container
        variant="outlined"
        size="sm"
        shape="md"
        maxWidth="md"
        error
        aria-label="Error region"
        label="Error region"
      >
        aria-invalid is set automatically when `error` is true.
      </Container>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    maxWidth: "md",
    label: "Container playground",
    children: "Adjust the controls to explore the Container matrix.",
  },
};

/**
 * @storybook/test interaction spec. Asserts the Container mounts as the
 * configured polymorphic landmark with the correct ARIA wiring + token
 * data-attributes; Container itself is non-interactive (it is a layout
 * shell), so the spec validates structure rather than event handling.
 */
export const InteractionSpec: Story = {
  args: {
    "aria-label": "Interaction Container",
    label: "Interaction Container",
    children: "Layout shell does not paint a state layer.",
  },
  render: (args) => (
    <Container
      {...args}
      as="section"
      variant="filled"
      size="md"
      shape="md"
      maxWidth="md"
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Interaction Container" });

    await step("Container mounts as a labelled region landmark", async () => {
      expect(region).toBeInTheDocument();
      expect(region.getAttribute("data-component")).toBe("container");
      expect(region.getAttribute("data-variant")).toBe("filled");
      expect(region.getAttribute("data-size")).toBe("md");
      expect(region.getAttribute("data-shape")).toBe("md");
      expect(region.getAttribute("data-max-width")).toBe("md");
      expect(region.getAttribute("data-centered")).toBe("true");
    });

    await step("Header label slot renders the configured label", async () => {
      const label = region.querySelector("[data-slot='label']");
      expect(label).not.toBeNull();
      expect(label?.textContent).toBe("Interaction Container");
    });

    await step("Body slot renders the children block", async () => {
      const body = region.querySelector("[data-slot='body']");
      expect(body).not.toBeNull();
      expect(body?.textContent).toContain("Layout shell does not paint");
    });
  },
};
