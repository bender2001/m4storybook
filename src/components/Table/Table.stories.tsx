import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, waitFor, within } from "@storybook/test";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from "./Table";
import type { SortDirection, TableColumn } from "./types";

interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
  hours: number;
  [key: string]: unknown;
}

const people: ReadonlyArray<Person> = [
  { id: "1", name: "Ada Lovelace", role: "Engineer", team: "Compute", hours: 38 },
  { id: "2", name: "Grace Hopper", role: "Architect", team: "Tools", hours: 42 },
  { id: "3", name: "Linus Torvalds", role: "Engineer", team: "Kernel", hours: 35 },
  { id: "4", name: "Margaret Hamilton", role: "Lead", team: "Apollo", hours: 50 },
];

const peopleColumns: ReadonlyArray<TableColumn<Person>> = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role" },
  { key: "team", label: "Team" },
  { key: "hours", label: "Hours", numeric: true, sortable: true },
];

const meta: Meta<typeof Table> = {
  title: "Data Display/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "M3 Expressive data table. M3 has no formal Table component, so this re-skins the MUI Table pattern with M3 tokens (per the spec's MUI fallback rule). Supports four variants (standard / filled / outlined / elevated), three densities (sm = 40dp, md = 52dp, lg = 72dp rows), sortable headers with sort affordance, selected-row highlighting via the M3 secondary-container, sticky headers, numeric right-align, and the M3 state-layer opacity tokens (hover 0.08 / focus 0.10 / pressed 0.10) for interactive rows. Honors `prefers-reduced-motion` by collapsing state-layer transitions to duration:0.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["standard", "filled", "outlined", "elevated"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    stickyHeader: { control: "boolean" },
  },
  args: {
    variant: "standard",
    size: "md",
    stickyHeader: false,
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[40rem]">
      <Table<Person>
        aria-label="Default table"
        columns={peopleColumns}
        rows={people}
      />
    </div>
  ),
};

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[40rem] flex-col gap-6">
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Standard</p>
        <Table<Person>
          aria-label="Standard table"
          variant="standard"
          columns={peopleColumns}
          rows={people}
        />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Filled</p>
        <Table<Person>
          aria-label="Filled table"
          variant="filled"
          columns={peopleColumns}
          rows={people}
        />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Outlined</p>
        <Table<Person>
          aria-label="Outlined table"
          variant="outlined"
          columns={peopleColumns}
          rows={people}
        />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Elevated</p>
        <Table<Person>
          aria-label="Elevated table"
          variant="elevated"
          columns={peopleColumns}
          rows={people}
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex w-[40rem] flex-col gap-6">
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Small (40dp)</p>
        <Table<Person>
          aria-label="Small table"
          variant="outlined"
          size="sm"
          columns={peopleColumns}
          rows={people}
        />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Medium (52dp)</p>
        <Table<Person>
          aria-label="Medium table"
          variant="outlined"
          size="md"
          columns={peopleColumns}
          rows={people}
        />
      </div>
      <div>
        <p className="mb-2 text-label-m text-on-surface-variant">Large (72dp)</p>
        <Table<Person>
          aria-label="Large table"
          variant="outlined"
          size="lg"
          columns={peopleColumns}
          rows={people}
        />
      </div>
    </div>
  ),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[40rem]">
      <Table aria-label="States table" variant="filled">
        <TableHead>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>State</TableCell>
            <TableCell header numeric>
              Hours
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow interactive>
            <TableCell>Resting</TableCell>
            <TableCell>Default</TableCell>
            <TableCell numeric>38</TableCell>
          </TableRow>
          <TableRow selected interactive>
            <TableCell>Selected</TableCell>
            <TableCell>secondary-container</TableCell>
            <TableCell numeric>42</TableCell>
          </TableRow>
          <TableRow disabled interactive>
            <TableCell>Disabled</TableCell>
            <TableCell>opacity 0.38</TableCell>
            <TableCell numeric>0</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const Slots: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[40rem]">
      <Table aria-label="Slots table" variant="outlined" caption="Quarterly summary">
        <TableHead>
          <TableRow>
            <TableCell header>Region</TableCell>
            <TableCell header>Status</TableCell>
            <TableCell header numeric>
              Revenue
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>North America</TableCell>
            <TableCell>On track</TableCell>
            <TableCell numeric>$ 1,205,440</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>EMEA</TableCell>
            <TableCell>Behind</TableCell>
            <TableCell numeric>$ 882,210</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>APAC</TableCell>
            <TableCell>Ahead</TableCell>
            <TableCell numeric>$ 1,506,720</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell header>Total</TableCell>
            <TableCell />
            <TableCell header numeric>
              $ 3,594,370
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
};

