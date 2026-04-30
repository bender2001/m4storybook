import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState, type ReactNode } from "react";
import { Tabs } from "./Tabs";
import type { TabsItem } from "./types";

const HomeIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 3 4 9v12h5v-7h6v7h5V9z" />
  </svg>
);

const FavoritesIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7 7 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7 7 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64L4.57 11c-.04.32-.07.65-.07.98 0 .33.03.65.07.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.13.23.42.31.61.22l2.49-1a7 7 0 0 0 1.69.98l.38 2.65c.06.24.27.42.49.42h4c.25 0 .45-.18.49-.42l.38-2.65a7 7 0 0 0 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
  </svg>
);

const sampleItems: TabsItem[] = [
  { key: "overview", label: "Overview" },
  { key: "specs", label: "Specs" },
  { key: "reviews", label: "Reviews" },
];

const itemsWithIcons: TabsItem[] = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "favorites", label: "Favorites", icon: <FavoritesIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

const Stage = ({
  children,
  className,
  width = "w-[640px]",
}: {
  children?: ReactNode;
  className?: string;
  width?: string;
}) => (
  <div
    data-host="tabs-stage"
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

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Tabs. Implements both M3 Primary Tabs and M3 Secondary Tabs (https://m3.material.io/components/tabs/specs) plus the M3 Expressive selection morph: the active indicator is a shared `layoutId` motion span that springs between tabs, and its shape morphs from `shape-xs` to the selected `shape` token via motion/react springs. 5 variants (filled / tonal / outlined / text / elevated), 3 sizes (40 / 48 / 64 dp), 2 orientations (horizontal / vertical), 7 shapes, optional fullWidth + leading-icon + trailing slot, hover 0.08 / focus 0.10 / pressed 0.10 state-layers on reachable tabs, roving-tabindex keyboard nav (Arrow / Home / End / Enter / Space).",
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
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    orientation: "horizontal",
    shape: "md",
    fullWidth: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Tabs
        items={sampleItems}
        defaultActiveKey="specs"
        ariaLabel="Default tabs"
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
            <Tabs
              variant={variant}
              items={sampleItems}
              defaultActiveKey="specs"
              ariaLabel={`${variant} tabs`}
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
          <Tabs
            size={size}
            items={sampleItems}
            defaultActiveKey="specs"
            ariaLabel={`${size} tabs`}
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
        <Tabs
          orientation="horizontal"
          items={sampleItems}
          defaultActiveKey="specs"
          ariaLabel="horizontal tabs"
        />
      </Stage>
      <Stage width="w-[420px]">
        <span className="block text-label-l text-on-surface mb-3">
          vertical
        </span>
        <Tabs
          orientation="vertical"
          items={sampleItems}
          defaultActiveKey="specs"
          ariaLabel="vertical tabs"
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
            <Tabs
              shape={shape}
              items={sampleItems}
              defaultActiveKey="specs"
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
          first selected
        </span>
        <Tabs
          items={sampleItems}
          defaultActiveKey="overview"
          ariaLabel="first selected tabs"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          mid selected
        </span>
        <Tabs
          items={sampleItems}
          defaultActiveKey="specs"
          ariaLabel="mid selected tabs"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          last selected
        </span>
        <Tabs
          items={sampleItems}
          defaultActiveKey="reviews"
          ariaLabel="last selected tabs"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">error</span>
        <Tabs
          items={[
            { key: "overview", label: "Overview" },
            { key: "specs", label: "Specs", error: true },
            { key: "reviews", label: "Reviews" },
          ]}
          defaultActiveKey="specs"
          ariaLabel="error tabs"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled tab list
        </span>
        <Tabs
          items={sampleItems}
          defaultActiveKey="specs"
          disabled
          ariaLabel="disabled tab list"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled item
        </span>
        <Tabs
          items={[
            { key: "overview", label: "Overview" },
            { key: "specs", label: "Specs", disabled: true },
            { key: "reviews", label: "Reviews" },
          ]}
          defaultActiveKey="overview"
          ariaLabel="disabled item tabs"
        />
      </Stage>
    </div>
  ),
};

export const FullWidth: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Tabs
        items={sampleItems}
        defaultActiveKey="specs"
        fullWidth
        ariaLabel="full-width tabs"
      />
    </Stage>
  ),
};

export const WithIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Tabs
        items={itemsWithIcons}
        defaultActiveKey="favorites"
        ariaLabel="tabs with icons"
      />
    </Stage>
  ),
};

export const WithTrailingSlot: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Tabs
        items={[
          { key: "inbox", label: "Inbox" },
          {
            key: "drafts",
            label: "Drafts",
            trailing: (
              <span
                aria-hidden
                data-slot="trailing-badge"
                className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-shape-full bg-error px-1 text-label-s text-on-error"
              >
                3
              </span>
            ),
          },
          { key: "archive", label: "Archive" },
        ]}
        defaultActiveKey="drafts"
        ariaLabel="tabs with trailing"
      />
    </Stage>
  ),
};

export const Vertical: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage width="w-[460px]">
      <Tabs
        orientation="vertical"
        items={sampleItems}
        defaultActiveKey="specs"
        ariaLabel="vertical tabs"
      />
    </Stage>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Tabs
        items={sampleItems}
        defaultActiveKey="overview"
        ariaLabel="motion tabs"
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
          custom aria-label
        </span>
        <Tabs
          items={sampleItems}
          defaultActiveKey="specs"
          ariaLabel="Product detail tabs"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled
        </span>
        <Tabs
          items={sampleItems}
          defaultActiveKey="specs"
          disabled
          ariaLabel="disabled accessibility tabs"
        />
      </Stage>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    orientation: "horizontal",
    shape: "md",
    fullWidth: false,
    disabled: false,
  },
  render: (args) => (
    <Stage>
      <Tabs
        {...args}
        items={itemsWithIcons}
        defaultActiveKey="favorites"
        ariaLabel="playground tabs"
        renderTabContent={(active) => (
          <p className="text-on-surface">Showing the {String(active.label)} panel.</p>
        )}
      />
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [active, setActive] = useState("overview");
      return (
        <div data-testid="tabs-host" className="space-y-4">
          <span data-testid="active-key" className="block text-on-surface">
            active: {active}
          </span>
          <Stage>
            <Tabs
              {...args}
              items={sampleItems}
              activeKey={active}
              ariaLabel="interactive tabs"
              onChange={(next, idx) => {
                setActive(next);
                args.onChange?.(next, idx);
              }}
              renderTabContent={(item) => (
                <p data-testid="active-panel" className="text-on-surface">
                  {String(item.label)} panel content
                </p>
              )}
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

    await step(
      "tablist exposes role + aria-selected on the active tab",
      async () => {
        const list = await canvas.findByRole("tablist", {
          name: /interactive tabs/i,
        });
        expect(list).toHaveAttribute("aria-orientation", "horizontal");
        const tabs = await canvas.findAllByRole("tab");
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
      },
    );

    await step("clicking a tab fires onChange + flips selection", async () => {
      const tabs = await canvas.findAllByRole("tab");
      await userEvent.click(tabs[2]);
      expect(args.onChange).toHaveBeenCalledWith("reviews", 2);
      expect(activeKey).toHaveTextContent("active: reviews");
      const updated = await canvas.findAllByRole("tab");
      expect(updated[2]).toHaveAttribute("aria-selected", "true");
    });

    await step("tabpanel labelled by the active tab", async () => {
      const panel = await canvas.findByRole("tabpanel");
      expect(panel.getAttribute("aria-labelledby")).toMatch(/-tab-reviews$/);
    });
  },
};
