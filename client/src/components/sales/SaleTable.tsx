import { Badge } from "../common";
import { saleStatusTone } from "../../constants/saleStatus";
import type { SaleListItem } from "../../types/sale";

interface SaleTableProps {
  sales: SaleListItem[];
  isLoading: boolean;
}

export function SaleTable({ sales, isLoading }: SaleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/60">
            <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
              Sale #
            </th>

            <th className="hidden px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400 sm:table-cell">
              Invoice #
            </th>

            <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
              Customer
            </th>

            <th className="hidden px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400 sm:table-cell">
              Date
            </th>

            <th className="px-4 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
              Total
            </th>

            <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
              Status
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
          ) : sales.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
              >
                No sales match your filters.
              </td>
            </tr>
          ) : (
            sales.map((sale) => (
              <tr
                key={sale._id}
                className="border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
              >
                <td className="px-4 py-3.5 font-mono font-medium text-steel-900 dark:text-steel-50">
                  {sale.saleNumber}
                </td>

                <td className="hidden px-4 py-3.5 font-mono text-steel-600 dark:text-steel-300 sm:table-cell">
                  {sale.invoiceNumber}
                </td>

                <td className="px-4 py-3.5 text-steel-600 dark:text-steel-300">
                  <div>{sale.customerName}</div>
                  {sale.customerPhone && (
                    <div className="text-xs text-steel-400">
                      {sale.customerPhone}
                    </div>
                  )}
                </td>

                <td className="hidden px-4 py-3.5 text-steel-600 dark:text-steel-300 sm:table-cell">
                  {new Date(sale.saleDate).toLocaleDateString()}
                </td>

                <td className="px-4 py-3.5 text-right font-mono text-steel-800 dark:text-steel-100">
                  {sale.grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>

                <td className="px-4 py-3.5">
                  <Badge tone={saleStatusTone(sale.paymentStatus)}>
                    {sale.paymentStatus}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
