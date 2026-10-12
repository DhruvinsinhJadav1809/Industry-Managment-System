import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert } from "../common";
import { DashboardSection } from "./DashboardSection";
import { productProfitabilityService } from "../../services/productProfitabilityService";
import type { ApiErrorShape } from "../../lib/axios";
import type { ProductProfitabilityItem } from "../../types/productProfitability";

function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function barColor(margin: number) {
  if (margin >= 35) return "var(--color-signal-500)";
  if (margin >= 15) return "var(--color-amber-400)";
  return "#dc2626";
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: ProductProfitabilityItem }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-steel-200 bg-white px-3 py-2.5 text-xs shadow-lg dark:border-steel-700 dark:bg-steel-900">
      <p className="font-semibold text-steel-900 dark:text-steel-50">
        {p.productName}
      </p>
      <p className="mt-0.5 font-mono text-[10px] text-steel-400">
        {p.departmentName}
      </p>
      <div className="mt-2 space-y-1 text-steel-600 dark:text-steel-300">
        <p>
          Sold: <span className="font-mono">{p.soldQuantity}</span>
        </p>
        <p>
          Sales: <span className="font-mono">{money(p.salesAmount)}</span>
        </p>
        <p>
          Purchase cost:{" "}
          <span className="font-mono">{money(p.purchaseCost)}</span>
        </p>
        <p className="font-semibold text-steel-900 dark:text-steel-50">
          Profit: <span className="font-mono">{money(p.profit)}</span> (
          {p.profitMargin.toFixed(1)}%)
        </p>
      </div>
    </div>
  );
}

export function ProductProfitabilityChart() {
  const [products, setProducts] = useState<ProductProfitabilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    productProfitabilityService
      .get()
      .then((res) => {
        if (cancelled) return;
        setProducts([...res.data.products].sort((a, b) => b.profit - a.profit));
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
      <DashboardSection
        title="Product profitability"
        description="Profit by product"
      >
        <div className="flex h-64 items-center justify-center text-sm text-steel-400 dark:text-steel-500">
          Loading product profitability…
        </div>
      </DashboardSection>
    );
  }

  if (loadError) {
    return (
      <DashboardSection
        title="Product profitability"
        description="Profit by product"
      >
        <Alert variant="error">{loadError}</Alert>
      </DashboardSection>
    );
  }

  // Height scales with the number of products so bars stay readable
  // instead of getting squeezed as more products are added.
  const chartHeight = Math.max(220, products.length * 44);

  return (
    <DashboardSection
      title="Product profitability"
      description="Profit by product"
      trailing={
        <div className="flex size-8 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
          <TrendingUp className="size-4" aria-hidden="true" />
        </div>
      }
    >
      {products.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-steel-400 dark:text-steel-500">
          No product activity yet.
        </div>
      ) : (
        <div style={{ height: chartHeight }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={products}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-steel-200)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "var(--color-steel-500)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-steel-200)" }}
              />
              <YAxis
                type="category"
                dataKey="productName"
                width={110}
                tick={{ fontSize: 11, fill: "var(--color-steel-600)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "var(--color-steel-100)" }}
              />
              <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
                {products.map((p) => (
                  <Cell key={p.productId} fill={barColor(p.profitMargin)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-steel-500 dark:text-steel-400">
        <span className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: "var(--color-signal-500)" }}
          />
          Margin ≥ 35%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" />
          Margin 15–35%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-red-600" />
          Margin &lt; 15%
        </span>
      </div>
    </DashboardSection>
  );
}
