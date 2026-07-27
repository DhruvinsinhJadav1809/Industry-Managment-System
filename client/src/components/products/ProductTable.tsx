import { ArrowDown, ArrowUp, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../common";
import type { ProductListItem, SortOrder } from "../../types/product";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

const columns: Column[] = [
  { key: "name", label: "Product", sortable: true },
  { key: "sku", label: "SKU", sortable: true },
  { key: "department", label: "Department" },
  { key: "unit", label: "Unit" },
  { key: "costPrice", label: "Cost", sortable: true },
  { key: "sellingPrice", label: "Sell", sortable: true },
  { key: "isActive", label: "Status" },
];

interface ProductTableProps {
  products: ProductListItem[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: SortOrder;
  onSortChange: (key: string) => void;
  onEdit: (product: ProductListItem) => void;
  onDelete: (product: ProductListItem) => void;
}

export function ProductTable({
  products,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
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
                {Array.from({ length: 8 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-3.5 w-full max-w-[100px] animate-pulse rounded bg-steel-100 dark:bg-steel-800" />
                  </td>
                ))}
              </tr>
            ))
          ) : products.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
              >
                No products match your search.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
              >
                <td className="px-4 py-3.5 font-medium text-steel-900 dark:text-steel-50">
                  {product.name}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded bg-steel-100 px-2 py-0.5 font-mono text-xs text-steel-600 dark:bg-steel-800 dark:text-steel-300">
                    {product.sku}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {product.department.name}
                </td>
                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {product.unit}
                </td>
                <td className="px-4 py-3.5 font-mono text-steel-600 dark:text-steel-300">
                  {product.costPrice}
                </td>
                <td className="px-4 py-3.5 font-mono text-steel-600 dark:text-steel-300">
                  {product.sellingPrice}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={product.isActive ? "signal" : "red"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      aria-label={`Edit ${product.name}`}
                      className="cursor-pointer rounded-md p-1.5 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-100"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      aria-label={`Delete ${product.name}`}
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
