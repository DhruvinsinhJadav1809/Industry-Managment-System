import { useEffect, useState } from "react";
import { Check, Download, Pencil, Plus, X } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  Select,
} from "../components/common";
import { useToast } from "../context/ToastContext";
import { inventoryService } from "../services/inventoryService";
import { orderService } from "../services/orderService";
import { saleService } from "../services/salesService";
import {
  downloadBlob,
  fileNameFromContentDisposition,
} from "../lib/downloadFile";
import type { ApiErrorShape } from "../lib/axios";
import type { InventoryItem } from "../types/inventory";
import type { CustomerOrder } from "../types/order";
import { AppLayout } from "../layouts/AppLayout";
import {
  getOrderProductCode,
  getOrderProductId,
  getOrderProductName,
} from "../lib/orderUtils";

export default function Orders() {
  const toast = useToast();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProductId, setEditProductId] = useState("");
  const [editQuantity, setEditQuantity] = useState(1);
  const [orderToCancel, setOrderToCancel] = useState<CustomerOrder | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setError(null);
    try {
      const [orderResponse, inventoryResponse] = await Promise.all([
        orderService.list({ page: 1, pageSize: 100 }),
        inventoryService.list({ page: 1, pageSize: 100 }),
      ]);
      setOrders(orderResponse.data.items);
      setInventory(inventoryResponse.data.items);
      setProductId(
        (current) =>
          current || inventoryResponse.data.items[0]?.product.id || "",
      );
    } catch (err) {
      setError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderMutationError = async (err: unknown) => {
    const apiError = err as ApiErrorShape;
    const message = apiError.message || "Unable to update this order.";
    const isOrderConflict =
      apiError.status === 409 ||
      message
        .toLowerCase()
        .includes("only pending orders can be modified or cancelled");

    if (!isOrderConflict) {
      setError(message);
      return;
    }

    setEditingId(null);
    setOrderToCancel(null);
    await loadData();
    setError(message);
    toast.error(message);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const submitOrder = async () => {
    if (!productId || quantity < 1) return;
    setIsSaving(true);
    setError(null);
    try {
      await orderService.create([{ productId, quantity }]);
      toast.success("Order placed.");
      setQuantity(1);
      await loadData();
    } catch (err) {
      setError((err as ApiErrorShape).message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveModification = async (order: CustomerOrder) => {
    if (!editProductId || editQuantity < 1) return;
    setIsSaving(true);
    setError(null);
    try {
      await orderService.update(order._id, {
        action: "modify",
        items: [{ productId: editProductId, quantity: editQuantity }],
      });
      toast.success("Order updated.");
      setEditingId(null);
      await loadData();
    } catch (err) {
      await handleOrderMutationError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;
    setIsSaving(true);
    setError(null);
    try {
      await orderService.update(orderToCancel._id, { action: "cancel" });
      toast.success("Order cancelled.");
      setOrderToCancel(null);
      await loadData();
    } catch (err) {
      await handleOrderMutationError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadBill = async (order: CustomerOrder) => {
    if (!order.saleId) return;
    setDownloadingOrderId(order._id);
    try {
      const response = await saleService.downloadPDF(order.saleId);
      const fileName = fileNameFromContentDisposition(
        response.headers["content-disposition"],
        `bill-${order.orderNumber}.pdf`,
      );
      downloadBlob(response.data, fileName);
      toast.success("Bill downloaded.");
    } catch (err) {
      toast.error((err as ApiErrorShape).message || "Unable to download bill.");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const productOptions = inventory.map((item) => ({
    value: item.product.id,
    label: `${item.product.name} · ${item.quantity} available`,
  }));
  const selectedProduct = inventory.find(
    (item) => item.product.id === productId,
  );

  const availableQuantity = selectedProduct?.quantity ?? 0;
  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500">
            Customer orders
          </p>
          <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
            Order summary
          </h1>
        </div>
        <span className="font-mono text-xs text-steel-500">
          {orders.length} orders
        </span>
      </div>

      {error && (
        <div className="mb-5">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <section className="mb-8 border-y border-steel-200 py-5 dark:border-steel-800">
        <div className="mb-4 flex items-center gap-2">
          <Plus
            className="size-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
            Place an order
          </h2>
          <span className="text-xs text-steel-500">One product per order</span>
        </div>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
          <Select
            label="Product"
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            placeholder="Choose a product"
            options={productOptions}
            disabled={isLoading || inventory.length === 0}
          />
          <label className="flex flex-col gap-1.5 font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Quantity
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value)))
              }
              className="rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50"
            />
          </label>
          <Button
            type="button"
            onClick={() => void submitOrder()}
            isLoading={isSaving}
            disabled={!productId || quantity > availableQuantity}
          >
            Place order
          </Button>
        </div>
        {inventory.length === 0 && !isLoading && (
          <p className="mt-3 text-sm text-steel-500">
            No products are currently available to order.
          </p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-steel-900 dark:text-steel-50">
            Your orders
          </h2>
          <span className="rounded-md border border-steel-200 bg-white px-2.5 py-1 font-mono text-xs text-steel-600 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-300">
            {orders.length} total
          </span>
        </div>
        {isLoading ? (
          <p className="py-8 text-sm text-steel-500">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-steel-300 bg-white/60 px-4 py-10 text-center text-sm text-steel-500 dark:border-steel-700 dark:bg-steel-900/30">
            No orders yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {orders.map((order) => {
              const item = order.items[0];
              const inventoryItem = inventory.find(
                (entry) =>
                  entry.product.id ===
                  (item ? getOrderProductId(item.productId) : ""),
              );
              const productCode = item
                ? getOrderProductCode(item) || inventoryItem?.product.code
                : undefined;
              const isEditing = editingId === order._id;
              const statusBorder =
                order.status === "PENDING"
                  ? "border-l-amber-400 dark:border-l-amber-400"
                  : order.status === "APPROVED"
                    ? "border-l-signal-500 dark:border-l-signal-400"
                    : "border-l-steel-500 dark:border-l-steel-400";
              return (
                <article
                  key={order._id}
                  className={`flex min-w-0 flex-col gap-4 rounded-lg border border-l-4 border-steel-200 ${statusBorder} bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-steel-800 dark:bg-steel-900/70 sm:p-5`}
                >
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-steel-500">
                        Order number
                      </p>
                      <h3 className="break-all font-display text-base font-bold text-steel-900 dark:text-steel-50">
                        {order.orderNumber}
                      </h3>
                    </div>
                    <Badge
                      tone={
                        order.status === "PENDING"
                          ? "amber"
                          : order.status === "APPROVED"
                            ? "signal"
                            : "neutral"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>

                  {isEditing ? (
                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_110px]">
                      <label className="flex min-w-0 flex-col gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-steel-500">
                        Product
                        <select
                          value={editProductId}
                          onChange={(event) =>
                            setEditProductId(event.target.value)
                          }
                          className="w-full min-w-0 rounded-md border border-steel-300 bg-white px-3 py-2.5 font-body text-sm font-normal normal-case tracking-normal text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-950 dark:text-steel-50"
                        >
                          {productOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-steel-500">
                        Quantity
                        <input
                          aria-label="Order quantity"
                          type="number"
                          min="1"
                          value={editQuantity}
                          onChange={(event) =>
                            setEditQuantity(
                              Math.max(1, Number(event.target.value)),
                            )
                          }
                          className="w-full rounded-md border border-steel-300 bg-white px-3 py-2.5 font-body text-sm font-normal text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-950 dark:text-steel-50"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center gap-3 rounded-md border border-steel-100 bg-steel-50/80 p-3 dark:border-steel-800 dark:bg-steel-950/50">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
                        <Plus className="size-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-steel-900 dark:text-steel-50">
                          {item ? getOrderProductName(item) : "Product"}
                          {productCode ? ` · ${productCode}` : ""}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-steel-500">
                          Quantity requested: {item?.requestedQuantity ?? 0}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono text-sm font-bold text-steel-700 dark:text-steel-200">
                        × {item?.requestedQuantity ?? 0}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 border-t border-steel-100 pt-3 dark:border-steel-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-[11px] text-steel-500">
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.status === "BILLED" && order.saleId ? (
                      <Button
                        type="button"
                        variant="secondary"
                        isLoading={downloadingOrderId === order._id}
                        onClick={() => void downloadBill(order)}
                        icon={
                          <Download className="size-4" aria-hidden="true" />
                        }
                      >
                        Download bill
                      </Button>
                    ) : order.status === "PENDING" ? (
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              className="col-span-1"
                              onClick={() => void saveModification(order)}
                              isLoading={isSaving}
                              icon={
                                <Check className="size-4" aria-hidden="true" />
                              }
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="col-span-1"
                              onClick={() => setEditingId(null)}
                              icon={<X className="size-4" aria-hidden="true" />}
                            >
                              Discard
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              className="col-span-1"
                              disabled={isSaving}
                              onClick={() => {
                                setEditingId(order._id);
                                setEditProductId(
                                  item ? getOrderProductId(item.productId) : "",
                                );
                                setEditQuantity(item?.requestedQuantity ?? 1);
                              }}
                              icon={
                                <Pencil className="size-4" aria-hidden="true" />
                              }
                            >
                              Modify
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              className="col-span-1"
                              disabled={isSaving}
                              onClick={() => setOrderToCancel(order)}
                              icon={<X className="size-4" aria-hidden="true" />}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <ConfirmDialog
        open={orderToCancel !== null}
        title="Cancel order?"
        description={
          orderToCancel
            ? `Are you sure you want to cancel ${orderToCancel.orderNumber}? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmLabel="Cancel order"
        isLoading={isSaving}
        onConfirm={() => void cancelOrder()}
        onCancel={() => setOrderToCancel(null)}
      />
    </AppLayout>
  );
}
