import { Eye } from "lucide-react";
import { Badge } from "../common";
import { purchaseStatusTone } from "../../constants/purchaseStatus";
import type { PurchaseListItem } from "../../types/purchase";

interface PurchaseTableProps {
  purchases: PurchaseListItem[];
  isLoading: boolean;
  onView: (purchase: PurchaseListItem) => void;
}

const columns = ["Purchase #", "Supplier", "Date", "Grand total", "Status"];

export function PurchaseTable({
  purchases,
  isLoading,
  onView,
}: PurchaseTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
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
              <tr
                key={i}
                className="border-b border-steel-100 dark:border-steel-800/60"
              >
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-3.5 w-full max-w-[100px] animate-pulse rounded bg-steel-100 dark:bg-steel-800" />
                  </td>
                ))}
              </tr>
            ))
          ) : purchases.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
              >
                No purchases match your filters.
              </td>
            </tr>
          ) : (
            purchases.map((purchase) => (
              <tr
                key={purchase._id}
                className="cursor-pointer border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
                onClick={() => onView(purchase)}
              >
                <td className="px-4 py-3.5 font-mono font-medium text-steel-900 dark:text-steel-50">
                  {purchase.purchaseNumber}
                </td>
                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {purchase.supplierId?.name ?? "—"}
                </td>
                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 font-mono text-steel-800 dark:text-steel-100">
                  {purchase.grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={purchaseStatusTone(purchase.status)}>
                    {purchase.status}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(purchase);
                      }}
                      aria-label={`View ${purchase.purchaseNumber}`}
                      className="cursor-pointer rounded-md p-1.5 text-steel-500 transition-colors hover:bg-steel-100 hover:text-steel-800 dark:text-steel-400 dark:hover:bg-steel-800 dark:hover:text-steel-100"
                    >
                      <Eye className="size-4" aria-hidden="true" />
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
