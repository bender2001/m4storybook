import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { useMemo, useState, type ReactNode } from "react";
import { DataGrid } from "./DataGrid";
import type {
  DataGridColumn,
  DataGridSortDirection,
} from "./types";

interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
  salary: number;
  status: string;
  [key: string]: unknown;
}

const samplePeople: Person[] = [
  { id: "p1", name: "Ada Lovelace", role: "Engineer", team: "Foundations", salary: 142000, status: "Active" },
  { id: "p2", name: "Alan Turing", role: "Researcher", team: "Cryptography", salary: 168000, status: "Active" },
  { id: "p3", name: "Grace Hopper", role: "Architect", team: "Compilers", salary: 175000, status: "On leave" },
  { id: "p4", name: "Linus Torvalds", role: "Maintainer", team: "Kernel", salary: 156000, status: "Active" },
  { id: "p5", name: "Margaret Hamilton", role: "Lead", team: "Apollo", salary: 191000, status: "Active" },
];

const baseColumns: DataGridColumn<Person>[] = [
  { key: "name", label: "Name", sortable: true, width: 180 },
  { key: "role", label: "Role", sortable: true, width: 140 },
  { key: "team", label: "Team", sortable: true, width: 160 },
  {
    key: "salary",
    label: "Salary",
    numeric: true,
    sortable: true,
    width: 140,
    render: (row) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(row.salary),
  },
  { key: "status", label: "Status", width: 120 },
];

const FilterIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
);

const Stage = ({
  children,
  className,
  width = "w-[760px]",
}: {
  children?: ReactNode;
  className?: string;
  width?: string;
}) => (
  <div
    data-host="data-grid-stage"
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

const meta: Meta<typeof DataGrid> = {
  title: "Advanced/Data Grid",
  component: DataGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "M3-tokenized DataGrid. Re-skins MUI X DataGrid (https://mui.com/x/react-data-grid/) onto M3 tokens — Material 3 has no formal Data Grid spec, so this follows the project's MUI fallback rule. The selection cursor is a 3dp leading bar that springs between rows via a shared `layoutId` and morphs from `shape-xs` to the selected `shape` token via motion/react springs. 5 variants (filled / tonal / outlined / text / elevated), 3 densities (36 / 52 / 72 dp rows), 7 shapes, sortable headers, single + multiple row selection, hover 0.08 / focus 0.10 / pressed 0.10 state-layers, roving-tabindex keyboard nav (Arrow / Home / End / Enter / Space).",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["filled", "tonal", "outlined", "text", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: {
      control: "inline-radio",
      options: ["none", "xs", "sm", "md", "lg", "xl", "full"],
    },
    selectionMode: {
      control: "inline-radio",
      options: ["none", "single", "multiple"],
    },
    showCheckboxes: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    selectionMode: "single",
    showCheckboxes: false,
    stickyHeader: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof DataGrid<Person>>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DataGrid<Person>
        columns={baseColumns}
        rows={samplePeople}
        rowKey={(r) => r.id}
        defaultSelectedRowKeys={["p2"]}
        ariaLabel="People data grid"
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
            <DataGrid<Person>
              variant={variant}
              columns={baseColumns}
              rows={samplePeople.slice(0, 3)}
              rowKey={(r) => r.id}
              defaultSelectedRowKeys={["p2"]}
              ariaLabel={`${variant} data grid`}
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
          <DataGrid<Person>
            size={size}
            columns={baseColumns}
            rows={samplePeople.slice(0, 3)}
            rowKey={(r) => r.id}
            defaultSelectedRowKeys={["p2"]}
            ariaLabel={`${size} data grid`}
          />
        </Stage>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {(["none", "xs", "sm", "md", "lg", "xl", "full"] as const).map(
        (shape) => (
          <Stage key={shape} width="w-[640px]">
            <span className="block text-label-l text-on-surface mb-3">
              {shape}
            </span>
            <DataGrid<Person>
              shape={shape}
              variant="outlined"
              columns={baseColumns.slice(0, 3)}
              rows={samplePeople.slice(0, 3)}
              rowKey={(r) => r.id}
              defaultSelectedRowKeys={["p2"]}
              ariaLabel={`${shape} data grid`}
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
          single selection
        </span>
        <DataGrid<Person>
          columns={baseColumns}
          rows={samplePeople}
          rowKey={(r) => r.id}
          defaultSelectedRowKeys={["p3"]}
          ariaLabel="single selected data grid"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          multiple selection
        </span>
        <DataGrid<Person>
          selectionMode="multiple"
          showCheckboxes
          columns={baseColumns}
          rows={samplePeople}
          rowKey={(r) => r.id}
          defaultSelectedRowKeys={["p1", "p3"]}
          ariaLabel="multiple selected data grid"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled row
        </span>
        <DataGrid<Person>
          columns={baseColumns}
          rows={samplePeople}
          rowKey={(r) => r.id}
          disabledRowKeys={["p2"]}
          defaultSelectedRowKeys={["p1"]}
          ariaLabel="disabled-row data grid"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          error row
        </span>
        <DataGrid<Person>
          columns={baseColumns}
          rows={samplePeople}
          rowKey={(r) => r.id}
          errorRowKeys={["p4"]}
          ariaLabel="error-row data grid"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled grid
        </span>
        <DataGrid<Person>
          columns={baseColumns}
          rows={samplePeople.slice(0, 3)}
          rowKey={(r) => r.id}
          defaultSelectedRowKeys={["p1"]}
          disabled
          ariaLabel="disabled data grid"
        />
      </Stage>
    </div>
  ),
};

export const WithCheckboxes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DataGrid<Person>
        selectionMode="multiple"
        showCheckboxes
        columns={baseColumns}
        rows={samplePeople}
        rowKey={(r) => r.id}
        defaultSelectedRowKeys={["p1", "p3"]}
        ariaLabel="checkbox data grid"
      />
    </Stage>
  ),
};

export const WithHeaderIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DataGrid<Person>
        columns={baseColumns.map((c, i) =>
          i === 0 ? { ...c, headerIcon: <FilterIcon /> } : c,
        )}
        rows={samplePeople}
        rowKey={(r) => r.id}
        defaultSelectedRowKeys={["p2"]}
        ariaLabel="header-icons data grid"
      />
    </Stage>
  ),
};

