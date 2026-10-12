import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Alert } from "../common";
import { DashboardSection } from "./DashboardSection";
import { useTheme } from "../../context/ThemeContext";
import { orderService } from "../../services/orderService";
import type { ApiErrorShape } from "../../lib/axios";
import type { OrderStatus, OrderSummaryData } from "../../types/order";

const ORDER_STATUSES: { status: OrderStatus; label: string; tone: string }[] = [
  {
    status: "APPROVED",
    label: "Approved",
    tone: "text-steel-600 dark:text-steel-400",
  },
  {
    status: "BILLED",
    label: "Completed",
    tone: "text-signal-600 dark:text-signal-400",
  },
  {
    status: "PENDING",
    label: "Pending",
    tone: "text-amber-600 dark:text-amber-400",
  },
  {
    status: "CANCELLED",
    label: "Cancelled",
    tone: "text-steel-600 dark:text-steel-400",
  },
];

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  { light: string; dark: string }
> = {
  APPROVED: { light: "#2f855a", dark: "#4fae7d" },
  BILLED: { light: "#2f855a", dark: "#4fae7d" },
  PENDING: { light: "#e0932a", dark: "#f0a93a" },
  CANCELLED: { light: "#dc2626", dark: "#f87171" },
};

export function OrderSummaryPanel() {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<OrderSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    orderService
      .summary()
      .then((response) => {
        if (cancelled) return;
        setSummary(response.data);
      })
      .catch((err) => {
        if (!cancelled) setError((err as ApiErrorShape).message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = ORDER_STATUSES.map(({ status, label }) => ({
    status,
    name: label,
    value: summary?.statusCounts[status] ?? 0,
  }));
  const hasOrders = chartData.some(({ value }) => value > 0);

  return (
    <DashboardSection
      title="Online order summary"
      description="Current order totals by status"
    >
      {error ? (
        <Alert variant="error">{error}</Alert>
      ) : (
        <div className="grid min-w-0 grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                label: "Total orders",
                count: summary?.totalOrders,
                tone: "text-steel-800 dark:text-steel-100",
              },
              ...ORDER_STATUSES.map(({ status, label, tone }) => ({
                label,
                count: summary?.statusCounts[status],
                tone,
              })),
            ].map(({ label, count, tone }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-md border border-steel-200 bg-white/70 px-4 py-3 dark:border-steel-800 dark:bg-steel-900/40"
              >
                <span className="text-sm font-medium text-steel-600 dark:text-steel-300">
                  {label}
                </span>
                <span className={`font-mono text-2xl font-bold ${tone}`}>
                  {isLoading ? "—" : count}
                </span>
              </div>
            ))}
          </div>
          <div
            className="h-56 min-w-0"
            role="img"
            aria-label={`Online orders by status: ${chartData.map(({ name, value }) => `${name} ${value}`).join(", ")}`}
          >
            {isLoading ? null : hasOrders ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="88%"
                    stroke="white"
                    strokeWidth={2}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={ORDER_STATUS_COLORS[entry.status][theme]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-steel-400 dark:text-steel-500">
                No online orders yet.
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
