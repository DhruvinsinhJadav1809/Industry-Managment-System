import { Landmark, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { clsx } from "clsx";
import { Alert } from "../common";
import { financialSummaryService } from "../../services/financialSummaryService";
import type { ApiErrorShape } from "../../lib/axios";
import type { FinancialSummary } from "../../types/financialSummary";

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

type Tone = "steel" | "signal" | "amber";

const toneClasses: Record<Tone, string> = {
  steel: "bg-steel-800 text-steel-50 dark:bg-steel-700 dark:text-steel-50",
  signal: "bg-signal-500 text-white dark:bg-signal-400 dark:text-steel-950",
  amber: "bg-amber-400 text-steel-950",
};

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Landmark;
  tone: Tone;
}

function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="rounded-lg border border-steel-200 bg-white/70 p-4 dark:border-steel-800 dark:bg-steel-900/40">
      <div
        className={clsx(
          "mb-3 flex size-8 items-center justify-center rounded-md",
          toneClasses[tone],
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-steel-900 dark:text-steel-50">
        {money(value)}
      </p>
    </div>
  );
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-steel-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-steel-700 dark:bg-steel-900">
      <p className="font-mono text-steel-500 dark:text-steel-400">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="mt-0.5 font-semibold"
          style={{ color: entry.color }}
        >
          {entry.name}: {money(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function FinancialSummaryPanel() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    financialSummaryService
      .get()
      .then((res) => {
        if (!cancelled) setSummary(res.data);
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

  if (isLoading) {
    return (
      <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
        <div className="flex h-40 items-center justify-center text-sm text-steel-400 dark:text-steel-500">
          Loading financial summary…
        </div>
      </div>
    );
  }

  if (loadError) {
    return <Alert variant="error">{loadError}</Alert>;
  }

  if (!summary) return null;

  const chartData = [
    {
      label: "Subtotal",
      Purchase: summary.purchase.subtotal,
      Sales: summary.sales.subtotal,
    },
    { label: "Tax", Purchase: summary.purchase.tax, Sales: summary.sales.tax },
    {
      label: "Total",
      Purchase: summary.purchase.total,
      Sales: summary.sales.total,
    },
  ];

  return (
    <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 p-6 dark:border-steel-800 dark:bg-steel-900/40">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
            Financial summary
          </h2>
          <p className="text-xs text-steel-500 dark:text-steel-400">
            Purchases, sales, and tax overview
          </p>
        </div>
        <span className="rounded-full bg-steel-100 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wide text-steel-600 dark:bg-steel-800 dark:text-steel-300">
          FY {summary.financialYear}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Purchases"
          value={summary.purchase.total}
          icon={Receipt}
          tone="steel"
        />
        <StatCard
          label="Sales"
          value={summary.sales.total}
          icon={ShoppingBag}
          tone="signal"
        />
        <StatCard
          label="Gross profit"
          value={summary.profit.grossProfit}
          icon={TrendingUp}
          tone="amber"
        />
        <StatCard
          label="Net tax"
          value={summary.tax.netTax}
          icon={Landmark}
          tone="steel"
        />
      </div>

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
              width={64}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--color-steel-100)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="Purchase"
              fill="var(--color-steel-500)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Sales"
              fill="var(--color-signal-500)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
