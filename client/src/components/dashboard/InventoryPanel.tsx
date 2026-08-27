import { Boxes } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Badge, Pagination } from "../common";
import { inventoryService } from "../../services/inventoryService";
import type { ApiErrorShape } from "../../lib/axios";
import type { InventoryItem } from "../../types/inventory";

const PAGE_SIZE = 10;

export function InventoryPanel() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    inventoryService
      .list({ page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.items);
        setTotalRecords(res.data.totalRecords);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        if (!cancelled) setLoadError((err as ApiErrorShape).message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
          <Boxes className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
            Inventory
          </h2>
          <p className="text-xs text-steel-500 dark:text-steel-400">
            {totalRecords} item{totalRecords === 1 ? "" : "s"} tracked
          </p>
        </div>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-steel-200 dark:border-steel-800">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/60">
                  <th className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-mono text-[11px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
                    Min. stock
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
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <div className="h-3.5 w-full max-w-[100px] animate-pulse rounded bg-steel-100 dark:bg-steel-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-steel-500 dark:text-steel-400"
                    >
                      No inventory records yet.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isLow = item.quantity <= item.minimumStock;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-steel-100 last:border-0 hover:bg-steel-50 dark:border-steel-800/60 dark:hover:bg-steel-900/40"
                      >
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-steel-900 dark:text-steel-50">
                            {item.product.name}
                          </p>
                          <p className="font-mono text-[11px] text-steel-400">
                            {item.product.code}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-steel-800 dark:text-steel-100">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-steel-500 dark:text-steel-400">
                          {item.minimumStock}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={isLow ? "amber" : "signal"}>
                            {isLow ? "Low stock" : "In stock"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
