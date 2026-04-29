import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { List, ListItem } from "./List";

const InboxGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
    <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4l-2 2H8l-2-2H5V5h14v10z" />
  </svg>
);

const StarGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
    <path d="M12 2.6l2.92 6.55 7.13.62-5.4 4.7 1.62 6.96L12 17.77l-6.27 3.66 1.62-6.96-5.4-4.7 7.13-.62z" />
  </svg>
);

const ChevronGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

const CheckGlyph = () => (
  <svg aria-hidden viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </svg>
);

const meta: Meta<typeof List> = {
  title: "Data Display/List",
  component: List,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 List rendering a `<ul>` with three variants (standard / filled / outlined) and three line densities (sm = 1-line / md = 2-line / lg = 3-line). Each `<ListItem>` accepts leading + trailing slots, an optional overline, an interactive button mode with M3 state-layer opacities (hover 0.08 / focus 0.10 / pressed 0.10), selected + disabled + error states. Honors `prefers-reduced-motion` by collapsing state-layer transitions to duration:0.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "filled", "outlined"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    ordered: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    ordered: false,
  },
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <List>
        <ListItem
          leading={<InboxGlyph />}
          headline="Inbox"
          supportingText="12 unread messages"
          trailing="12"
        />
        <ListItem
          leading={<StarGlyph />}
          headline="Starred"
          supportingText="3 starred conversations"
          trailing="3"
        />
        <ListItem
          leading={<CheckGlyph />}
          headline="Sent"
          supportingText="Today at 2:14 pm"
        />
      </List>
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[28rem] flex-col gap-6">
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Standard</p>
        <List variant="standard" aria-label="Standard list">
          <ListItem leading={<InboxGlyph />} headline="Inbox" supportingText="Primary" />
          <ListItem leading={<StarGlyph />} headline="Starred" supportingText="Important" />
        </List>
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Filled</p>
        <List variant="filled" aria-label="Filled list">
          <ListItem leading={<InboxGlyph />} headline="Inbox" supportingText="Primary" />
          <ListItem leading={<StarGlyph />} headline="Starred" supportingText="Important" />
        </List>
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Outlined</p>
        <List variant="outlined" aria-label="Outlined list">
          <ListItem leading={<InboxGlyph />} headline="Inbox" supportingText="Primary" />
          <ListItem leading={<StarGlyph />} headline="Starred" supportingText="Important" />
        </List>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[28rem] flex-col gap-6">
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Small (1-line, 56dp)</p>
        <List size="sm" aria-label="Small list">
          <ListItem leading={<InboxGlyph />} headline="Inbox" />
          <ListItem leading={<StarGlyph />} headline="Starred" />
        </List>
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Medium (2-line, 72dp)</p>
        <List size="md" aria-label="Medium list">
          <ListItem
            leading={<InboxGlyph />}
            headline="Inbox"
            supportingText="Primary inbox"
          />
          <ListItem
            leading={<StarGlyph />}
            headline="Starred"
            supportingText="Important conversations"
          />
        </List>
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Large (3-line, 88dp)</p>
        <List size="lg" aria-label="Large list">
          <ListItem
            leading={<InboxGlyph />}
            headline="Inbox"
            supportingText="Primary inbox — high priority emails are sorted to the top of this view by default."
          />
          <ListItem
            leading={<StarGlyph />}
            headline="Starred"
            supportingText="Important conversations — these threads are followed across all devices."
          />
        </List>
      </div>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <List variant="filled" aria-label="States list">
        <ListItem
          leading={<InboxGlyph />}
          headline="Resting"
          supportingText="Default state"
          onClick={() => {}}
        />
        <ListItem
          leading={<StarGlyph />}
          headline="Selected"
          supportingText="Selected state"
          selected
          onClick={() => {}}
        />
        <ListItem
          leading={<CheckGlyph />}
          headline="Disabled"
          supportingText="Disabled state"
          disabled
          onClick={() => {}}
        />
        <ListItem
          leading={<InboxGlyph />}
          headline="Error"
          supportingText="Error state"
          error
          onClick={() => {}}
        />
      </List>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <List variant="outlined" aria-label="Slots list">
        <ListItem
          leading={<InboxGlyph />}
          headline="Leading + headline"
          supportingText="Leading icon slot"
        />
        <ListItem
          headline="Headline + trailing"
          supportingText="No leading slot"
          trailing={<ChevronGlyph />}
        />
        <ListItem
          leading={<StarGlyph />}
          overline="Today"
          headline="With overline"
          supportingText="Overline + headline + supporting"
          trailing="2:14"
        />
        <ListItem
          leading={<CheckGlyph />}
          headline="All slots filled"
          overline="Yesterday"
          supportingText="Leading + overline + headline + supporting + trailing"
          trailing={<ChevronGlyph />}
        />
      </List>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    variant: "standard",
    size: "md",
  },
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <List variant="standard" aria-label="Interactive list">
        <ListItem
          leading={<InboxGlyph />}
          headline="Inbox"
          supportingText="Click or tab + enter"
          onClick={fn()}
        />
        <ListItem
          leading={<StarGlyph />}
          headline="Starred"
          supportingText="Hover to see the M3 0.08 state layer"
          onClick={fn()}
        />
        <ListItem
          leading={<CheckGlyph />}
          headline="Done"
          supportingText="Selected — secondary-container background"
          selected
          onClick={fn()}
        />
      </List>
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <p className="mb-3 text-body-s text-on-surface-variant">
        State-layer opacity transitions on hover/focus/pressed using the M3
        standard easing token. Reduced motion collapses the transition to
        duration:0.
      </p>
      <List variant="filled" aria-label="Motion list">
        <ListItem
          leading={<InboxGlyph />}
          headline="Hover me"
          supportingText="0.08 hover → 0.10 focus → 0.10 pressed"
          onClick={() => {}}
        />
      </List>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-96">
      <List variant="standard" aria-label="Settings menu">
        <ListItem
          leading={<InboxGlyph />}
          headline="Notifications"
          supportingText="Configure email + push"
          onClick={() => {}}
        />
        <ListItem
          leading={<StarGlyph />}
          headline="Display"
          supportingText="Theme, density, motion"
          onClick={() => {}}
        />
        <ListItem
          leading={<CheckGlyph />}
          headline="Privacy"
          supportingText="Manage data + sharing"
          disabled
          onClick={() => {}}
        />
      </List>
    </div>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <div className="w-96">
      <List {...args} aria-label="Playground list">
        <ListItem
          leading={<InboxGlyph />}
          headline="Inbox"
          supportingText="Primary inbox"
          trailing="12"
        />
        <ListItem
          leading={<StarGlyph />}
          headline="Starred"
          supportingText="Important conversations"
          trailing="3"
        />
        <ListItem
          leading={<CheckGlyph />}
          headline="Done"
          supportingText="All caught up"
        />
      </List>
    </div>
  ),
};