export const Sortable: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const SortableHost = () => {
      const [sortKey, setSortKey] = useState<string | undefined>("salary");
      const [sortDir, setSortDir] =
        useState<DataGridSortDirection>("desc");
      const sorted = useMemo(() => {
        if (!sortKey || sortDir === "none") return samplePeople;
        const out = [...samplePeople].sort((a, b) => {
          const av = a[sortKey];
          const bv = b[sortKey];
          if (typeof av === "number" && typeof bv === "number") {
            return av - bv;
          }
          return String(av).localeCompare(String(bv));
        });
        return sortDir === "desc" ? out.reverse() : out;
      }, [sortDir, sortKey]);
      return (
        <Stage>
          <DataGrid<Person>
            columns={baseColumns}
            rows={sorted}
            rowKey={(r) => r.id}
            sortKey={sortKey}
            sortDirection={sortDir}
            onSortChange={(key, dir) => {
              setSortKey(key);
              setSortDir(dir);
            }}
            ariaLabel="sortable data grid"
          />
        </Stage>
      );
    };
    return <SortableHost />;
  },
};

export const Empty: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DataGrid<Person>
        columns={baseColumns}
        rows={[]}
        rowKey={(r) => r.id}
        ariaLabel="empty data grid"
      />
    </Stage>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <DataGrid<Person>
        columns={baseColumns}
        rows={samplePeople}
        rowKey={(r) => r.id}
        defaultSelectedRowKeys={["p1"]}
        ariaLabel="motion data grid"
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
          aria-rowcount + aria-colcount
        </span>
        <DataGrid<Person>
          columns={baseColumns}
          rows={samplePeople}
          rowKey={(r) => r.id}
          defaultSelectedRowKeys={["p2"]}
          ariaLabel="Accessible product directory"
        />
      </Stage>
      <Stage>
        <span className="block text-label-l text-on-surface mb-3">
          disabled
        </span>
        <DataGrid<Person>
          columns={baseColumns}
          rows={samplePeople.slice(0, 3)}
          rowKey={(r) => r.id}
          disabled
          ariaLabel="disabled accessibility data grid"
        />
      </Stage>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    variant: "filled",
    size: "md",
    shape: "md",
    selectionMode: "single",
    showCheckboxes: false,
    stickyHeader: false,
    disabled: false,
  },
  render: (args) => (
    <Stage>
      <DataGrid<Person>
        {...args}
        columns={baseColumns}
        rows={samplePeople}
        rowKey={(r) => r.id}
        defaultSelectedRowKeys={["p2"]}
        ariaLabel="playground data grid"
      />
    </Stage>
  ),
};

export const InteractionSpec: Story = {
  args: { onSelectionChange: fn(), onSortChange: fn() },
  render: (args) => {
    const InteractiveHost = () => {
      const [selected, setSelected] = useState<string[]>(["p1"]);
      return (
        <div data-testid="grid-host" className="space-y-4">
          <span data-testid="selected-keys" className="block text-on-surface">
            selected: {selected.join(",") || "(none)"}
          </span>
          <Stage>
            <DataGrid<Person>
              {...args}
              columns={baseColumns}
              rows={samplePeople}
              rowKey={(r) => r.id}
              selectedRowKeys={selected}
              onSelectionChange={(next) => {
                setSelected(next);
                args.onSelectionChange?.(next);
              }}
              ariaLabel="interactive data grid"
            />
          </Stage>
        </div>
      );
    };
    return <InteractiveHost />;
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement);
    const selectedSpan = await canvas.findByTestId("selected-keys");

    await step("grid exposes role + aria-label + aria-rowcount", async () => {
      const grid = await canvas.findByRole("grid", {
        name: /interactive data grid/i,
      });
      expect(grid).toHaveAttribute("aria-rowcount", "6");
      expect(grid).toHaveAttribute("aria-colcount", "5");
    });

    await step("clicking a row fires onSelectionChange + flips selection", async () => {
      const rows = await canvas.findAllByRole("row");
      const targetRow = rows[3];
      await userEvent.click(targetRow);
      expect(args.onSelectionChange).toHaveBeenCalledWith(["p3"]);
      expect(selectedSpan).toHaveTextContent("selected: p3");
    });

    await step("sortable header carries aria-sort=none by default", async () => {
      const headers = await canvas.findAllByRole("columnheader");
      const nameHeader = headers.find((h) => h.dataset.key === "name");
      expect(nameHeader).toHaveAttribute("aria-sort", "none");
    });
  },
};
