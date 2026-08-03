import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ConfirmDialog,
  Pagination,
  Select,
} from "../components/common";
import { SupplierCreateModal } from "../components/suppliers/SupplierCreateModal";
import { SupplierEditModal } from "../components/suppliers/SupplierEditModal";
import { SupplierTable } from "../components/suppliers/SupplierTable";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { supplierService } from "../services/supplierService";
import type { ApiErrorShape } from "../lib/axios";
import type { Supplier } from "../types/supplier";
import { Download, Plus, Search, Truck } from "lucide-react";
import {
  downloadBlob,
  fileNameFromContentDisposition,
} from "../lib/downloadFile";
const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function Suppliers() {
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  );
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 350);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      isActive: statusFilter === "" ? undefined : statusFilter === "true",
    }),
    [page, debouncedSearch, statusFilter],
  );

  const fetchSuppliers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await supplierService.list(params);
      setSuppliers(res.data.items);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    setIsDeleting(true);
    try {
      await supplierService.remove(deletingSupplier.id);
      toast.success(`${deletingSupplier.name} was deleted.`);
      setDeletingSupplier(null);
      fetchSuppliers();
    } catch (err) {
      toast.error((err as ApiErrorShape).message);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await supplierService.exportExcel({
        search: debouncedSearch || undefined,
        isActive: statusFilter === "" ? undefined : statusFilter === "true",
      });
      const fileName = fileNameFromContentDisposition(
        response.headers["content-disposition"],
        "suppliers.xlsx",
      );
      downloadBlob(response.data, fileName);
      toast.success("Export downloaded.");
    } catch {
      toast.error("Could not export suppliers. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
            <Truck className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Suppliers
            </h1>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {totalRecords} supplier{totalRecords === 1 ? "" : "s"} on record
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
          <Button
            onClick={() => setCreateOpen(true)}
            icon={<Plus className="size-4" aria-hidden="true" />}
          >
            Add supplier
          </Button>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
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
              placeholder="Search by name or code"
              className="w-full rounded-md border border-steel-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none transition-colors hover:border-steel-300 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:hover:border-steel-600 dark:focus:border-amber-400/70"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All statuses"
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <SupplierTable
            suppliers={suppliers}
            isLoading={isLoading}
            onEdit={(s) => setEditingSupplierId(s.id)}
            onDelete={setDeletingSupplier}
          />

          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <SupplierCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          toast.success("Supplier created.");
          fetchSuppliers();
        }}
      />

      <SupplierEditModal
        supplierId={editingSupplierId}
        onClose={() => setEditingSupplierId(null)}
        onSaved={() => {
          setEditingSupplierId(null);
          toast.success("Supplier updated.");
          fetchSuppliers();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingSupplier)}
        title="Delete supplier"
        description={
          deletingSupplier
            ? `This will permanently remove ${deletingSupplier.name} (${deletingSupplier.code}). This can't be undone.`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingSupplier(null)}
      />
    </AppLayout>
  );
}
