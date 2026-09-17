import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Modal } from "../common";
import { saleStatusTone } from "../../constants/saleStatus";
import { saleService } from "../../services/salesService";
import type { ApiErrorShape } from "../../lib/axios";
import type { SaleListItem } from "../../types/sale";
import React from "react";
import {
  downloadBlob,
  fileNameFromContentDisposition,
} from "../../lib/downloadFile";

interface SaleDetailModalProps {
  saleId: string | null;
  onClose: () => void;
}

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SaleDetailModal({ saleId, onClose }: SaleDetailModalProps) {
  const [sale, setSale] = useState<SaleListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState<boolean>(false);
  useEffect(() => {
    if (!saleId) {
      setSale(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    saleService
      .getById(saleId)
      .then((res) => {
        if (!cancelled) setSale(res.data);
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
  }, [saleId]);
  const handleDownloadPDF = async () => {
    setIsLoadingPDF(true);
    if (saleId) {
      try {
        const response = await saleService.downloadPDF(saleId);
        const fileName = fileNameFromContentDisposition(
          response.headers["content-disposition"],
          "Sale.pdf",
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
      open={Boolean(saleId)}
      onClose={onClose}
      title={sale ? sale.saleNumber : "Sale details"}
      description={sale ? `Invoice ${sale.invoiceNumber}` : undefined}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-steel-500 dark:text-steel-400">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading sale…
        </div>
      ) : loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : sale ? (
        <React.Fragment>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                  Customer
                </p>
                <p className="text-steel-900 dark:text-steel-50">
                  {sale.customerName}
                </p>
                <p className="text-xs text-steel-400">{sale.customerPhone}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                  Sale date
                </p>
                <p className="text-steel-900 dark:text-steel-50">
                  {new Date(sale.saleDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                  Payment
                </p>
                <div className="mt-0.5 flex flex-wrap gap-1.5">
                  <Badge tone="neutral">{sale.paymentMethod}</Badge>
                  <Badge tone={saleStatusTone(sale.paymentStatus)}>
                    {sale.paymentStatus}
                  </Badge>
                </div>
              </div>
              {sale.notes && (
                <div className="col-span-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
                    Notes
                  </p>
                  <p className="text-steel-700 dark:text-steel-300">
                    {sale.notes}
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
                      Rate
                    </th>
                    <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      GST
                    </th>
                    <th className="px-3 py-2 text-right font-mono uppercase tracking-wider text-steel-500 dark:text-steel-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item, i) => (
                    <tr
                      key={`${item.productId}-${i}`}
                      className="border-b border-steel-100 last:border-0 dark:border-steel-800/60"
                    >
                      <td className="px-3 py-2.5 text-steel-800 dark:text-steel-100">
                        {item.productName}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-steel-600 dark:text-steel-300">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-steel-600 dark:text-steel-300">
                        {money(item.rate)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-steel-600 dark:text-steel-300">
                        {item.gstPercentage}%
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-medium text-steel-900 dark:text-steel-50">
                        {money(item.total)}
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
                  {money(sale.subTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500 dark:text-steel-400">Tax</dt>
                <dd className="font-mono text-steel-800 dark:text-steel-100">
                  {money(sale.totalTax)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-steel-500 dark:text-steel-400">Discount</dt>
                <dd className="font-mono text-steel-800 dark:text-steel-100">
                  -{money(sale.discountAmount)}
                </dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-steel-200 pt-1.5 dark:border-steel-700">
                <dt className="font-semibold text-steel-900 dark:text-steel-50">
                  Grand total
                </dt>
                <dd className="font-mono font-bold text-steel-900 dark:text-steel-50">
                  {money(sale.grandTotal)}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleDownloadPDF} disabled={isLoadingPDF}>
              Download
            </Button>
          </div>{" "}
        </React.Fragment>
      ) : null}
    </Modal>
  );
}
