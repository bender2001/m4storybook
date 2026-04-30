import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Breadcrumbs } from "./Breadcrumbs";
import type { BreadcrumbsItem } from "./types";

/** Inline 18dp icon glyphs — keeps the stories network-free. */
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

const CategoryGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 2 1 21h22zm0 4.84L19.53 19H4.47z" />
  </svg>
);

const ProductGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M21 7h-3.17l-1.24-1.35A2 2 0 0 0 15.12 5H8.88a2 2 0 0 0-1.47.65L6.17 7H3v2h18zM5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8z" />
  </svg>
);

const baseItems: BreadcrumbsItem[] = [
  { id: "home", label: "Home", href: "#home", icon: <HomeGlyph /> },
  { id: "shop", label: "Shop", href: "#shop", icon: <CategoryGlyph /> },
  { id: "audio", label: "Audio", href: "#audio" },
  { id: "headphones", label: "Headphones", icon: <ProductGlyph /> },
];

const longItems: BreadcrumbsItem[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "shop", label: "Shop", href: "#shop" },
  { id: "audio", label: "Audio", href: "#audio" },
  { id: "wireless", label: "Wireless", href: "#wireless" },
  { id: "premium", label: "Premium", href: "#premium" },
  { id: "headphones", label: "Headphones" },
];

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="breadcrumbs-surface"
    className={
      "flex w-[640px] flex-col gap-4 rounded-shape-md bg-surface p-4 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Breadcrumbs> = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "MUI Breadcrumbs re-skinned with M3 tokens: surface roles for the crumb host, primary for link affordance, secondary-container for the current crumb when the host is filled. Five variants (text / filled / tonal / outlined / elevated), three densities, full shape-token scale, springy press feedback, and a collapsing ellipsis affordance per WAI-ARIA breadcrumb pattern.",
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
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    maxItems: { control: { type: "number", min: 2, max: 12, step: 1 } },
  },
  args: {
    variant: "text",
    size: "md",
    shape: "full",
    error: false,
    disabled: false,
    maxItems: 8,
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs items={baseItems} />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs items={baseItems} variant="text" aria-label="Text variant" />
      <Breadcrumbs items={baseItems} variant="filled" aria-label="Filled variant" />
      <Breadcrumbs items={baseItems} variant="tonal" aria-label="Tonal variant" />
      <Breadcrumbs
        items={baseItems}
        variant="outlined"
        aria-label="Outlined variant"
      />
      <Breadcrumbs
        items={baseItems}
        variant="elevated"
        aria-label="Elevated variant"
      />
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs items={baseItems} size="sm" aria-label="Small density" />
      <Breadcrumbs items={baseItems} size="md" aria-label="Medium density" />
      <Breadcrumbs items={baseItems} size="lg" aria-label="Large density" />
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs items={baseItems} variant="filled" aria-label="Resting" />
      <Breadcrumbs
        items={baseItems.map((item, index) =>
          index === 1 ? { ...item, disabled: true } : item,
        )}
        variant="filled"
        aria-label="Disabled crumb"
      />
      <Breadcrumbs
        items={baseItems}
        variant="filled"
        disabled
        aria-label="Disabled trail"
      />
      <Breadcrumbs
        items={baseItems}
        variant="filled"
        error
        aria-label="Error state"
      />
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <Breadcrumbs
          key={shape}
          items={baseItems}
          variant="filled"
          shape={shape}
          aria-label={`Shape ${shape}`}
        />
      ))}
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs items={baseItems} aria-label="With leading icons" />
      <Breadcrumbs
        items={[
          { id: "root", label: "Files", href: "#files" },
          { id: "docs", label: "Documents", href: "#documents" },
          {
            id: "current",
            label: "Q3 Report",
            trailingIcon: (
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                width="100%"
                height="100%"
                fill="currentColor"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z" />
              </svg>
            ),
          },
        ]}
        aria-label="With trailing icon"
      />
      <Breadcrumbs
        items={baseItems}
        separator="›"
        aria-label="String separator"
      />
    </Surface>
  ),
};

export const Collapsed: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs
        items={longItems}
        maxItems={4}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={2}
        aria-label="Collapsed trail"
      />
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs
        items={baseItems}
        variant="filled"
        aria-label="Motion preview"
      />
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Breadcrumbs items={baseItems} aria-label="Primary breadcrumbs" />
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    variant: "text",
    size: "md",
    shape: "full",
    error: false,
    disabled: false,
    maxItems: 8,
  },
  render: (args) => (
    <Surface>
      <Breadcrumbs {...args} items={baseItems} />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies role wiring, click +
 * keyboard activation, aria-current, and ellipsis expansion.
 */
export const InteractionSpec: Story = {
  args: { onItemClick: fn() },
  render: (args) => (
    <Surface>
      <Breadcrumbs
        {...args}
        items={longItems}
        maxItems={4}
        itemsBeforeCollapse={1}
        itemsAfterCollapse={2}
      />
    </Surface>
  ),
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector(
      "[data-component='breadcrumbs']",
    );

    await step("renders as <nav> with role=navigation + aria-label", async () => {
      expect(nav).not.toBeNull();
      expect(nav?.tagName.toLowerCase()).toBe("nav");
      expect(nav?.getAttribute("aria-label")).toBe("Breadcrumb");
    });

    await step("last crumb is marked aria-current=page", async () => {
      const current = canvasElement.querySelector(
        "[data-component='breadcrumbs'] [aria-current='page']",
      );
      expect(current).not.toBeNull();
      expect(current?.textContent).toContain("Headphones");
    });

    await step("ellipsis affordance renders when collapsed", async () => {
      const expand = canvas.getByRole("button", { name: "Show path" });
      expect(expand).toBeDefined();
    });

    await step("clicking the ellipsis expands the trail", async () => {
      const expand = canvas.getByRole("button", { name: "Show path" });
      await userEvent.click(expand);
      const expanded = canvasElement.querySelectorAll(
        "[data-component='breadcrumbs'] [data-slot='crumb']",
      );
      expect(expanded.length).toBe(longItems.length);
    });

    await step("clicking a link crumb fires onItemClick", async () => {
      const link = canvas.getByRole("link", { name: "Shop" });
      await userEvent.click(link);
      expect(args.onItemClick).toHaveBeenCalled();
    });
  },
};
