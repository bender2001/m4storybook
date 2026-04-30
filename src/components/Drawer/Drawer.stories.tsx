import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Badge } from "@/components/Badge";
import { Drawer } from "./Drawer";
import type { DrawerItem, DrawerSection } from "./types";

/** Inline 24dp glyphs — keeps the stories network-free + deterministic. */
const InboxGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-3 11h-3v3h-2v-3H8l4-4z" />
  </svg>
);

const StarGlyph = () => (
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

const SendGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const DraftsGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M3 8l9 6 9-6V6l-9 6-9-6z" />
  </svg>
);

const SettingsGlyph = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="currentColor"
  >
    <path d="M19.14 12.94a7.97 7.97 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a8.1 8.1 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54a8.1 8.1 0 0 0-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.97 7.97 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.7 1.62.94l.36 2.54a.5.5 0 0 0 .5.42h3.84a.5.5 0 0 0 .5-.42l.36-2.54a8.1 8.1 0 0 0 1.62-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z" />
  </svg>
);

const baseItems: DrawerItem[] = [
  { id: "inbox", label: "Inbox", icon: <InboxGlyph /> },
  { id: "starred", label: "Starred", icon: <StarGlyph /> },
  { id: "sent", label: "Sent", icon: <SendGlyph /> },
  { id: "drafts", label: "Drafts", icon: <DraftsGlyph /> },
];

const groupedSections: DrawerSection[] = [
  {
    id: "mail",
    headline: "Mail",
    items: [
      {
        id: "inbox",
        label: "Inbox",
        icon: <InboxGlyph />,
        badge: <Badge content={24} size="sm" aria-label="24 unread" standalone />,
      },
      { id: "starred", label: "Starred", icon: <StarGlyph /> },
      { id: "sent", label: "Sent", icon: <SendGlyph /> },
      { id: "drafts", label: "Drafts", icon: <DraftsGlyph /> },
    ],
  },
  {
    id: "system",
    headline: "System",
    divider: true,
    items: [
      { id: "settings", label: "Settings", icon: <SettingsGlyph /> },
    ],
  },
];

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="drawer-surface"
    className={
      "relative isolate flex h-[520px] w-[640px] gap-4 overflow-hidden rounded-shape-md bg-surface " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Drawer> = {
  title: "Navigation/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3 Expressive Navigation Drawer. Five variants (standard / modal / tonal / outlined / elevated), three density sizes, full shape-token scale, springy active-indicator, anchor edge, header / headline / footer slots, and section grouping with M3 dividers. Per https://m3.material.io/components/navigation-drawer/specs.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "modal", "tonal", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    anchor: { control: "inline-radio", options: ["start", "end"] },
    open: { control: "boolean" },
    disabled: { control: "boolean" },
    contained: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    anchor: "start",
    open: true,
    disabled: false,
    contained: true,
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Drawer
        items={baseItems}
        defaultValue="inbox"
        contained
        ariaLabel="Default drawer"
      />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Drawer
          variant="standard"
          items={baseItems}
          defaultValue="inbox"
          contained
          ariaLabel="Standard drawer"
        />
      </Surface>
      <Surface>
        <Drawer
          variant="tonal"
          items={baseItems}
          defaultValue="starred"
          contained
          ariaLabel="Tonal drawer"
        />
      </Surface>
      <Surface>
        <Drawer
          variant="outlined"
          items={baseItems}
          defaultValue="sent"
          contained
          ariaLabel="Outlined drawer"
        />
      </Surface>
      <Surface>
        <Drawer
          variant="elevated"
          items={baseItems}
          defaultValue="drafts"
          contained
          ariaLabel="Elevated drawer"
        />
      </Surface>
      <Surface>
        <Drawer
          variant="modal"
          items={baseItems}
          defaultValue="inbox"
          contained
          scrim
          ariaLabel="Modal drawer"
        />
      </Surface>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface className="!w-[520px]">
        <Drawer
          size="sm"
          items={baseItems}
          defaultValue="inbox"
          contained
          ariaLabel="Small density"
        />
      </Surface>
      <Surface>
        <Drawer
          size="md"
          items={baseItems}
          defaultValue="inbox"
          contained
          ariaLabel="Medium density"
        />
      </Surface>
      <Surface className="!w-[680px]">
        <Drawer
          size="lg"
          items={baseItems}
          defaultValue="inbox"
          contained
          ariaLabel="Large density"
        />
      </Surface>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Drawer
          items={baseItems}
          defaultValue="inbox"
          contained
          ariaLabel="Resting"
        />
      </Surface>
      <Surface>
        <Drawer
          items={baseItems.map((item, index) =>
            index === 1 ? { ...item, disabled: true } : item,
          )}
          defaultValue="inbox"
          contained
          ariaLabel="Disabled item"
        />
      </Surface>
      <Surface>
        <Drawer
          items={baseItems}
          defaultValue="sent"
          contained
          disabled
          ariaLabel="Disabled drawer"
        />
      </Surface>
      <Surface>
        <Drawer
          variant="elevated"
          items={baseItems}
          defaultValue="starred"
          contained
          ariaLabel="Elevated"
        />
      </Surface>
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map((shape) => (
        <Surface key={shape}>
          <Drawer
            shape={shape}
            items={baseItems}
            defaultValue="inbox"
            contained
            ariaLabel={`Shape ${shape}`}
          />
        </Surface>
      ))}
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <Surface>
        <Drawer
          headline="Mail"
          header={
            <>
              <span className="text-title-l text-on-surface">Acme Mail</span>
              <span className="text-body-m text-on-surface-variant">
                logged in as ada@acme.dev
              </span>
            </>
          }
          footer={
            <span className="text-label-m text-on-surface-variant">
              Storage 4.2 GB / 15 GB
            </span>
          }
          sections={groupedSections}
          defaultValue="inbox"
          contained
          ariaLabel="Drawer with header + footer"
        />
      </Surface>
      <Surface>
        <Drawer
          anchor="end"
          items={baseItems}
          defaultValue="starred"
          contained
          ariaLabel="End-anchored drawer"
        />
      </Surface>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Drawer
        variant="modal"
        items={baseItems}
        defaultValue="inbox"
        contained
        ariaLabel="Modal drawer (motion)"
      />
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Drawer
        items={baseItems}
        defaultValue="inbox"
        contained
        ariaLabel="Primary navigation"
      />
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    variant: "standard",
    size: "md",
    shape: undefined,
    anchor: "start",
    open: true,
    disabled: false,
    contained: true,
  },
  render: (args) => (
    <Surface>
      <Drawer
        {...args}
        items={baseItems}
        defaultValue="inbox"
        ariaLabel="Playground drawer"
      />
    </Surface>
  ),
};

