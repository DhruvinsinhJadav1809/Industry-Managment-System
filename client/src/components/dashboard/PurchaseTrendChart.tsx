import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { clsx } from "clsx";
import { Alert } from "../common";
import { purchaseService } from "../../services/purchaseService";
import type { ApiErrorShape } from "../../lib/axios";
import type { PurchaseListItem } from "../../types/purchase";

type Period = "quarterly" | "yearly";

function periodKey(dateStr: string, period: Period) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  if (period === "yearly") return `${year}`;
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${year} Q${quarter}`;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-steel-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-steel-700 dark:bg-steel-900">
      <p className="font-mono text-steel-500 dark:text-steel-400">{label}</p>
      <p className="mt-0.5 font-semibold text-steel-900 dark:text-steel-50">
        {payload[0].value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}

export function PurchaseTrendChart() {
  const [period, setPeriod] = useState<Period>("quarterly");
  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    // Pulls a large page of purchases to chart client-side. If purchase
    // volume grows well past this, swap for a dedicated aggregation
    // endpoint (e.g. GET /purchases/summary?groupBy=quarter) instead.
    purchaseService
      .list({
        page: 1,
        pageSize: 100,
        sortBy: "purchaseDate",
        sortOrder: "asc",
      })
      .then((res) => {
        if (!cancelled) setPurchases(res.data.data);
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

  const chartData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of purchases) {
      const key = periodKey(p.purchaseDate, period);
      totals.set(key, (totals.get(key) ?? 0) + p.grandTotal);
    }
    return Array.from(totals.entries())
      .map(([label, total]) => ({
        label,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [purchases, period]);

  return (
    <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
            <BarChart3 className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
              Purchase spend
            </h2>
            <p className="text-xs text-steel-500 dark:text-steel-400">
              Grand total by period
            </p>
          </div>
        </div>

        <div className="flex rounded-md border border-steel-200 p-0.5 dark:border-steel-700">
          {(["quarterly", "yearly"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setPeriod(opt)}
              className={clsx(
                "cursor-pointer rounded px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wide transition-colors",
                period === opt
                  ? "bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950"
                  : "text-steel-500 hover:text-steel-800 dark:text-steel-400 dark:hover:text-steel-100",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-steel-400 dark:text-steel-500">
          Loading chart…
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-steel-400 dark:text-steel-500">
          No purchase history to chart yet.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-steel-200)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--color-steel-500)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-steel-200)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-steel-500)" }}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--color-steel-100)" }}
              />
              <Bar
                dataKey="total"
                fill="var(--color-amber-400)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
