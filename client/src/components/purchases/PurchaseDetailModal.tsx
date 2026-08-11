import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Modal } from "../common";
import { purchaseStatusTone } from "../../constants/purchaseStatus";
import { purchaseService } from "../../services/purchaseService";
import type { ApiErrorShape } from "../../lib/axios";
import type { PurchaseDetail } from "../../types/purchase";
import {
  downloadBlob,
  fileNameFromContentDisposition,
} from "../../lib/downloadFile";
import React from "react";

interface PurchaseDetailModalProps {
  purchaseId: string | null;
  onClose: () => void;
}

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PurchaseDetailModal({
  purchaseId,
  onClose,
}: PurchaseDetailModalProps) {
  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState<boolean>(false);
  useEffect(() => {
    if (!purchaseId) {
      setPurchase(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    purchaseService
      .getById(purchaseId)
      .then((res) => {
        if (!cancelled) setPurchase(res.data);
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
  }, [purchaseId]);
  const handleDownloadPDF = async () => {
    setIsLoadingPDF(true);
    if (purchaseId) {
      try {
        const response = await purchaseService.downloadPDF(purchaseId);
        const fileName = fileNameFromContentDisposition(
          response.headers["content-disposition"],
          "Purchase.pdf",
        );
        downloadBlob(response.data, fileName);
      } catch (err) {
        console.error(err);
        alert("Failed to download PDF");
      } finally {
        setIsLoadingPDF(false);
      }
    }
  };
  return (
    <Modal
      open={Boolean(purchaseId)}
      onClose={onClose}
      title={purchase ? purchase.purchaseNumber : "Purchase details"}
      description={purchase ? `Invoice ${purchase.invoiceNumber}` : undefined}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-steel-500 dark:text-steel-400">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading purchase…
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : purchase ? (
        <React.Fragment>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                  Supplier
                </p>
                <p className="text-steel-900 dark:text-steel-50">
                  {purchase.supplierId.name}
                </p>
                <p className="text-xs text-steel-400">
                  {purchase.supplierId.code}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                  Date
                </p>
                <p className="text-steel-900 dark:text-steel-50">
                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                  Status
                </p>
                <Badge tone={purchaseStatusTone(purchase.status)}>
                  {purchase.status}
                </Badge>
              </div>
              {purchase.remarks && (
                <div className="col-span-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                    Remarks
                  </p>
                  <p className="text-steel-700 dark:text-steel-300">
                    {purchase.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-md border border-steel-200 dark:border-steel-800">
              <table className="w-full min-w-[420px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-steel-200 bg-steel-100/60 dark:border-steel-800 dark:bg-steel-900/60">
                    <th className="px-3 py-2 font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Product
                    </th>
                    <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Qty
                    </th>
                    <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Price
                    </th>
                    <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Tax
                    </th>
                    <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-steel-100 last:border-0 dark:border-steel-800/60"
                    >
                      <td className="px-3 py-2.5 text-steel-800 dark:text-steel-100">
                        {item.productId.name}
                        <span className="ml-1.5 font-mono text-[10px] text-steel-400">
                          {item.productId.code}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-steel-600 dark:text-steel-300">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-steel-600 dark:text-steel-300">
                        {money(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-steel-600 dark:text-steel-300">
                        {item.taxPercentage}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-medium text-steel-900 dark:text-steel-50">
                        {money(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto flex w-full max-w-[220px] flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-steel-500 dark:text-steel-400">Subtotal</dt>
                <dd className="font-mono text-steel-800 dark:text-steel-100">
                  {money(purchase.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500 dark:text-steel-400">Tax</dt>
                <dd className="font-mono text-steel-800 dark:text-steel-100">
                  {money(purchase.taxAmount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500 dark:text-steel-400">Discount</dt>
                <dd className="font-mono text-steel-800 dark:text-steel-100">
                  -{money(purchase.discount)}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-steel-200 pt-1.5 dark:border-steel-700">
                <dt className="font-semibold text-steel-900 dark:text-steel-50">
                  Grand total
                </dt>
                <dd className="font-mono font-bold text-steel-900 dark:text-steel-50">
                  {money(purchase.grandTotal)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleDownloadPDF} disabled={isLoadingPDF}>
              Download
            </Button>
          </div>
        </React.Fragment>
      ) : null}
    </Modal>
  );
}
