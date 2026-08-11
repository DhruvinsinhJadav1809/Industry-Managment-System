import { Download, Plus, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Pagination, Select } from "../components/common";
import { PurchaseDetailModal } from "../components/purchases/PurchaseDetailModal";
import { PurchaseTable } from "../components/purchases/PurchaseTable";
import { SupplierPicker } from "../components/purchases/SupplierPicker";
import { AppLayout } from "../layouts/AppLayout";
import { PURCHASE_STATUS_OPTIONS } from "../constants/purchaseStatus";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  downloadBlob,
  fileNameFromContentDisposition,
} from "../lib/downloadFile";
import { purchaseService } from "../services/purchaseService";
import type { ApiErrorShape } from "../lib/axios";
import type { PurchaseListItem } from "../types/purchase";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
const PAGE_SIZE = 10;

export default function Purchases() {
  const toast = useToast();
  const { user } = useAuth();
  // Set when this page is reached via /purchases/:id — e.g. a notification's
  // actionUrl — so the detail modal opens automatically on arrival.
  const { id: deepLinkedId } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierLabel, setSupplierLabel] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [viewingId, setViewingId] = useState<string | null>(
    deepLinkedId ?? null,
  );
  const debouncedSearch = useDebouncedValue(search, 350);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      supplierId: supplierId || undefined,
      status: status || undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, debouncedSearch, supplierId, status],
  );

  const fetchPurchases = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await purchaseService.list(params);
      // Note: this endpoint's envelope differs from the rest of the app —
      // `data.data` / `data.pagination` instead of `items` / flat page fields.
      setPurchases(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, supplierId, status]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await purchaseService.exportExcel({
        search: debouncedSearch || undefined,
        supplierId: supplierId || undefined,
        status: status || undefined,
      });
      const fileName = fileNameFromContentDisposition(
        response.headers["content-disposition"],
        "purchases.xlsx",
      );
      downloadBlob(response.data, fileName);
      toast.success("Export downloaded.");
    } catch {
      toast.error("Could not export purchases. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
            <ShoppingCart className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Purchases
            </h1>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {total} purchase{total === 1 ? "" : "s"} on record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            isLoading={isExporting}
            icon={<Download className="size-4" aria-hidden="true" />}
          >
            Export
          </Button>
          {user?.roleId === ROLES.ADMIN && (
            <Link to="/purchases/new">
              <Button icon={<Plus className="size-4" aria-hidden="true" />}>
                New purchase
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel-400 dark:text-steel-500"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by purchase #"
              className="w-full rounded-md border border-steel-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none transition-colors hover:border-steel-300 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:hover:border-steel-600 dark:focus:border-amber-400/70"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="block font-body text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
              Supplier
            </span>
            {supplierId && (
              <button
                type="button"
                onClick={() => {
                  setSupplierId("");
                  setSupplierLabel(null);
                }}
                className="mb-1.5 flex cursor-pointer items-center gap-0.5 text-[11px] text-steel-400 hover:text-steel-700 dark:hover:text-steel-200"
              >
                <X className="size-3" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
          <SupplierPicker
            label=""
            value={supplierId}
            initialLabel={supplierLabel}
            onChange={(id, label) => {
              setSupplierId(id);
              setSupplierLabel(label);
            }}
          />
        </div>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="All statuses"
          options={PURCHASE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
        />
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <PurchaseTable
            purchases={purchases}
            isLoading={isLoading}
            onView={(p) => setViewingId(p._id)}
          />

          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalRecords={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <PurchaseDetailModal
        purchaseId={viewingId}
        onClose={() => setViewingId(null)}
      />
    </AppLayout>
  );
}