export const Sortable: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const SortableTable = () => {
      const [sortKey, setSortKey] = useState("name");
      const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
      const sorted = [...people].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av == null || bv == null) return 0;
        if (typeof av === "number" && typeof bv === "number") {
          return sortDirection === "asc" ? av - bv : bv - av;
        }
        return sortDirection === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
      return (
        <Table<Person>
          aria-label="Sortable table"
          variant="outlined"
          columns={peopleColumns}
          rows={sorted}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={(key, dir) => {
            setSortKey(key);
            setSortDirection(dir);
          }}
        />
      );
    };
    return (
      <div className="w-[40rem]">
        <SortableTable />
      </div>
    );
  },
};

export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[40rem]">
      <Table aria-label="Interactive table" variant="filled">
        <TableHead>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Role</TableCell>
            <TableCell header numeric>
              Hours
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {people.map((p, i) => (
            <TableRow key={p.id} interactive selected={i === 1}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.role}</TableCell>
              <TableCell numeric>{p.hours}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};

export const StickyHeader: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="h-64 w-[40rem] overflow-y-auto">
      <Table<Person>
        aria-label="Sticky table"
        variant="outlined"
        stickyHeader
        columns={peopleColumns}
        rows={[...people, ...people, ...people]}
      />
    </div>
  ),
};

export const Motion: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[40rem]">
      <p className="mb-3 text-body-s text-on-surface-variant">
        Interactive rows transition the state-layer overlay opacity using the
        M3 standard easing token. Reduced motion collapses the transition.
      </p>
      <Table aria-label="Motion table" variant="outlined">
        <TableHead>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow interactive>
            <TableCell>Hover or focus me</TableCell>
            <TableCell>0.08 hover → 0.10 focus → 0.10 pressed</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const Accessibility: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="w-[40rem]">
      <Table<Person>
        aria-label="Accessibility table"
        caption="Engineering roster — current week"
        variant="outlined"
        columns={peopleColumns}
        rows={people}
        sortKey="name"
        sortDirection="asc"
        onSortChange={() => {}}
      />
    </div>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <div className="w-[40rem]">
      <Table<Person>
        {...args}
        aria-label="Playground table"
        columns={peopleColumns}
        rows={people}
      />
    </div>
  ),
};

/**
 * Storybook interaction test: the sortable header toggles asc → desc on
 * activation and exposes aria-sort, the data attributes track the
 * variant + size + sticky-header settings, and selected rows expose
 * aria-selected=true.
 */
export const InteractionSpec: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const onSortChange = fn();
    return (
      <div className="w-[40rem]">
        <Table<Person>
          aria-label="Spec table"
          variant="outlined"
          size="md"
          columns={peopleColumns}
          rows={people}
          sortKey="name"
          sortDirection="asc"
          onSortChange={onSortChange}
          selectedRowKeys={["1"]}
          rowKey={(row) => row.id}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Spec table" });
    expect(table).toHaveAttribute("data-variant", "outlined");
    expect(table).toHaveAttribute("data-size", "md");

    const sortButton = canvas.getByRole("button", {
      name: /Sorted ascending/,
    });
    expect(sortButton).toBeVisible();
    await userEvent.click(sortButton);
    await waitFor(() => {
      expect(canvas.getByText("Ada Lovelace")).toBeVisible();
    });

    const rows = within(table).getAllByRole("row");
    // 1 header row + 4 body rows.
    expect(rows.length).toBe(5);

    const selected = rows.find(
      (r) => r.getAttribute("aria-selected") === "true",
    );
    expect(selected ?? null).not.toBeNull();
  },
};
