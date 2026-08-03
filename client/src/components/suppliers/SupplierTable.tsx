import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "../common";
import type { Supplier } from "../../types/supplier";

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const columns = [
  "Supplier",
  "Code",
  "Contact",
  "Location",
  "GSTIN",
  "Status",
];

export function SupplierTable({
  suppliers,
  isLoading,
  onEdit,
  onDelete,
}: SupplierTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/60">
            {columns.map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400"
              >
                {label}
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
                {Array.from({ length: 7 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-3.5 w-full max-w-[110px] animate-pulse rounded bg-steel-100 dark:bg-steel-800" />
                  </td>
                ))}
              </tr>
            ))
          ) : suppliers.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
              >
                No suppliers match your filters.
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
              >
                <td className="px-4 py-3.5 font-medium text-steel-900 dark:text-steel-50">
                  {supplier.name}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded bg-steel-100 px-2 py-0.5 font-mono text-xs text-steel-600 dark:bg-steel-800 dark:text-steel-300">
                    {supplier.code}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="leading-tight">
                    <p className="text-steel-800 dark:text-steel-100">
                      {supplier.contactPerson}
                    </p>
                    <p className="text-xs text-steel-400">{supplier.phone}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {supplier.city}, {supplier.state}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-steel-500 dark:text-steel-400">
                  {supplier.gstNumber}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={supplier.isActive ? "signal" : "red"}>
                    {supplier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(supplier)}
                      aria-label={`Edit ${supplier.name}`}
                      className="cursor-pointer rounded-md p-1.5 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-100"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(supplier)}
                      aria-label={`Delete ${supplier.name}`}
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
