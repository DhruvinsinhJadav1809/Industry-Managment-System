import { AlertTriangle, PackageCheck, PackageX } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert } from "../common";
import { inventoryService } from "../../services/inventoryService";
import type { ApiErrorShape } from "../../lib/axios";
import type { InventoryItem } from "../../types/inventory";

export function LowStockPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    inventoryService
      .lowStock()
      .then((res) => {
        if (!cancelled) setItems(res.data);
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
  }, []);

  return (
    <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-amber-400/15 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
            Low stock
          </h2>
          <p className="text-xs text-steel-500 dark:text-steel-400">
            Items at or below their minimum stock level
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-md bg-steel-100 dark:bg-steel-800"
            />
          ))}
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : items.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-signal-400/30 bg-signal-500/10 px-3.5 py-3 text-sm text-signal-500 dark:text-signal-400">
          <PackageCheck className="size-4 shrink-0" aria-hidden="true" />
          All stock levels are healthy.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-amber-400/30 bg-amber-400/5 px-3.5 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <PackageX
                  className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-steel-900 dark:text-steel-50">
                    {item.product.name}
                  </p>
                  <p className="font-mono text-[11px] text-steel-400">
                    {item.product.code}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
                {item.quantity} / {item.minimumStock}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
