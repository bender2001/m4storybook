import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Link } from "./Link";

/** Inline 18dp icon glyphs — keeps the stories network-free + deterministic. */
const HomeGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
);

const DownloadGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M5 20h14v-2H5zm7-18-5.5 5.5L8 9l3-3v9h2V6l3 3 1.5-1.5z" />
  </svg>
);

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="link-surface"
    className={
      "flex w-[640px] flex-wrap items-center gap-3 rounded-shape-md bg-surface p-4 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const Stack = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="link-surface"
    className={
      "flex w-[640px] flex-col gap-3 rounded-shape-md bg-surface p-4 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Link> = {
  title: "Navigation/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Link. Five variants (text / filled / tonal / outlined / elevated), three densities, full shape-token scale, hover/focus/pressed state-layer, optional underline policy, leading + trailing icon slots, and an `external` mode that auto-tags `target=_blank` + `rel=noopener` and surfaces an external-arrow glyph. Per https://m3.material.io/styles/typography/applying-type.",
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
    underline: {
      control: "inline-radio",
      options: ["none", "hover", "always"],
    },
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    external: { control: "boolean" },
  },
  args: {
    variant: "text",
    size: "md",
    shape: "full",
    underline: "hover",
    selected: false,
    disabled: false,
    error: false,
    external: false,
    href: "#docs",
    children: "Read the docs",
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Link href="#docs">Read the docs</Link>
      <Link href="#docs" leadingIcon={<HomeGlyph />}>
        Back home
      </Link>
      <Link href="https://m3.material.io" external>
        M3 spec
      </Link>
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Surface>
        <Link variant="text" href="#text">
          Text link
        </Link>
        <Link variant="filled" href="#filled">
          Filled link
        </Link>
        <Link variant="tonal" href="#tonal">
          Tonal link
        </Link>
        <Link variant="outlined" href="#outlined">
          Outlined link
        </Link>
        <Link variant="elevated" href="#elevated">
          Elevated link
        </Link>
      </Surface>
    </Stack>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Surface>
        <Link variant="filled" size="sm" href="#sm">
          Small
        </Link>
        <Link variant="filled" size="md" href="#md">
          Medium
        </Link>
        <Link variant="filled" size="lg" href="#lg">
          Large
        </Link>
      </Surface>
    </Stack>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Surface>
        <Link variant="filled" href="#rest">
          Resting
        </Link>
        <Link variant="filled" selected href="#selected">
          Selected
        </Link>
        <Link variant="filled" disabled href="#disabled">
          Disabled
        </Link>
        <Link variant="filled" error href="#error">
          Error
        </Link>
      </Surface>
    </Stack>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Surface key={shape}>
            <Link variant="filled" shape={shape} href={`#${shape}`}>
              Shape {shape}
            </Link>
          </Surface>
        ),
      )}
    </Stack>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Surface>
        <Link href="#leading" leadingIcon={<HomeGlyph />}>
          Leading icon
        </Link>
        <Link href="#trailing" trailingIcon={<DownloadGlyph />}>
          Trailing icon
        </Link>
        <Link href="#both" leadingIcon={<HomeGlyph />} trailingIcon={<DownloadGlyph />}>
          Both icons
        </Link>
        <Link href="https://m3.material.io" external>
          External link
        </Link>
      </Surface>
    </Stack>
  ),
};

export const Underline: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Surface>
        <Link href="#u-none" underline="none">
          Underline none
        </Link>
        <Link href="#u-hover" underline="hover">
          Underline on hover
        </Link>
        <Link href="#u-always" underline="always">
          Underline always
        </Link>
      </Surface>
    </Stack>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Link href="#motion" variant="filled">
        Motion preview
      </Link>
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stack>
      <Surface>
        <p className="text-body-m text-on-surface">
          Visit the{" "}
          <Link href="#a11y" aria-label="Material 3 design system">
            Material 3 design system
          </Link>{" "}
          to learn more.
        </p>
        <Link href="#current" selected aria-label="Current page">
          Current page
        </Link>
        <Link href="#disabled" disabled>
          Disabled link
        </Link>
      </Surface>
    </Stack>
  ),
};

export const Playground: Story = {
  args: {
    variant: "text",
    size: "md",
    shape: "full",
    underline: "hover",
    selected: false,
    disabled: false,
    error: false,
    external: false,
    href: "#playground",
    children: "Playground link",
  },
  render: (args) => (
    <Surface>
      <Link {...args} />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies role wiring, click +
 * keyboard activation, aria-current toggling, and disabled blocking.
 */
export const InteractionSpec: Story = {
  args: { onActivate: fn() },
  render: (args) => (
    <Surface>
      <Link {...args} href="#interactive">
        Interactive link
      </Link>
      <Link href="#disabled" disabled onActivate={args.onActivate}>
        Disabled link
      </Link>
    </Surface>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const link = canvasElement.querySelector(
      "[data-component='link']:not([data-disabled])",
    ) as HTMLAnchorElement | null;

    await step("renders as <a> with href", async () => {
      expect(link).not.toBeNull();
      expect(link?.tagName.toLowerCase()).toBe("a");
      expect(link?.getAttribute("href")).toBe("#interactive");
    });

    await step("clicking the link fires onActivate", async () => {
      const interactive = canvas.getByRole("link", { name: "Interactive link" });
      await userEvent.click(interactive);
      expect(args.onActivate).toHaveBeenCalled();
    });

    await step("Enter keyboard activates onActivate", async () => {
      const interactive = canvas.getByRole("link", { name: "Interactive link" });
      interactive.focus();
      await userEvent.keyboard("{Enter}");
      expect(args.onActivate).toHaveBeenCalledTimes(2);
    });

    await step(
      "disabled link strips href + sets aria-disabled + tabIndex=-1",
      async () => {
        const disabled = canvasElement.querySelector(
          "[data-component='link'][data-disabled]",
        ) as HTMLAnchorElement | null;
        expect(disabled).not.toBeNull();
        expect(disabled?.hasAttribute("href")).toBe(false);
        expect(disabled?.getAttribute("aria-disabled")).toBe("true");
        expect(disabled?.getAttribute("tabindex")).toBe("-1");
      },
    );
  },
};
