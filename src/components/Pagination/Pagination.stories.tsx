import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useState } from "react";
import { Pagination } from "./Pagination";

const Surface = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    data-host="pagination-surface"
    className={
      "flex w-[820px] flex-col gap-6 rounded-shape-md bg-surface p-6 " +
      (className ?? "")
    }
  >
    {children}
  </div>
);

const meta: Meta<typeof Pagination> = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized Pagination. Re-skins MUI's `<Pagination />` (https://mui.com/material-ui/react-pagination/) onto the M3 navigation token surface. Page items paint as M3 squircles (shape-full rest -> shape-md selected) with `secondary-container` / `on-secondary-container` selection, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, springy press scale, roving-tabindex keyboard nav, and full WAI-ARIA `<nav role=navigation aria-label>` wiring. Five host variants (text / filled / tonal / outlined / elevated), three densities (32/40/56dp), and the M3 corner shape scale.",
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
    count: { control: { type: "number", min: 1, max: 50 } },
    page: { control: { type: "number", min: 1 } },
    siblingCount: { control: { type: "number", min: 0, max: 4 } },
    boundaryCount: { control: { type: "number", min: 0, max: 4 } },
    showFirstButton: { control: "boolean" },
    showLastButton: { control: "boolean" },
    hidePrevButton: { control: "boolean" },
    hideNextButton: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
  args: {
    variant: "text",
    size: "md",
    shape: "full",
    count: 10,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstButton: false,
    showLastButton: false,
    hidePrevButton: false,
    hideNextButton: false,
    disabled: false,
    error: false,
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Pagination count={10} defaultPage={3} />
    </Surface>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-1 gap-4">
      <Pagination variant="text" count={10} defaultPage={3} />
      <Pagination variant="filled" count={10} defaultPage={3} />
      <Pagination variant="tonal" count={10} defaultPage={3} />
      <Pagination variant="outlined" count={10} defaultPage={3} />
      <Pagination variant="elevated" count={10} defaultPage={3} />
    </Surface>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-1 gap-4">
      <Pagination size="sm" variant="text" count={10} defaultPage={3} />
      <Pagination size="md" variant="text" count={10} defaultPage={3} />
      <Pagination size="lg" variant="text" count={10} defaultPage={3} />
    </Surface>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-1 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Pagination
            key={shape}
            shape={shape}
            variant="filled"
            count={6}
            defaultPage={2}
          />
        ),
      )}
    </Surface>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-1 gap-4">
      <Pagination variant="text" count={10} defaultPage={3} />
      <Pagination variant="text" count={10} defaultPage={3} disabled />
      <Pagination variant="text" count={10} defaultPage={3} error />
      <Pagination variant="text" count={1} defaultPage={1} />
    </Surface>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-1 gap-4">
      <Pagination
        variant="text"
        count={20}
        defaultPage={5}
        showFirstButton
        showLastButton
      />
      <Pagination
        variant="text"
        count={20}
        defaultPage={5}
        hidePrevButton
        hideNextButton
      />
      <Pagination
        variant="filled"
        count={20}
        defaultPage={5}
        showFirstButton
        showLastButton
        previousIcon={<span aria-hidden>‹</span>}
        nextIcon={<span aria-hidden>›</span>}
        firstIcon={<span aria-hidden>«</span>}
        lastIcon={<span aria-hidden>»</span>}
      />
    </Surface>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface>
      <Pagination variant="text" count={10} defaultPage={3} />
    </Surface>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Surface className="grid grid-cols-1 gap-4">
      <Pagination
        variant="text"
        count={10}
        defaultPage={3}
        aria-label="Search results pagination"
      />
      <Pagination variant="text" count={10} defaultPage={3} disabled />
    </Surface>
  ),
};

export const Playground: Story = {
  args: {
    variant: "text",
    size: "md",
    shape: "full",
    count: 10,
    page: 3,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstButton: false,
    showLastButton: false,
    hidePrevButton: false,
    hideNextButton: false,
    disabled: false,
    error: false,
  },
  render: (args) => (
    <Surface>
      <Pagination {...args} />
    </Surface>
  ),
};

export const InteractionSpec: Story = {
  args: { onChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [page, setPage] = useState(1);
      return (
        <div data-testid="pagination-host" className="space-y-4">
          <span data-testid="current-page" className="block text-on-surface">
            page: {page}
          </span>
          <Pagination
            {...args}
            count={5}
            page={page}
            onChange={(event, value) => {
              args.onChange?.(event, value);
              setPage(value);
            }}
          />
        </div>
      );
    };
    return (
      <Surface>
        <InteractiveHost />
      </Surface>
    );
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const currentPage = await canvas.findByTestId("current-page");

    await step("clicking page 3 fires onChange and updates state", async () => {
      const page3 = await canvas.findByRole("button", {
        name: /Go to page 3/i,
      });
      await userEvent.click(page3);
      expect(args.onChange).toHaveBeenCalled();
      expect(currentPage).toHaveTextContent("page: 3");
    });

    await step("clicking next moves forward", async () => {
      const next = await canvas.findByRole("button", {
        name: /Go to next page/i,
      });
      await userEvent.click(next);
      expect(currentPage).toHaveTextContent("page: 4");
    });
  },
};
