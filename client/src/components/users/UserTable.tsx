import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { Badge } from "../common";
import { ROLE_LABELS, ROLES } from "../../constants/roles";
import type { SortOrder, UserListItem } from "../../types/user";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

const columns: Column[] = [
  { key: "fullName", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "roleId", label: "Role", sortable: false },
  { key: "isActive", label: "Status", sortable: false },
];

interface UserTableProps {
  users: UserListItem[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (key: string) => void;
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  currentUserId?: string;
}

function roleTone(roleId: number) {
  if (roleId === ROLES.ADMIN) return "amber" as const;
  if (roleId === ROLES.STAFF) return "signal" as const;
  return "neutral" as const;
}

export function UserTable({
  users,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
  currentUserId,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
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
                    className="flex items-center gap-1 hover:text-steel-800 dark:hover:text-steel-100"
                  >
                    {col.label}
                    {sortBy === col.key ? (
                      sortOrder === "asc" ? (
                        <ArrowUp className="size-3" aria-hidden="true" />
                      ) : (
                        <ArrowDown className="size-3" aria-hidden="true" />
                      )
                    ) : (
                      <ArrowUpDown
                        className="size-3 opacity-40"
                        aria-hidden="true"
                      />
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
              <tr
                key={i}
                className="border-b border-steel-100 dark:border-steel-800/60"
              >
                {Array.from({ length: 5 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded bg-steel-100 dark:bg-steel-800" />
                  </td>
                ))}
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
              >
                No users match your filters.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
              >
                <td className="px-4 py-3.5 font-medium text-steel-900 dark:text-steel-50">
                  {user.fullName}
                  {user.id === currentUserId && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-wide text-steel-400">
                      you
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {user.email}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={roleTone(user.roleId)}>
                    {ROLE_LABELS[user.roleId] ?? "Unknown"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={user.isActive ? "signal" : "red"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${user.fullName}`}
                      className="rounded-md cursor-pointer p-1.5 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-100"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      disabled={user.id === currentUserId}
                      aria-label={`Delete ${user.fullName}`}
                      className={clsx(
                        "rounded-md p-1.5 transition-colors cursor-pointer",
                        user.id === currentUserId
                          ? "cursor-not-allowed text-steel-300 dark:text-steel-700"
                          : "text-steel-500 hover:bg-red-50 hover:text-red-600 dark:text-steel-400 dark:hover:bg-red-500/10 dark:hover:text-red-400",
                      )}
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