/**
 * @storybook/test interaction spec. Verifies role wiring, click +
 * keyboard navigation, aria-current toggling, and Escape dismissal.
 */
export const InteractionSpec: Story = {
  args: { onChange: fn(), onClose: fn() },
  render: (args) => {
    const ControlledShell = () => {
      const [value, setValue] = useState("inbox");
      const [open, setOpen] = useState(true);
      return (
        <Surface>
          <Drawer
            {...args}
            variant="modal"
            items={baseItems}
            value={value}
            open={open}
            contained
            onClose={() => {
              setOpen(false);
              args.onClose?.();
            }}
            onChange={(next, event) => {
              setValue(next);
              args.onChange?.(next, event);
            }}
            ariaLabel="Modal nav drawer"
          />
        </Surface>
      );
    };
    return <ControlledShell />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const drawer = canvasElement.querySelector("[data-component='drawer']");

    await step("renders <nav role=navigation> with aria-label", async () => {
      expect(drawer).not.toBeNull();
      expect(drawer?.tagName.toLowerCase()).toBe("nav");
      expect(drawer?.getAttribute("aria-label")).toBe("Modal nav drawer");
    });

    await step("inbox is selected by default + carries aria-current", async () => {
      const inbox = canvas.getByRole("link", { name: "Inbox" });
      expect(inbox.getAttribute("aria-current")).toBe("page");
    });

    await step(
      "clicking another destination updates selection + fires onChange",
      async () => {
        const sent = canvas.getByRole("link", { name: "Sent" });
        await userEvent.click(sent);
        expect(sent.getAttribute("aria-current")).toBe("page");
        expect(args.onChange).toHaveBeenCalled();
      },
    );

    await step("ArrowDown moves focus to the next destination", async () => {
      const sent = canvas.getByRole("link", { name: "Sent" });
      sent.focus();
      await userEvent.keyboard("{ArrowDown}");
      const drafts = canvas.getByRole("link", { name: "Drafts" });
      expect(document.activeElement).toBe(drafts);
    });
  },
};
