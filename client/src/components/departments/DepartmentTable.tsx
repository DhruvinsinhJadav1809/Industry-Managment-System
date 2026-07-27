import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2, UserCog } from "lucide-react";
import { Badge } from "../common";
import type { DepartmentListItem, SortOrder } from "../../types/department";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

const columns: Column[] = [
  { key: "name", label: "Department", sortable: true },
  { key: "code", label: "Code", sortable: true },
  { key: "description", label: "Description" },
  { key: "manager", label: "Manager" },
  { key: "isActive", label: "Status" },
];

interface DepartmentTableProps {
  departments: DepartmentListItem[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (key: string) => void;
  onAssignManager: (department: DepartmentListItem) => void;
  onEdit: (department: DepartmentListItem) => void;
  onDelete: (department: DepartmentListItem) => void;
}

export function DepartmentTable({
  departments,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  onAssignManager,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/60">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400"
              >
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => onSortChange(col.key)}
                    className="flex cursor-pointer items-center gap-1 hover:text-steel-800 dark:hover:text-steel-100"
                  >
                    {col.label}
                    {sortBy === col.key ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="size-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="size-3" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40" aria-hidden="true" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
            <th
              scope="col"
              className="px-4 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-steel-100 dark:border-steel-800/60">
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded bg-steel-100 dark:bg-steel-800" />
                  </td>
                ))}
              </tr>
            ))
          ) : departments.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
              >
                No departments match your search.
              </td>
            </tr>
          ) : (
            departments.map((dept) => (
              <tr
                key={dept.id}
                className="border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
              >
                <td className="px-4 py-3.5 font-medium text-steel-900 dark:text-steel-50">
                  {dept.name}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded bg-steel-100 px-2 py-0.5 font-mono text-xs text-steel-600 dark:bg-steel-800 dark:text-steel-300">
                    {dept.code}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {dept.description}
                </td>
                <td className="px-4 py-3.5">
                  {dept.manager ? (
                    <div className="leading-tight">
                      <p className="text-steel-800 dark:text-steel-100">
                        {dept.manager.fullName}
                      </p>
                      <p className="text-xs text-steel-400">{dept.manager.email}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-steel-400 dark:text-steel-500">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={dept.isActive ? "signal" : "red"}>
                    {dept.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onAssignManager(dept)}
                      aria-label={`Assign manager for ${dept.name}`}
                      className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-steel-600 transition-colors hover:bg-steel-100 hover:text-steel-900 dark:text-steel-300 dark:hover:bg-steel-800 dark:hover:text-steel-50"
                    >
                      <UserCog className="size-3.5" aria-hidden="true" />
                      {dept.manager ? "Reassign" : "Assign"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(dept)}
                      aria-label={`Edit ${dept.name}`}
                      className="cursor-pointer rounded-md p-1.5 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-100"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(dept)}
                      aria-label={`Delete ${dept.name}`}
                      className="cursor-pointer rounded-md p-1.5 text-steel-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-steel-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