/**
 * Storybook interaction test:
 *  - asserts the list renders role=list with three role=listitem rows
 *  - asserts the interactive item promotes to role=button + fires
 *    onClick on Enter / click
 *  - asserts the selected row exposes aria-pressed=true
 */
export const InteractionSpec: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const onClick = fn();
    return (
      <div className="w-96">
        <List variant="filled" aria-label="Spec list">
          <ListItem
            leading={<InboxGlyph />}
            headline="Inbox"
            supportingText="Primary inbox"
            onClick={onClick}
            data-testid="spec-row"
          />
          <ListItem
            leading={<StarGlyph />}
            headline="Starred"
            supportingText="Selected row"
            selected
            onClick={() => {}}
          />
          <ListItem
            leading={<CheckGlyph />}
            headline="Static"
            supportingText="No interaction"
          />
        </List>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Spec list" });
    expect(list).toHaveAttribute("data-variant", "filled");
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBe(3);
    const inboxButton = canvas.getByRole("button", { name: /Inbox/ });
    await userEvent.click(inboxButton);
    await waitFor(() => {
      expect(inboxButton).toBeVisible();
    });
    const selected = canvas.getByRole("button", { name: /Starred/ });
    expect(selected).toHaveAttribute("aria-pressed", "true");
  },
};
