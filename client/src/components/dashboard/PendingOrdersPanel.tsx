import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, Button } from "../common";
import { DashboardSection } from "./DashboardSection";
import { orderService } from "../../services/orderService";
import type { ApiErrorShape } from "../../lib/axios";
import type { CustomerOrder } from "../../types/order";
import {
  getOrderCustomerName,
  getOrderProductName,
} from "../../lib/orderUtils";

export function PendingOrdersPanel() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      orderService.list({ page: 1, pageSize: 5, status: "PENDING" }),
      orderService.list({ page: 1, pageSize: 5, status: "APPROVED" }),
    ])
      .then(([pending, approved]) => {
        if (!cancelled) {
          setOrders([...pending.data.items, ...approved.data.items]);
        }
      })
      .catch((err) => {
        if (!cancelled) setError((err as ApiErrorShape).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const pendingCount = orders.filter(
    (order) => order.status === "PENDING",
  ).length;

  return (
    <DashboardSection
      title="Customer orders to bill"
      description="Review new orders and finish billing approved orders"
      trailing={
        <>
          {pendingCount > 0 && (
            <span className="motion-safe:animate-pulse inline-flex items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <AlertTriangle className="size-3.5" aria-hidden="true" />
              Needs review
            </span>
          )}
          <span className="font-mono text-xs text-steel-500">
            {orders.length} to bill
          </span>
        </>
      }
    >
      {error ? (
        <Alert variant="error">{error}</Alert>
      ) : orders.length === 0 ? (
        <p className="py-4 text-sm text-steel-500">
          There are no orders awaiting approval or billing.
        </p>
      ) : (
        <div className="divide-y divide-steel-200 dark:divide-steel-800">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="font-semibold text-steel-900 dark:text-steel-50">
                  {order.orderNumber}
                </p>
                <p className="mt-0.5 text-sm text-steel-600 dark:text-steel-300">
                  {getOrderCustomerName(order)} ·{" "}
                  {order.items[0]
                    ? getOrderProductName(order.items[0])
                    : "Product"}{" "}
                  · Qty {order.items[0]?.requestedQuantity}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/sales/new", { state: { order } })}
                icon={<ArrowRight className="size-4" aria-hidden="true" />}
              >
                {order.status === "PENDING" ? "Accept and bill" : "Create bill"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
