import { Plus, Receipt, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Pagination, Select } from "../components/common";
import { SaleTable } from "../components/sales/SaleTable";
import { AppLayout } from "../layouts/AppLayout";
import { SALE_STATUS_OPTIONS } from "../constants/saleStatus";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { saleService } from "../services/salesService";
import type { ApiErrorShape } from "../lib/axios";
import type { SaleListItem } from "../types/sale";

const PAGE_SIZE = 10;

export default function Sales() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [sales, setSales] = useState<SaleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  // NOTE: no customerId filter in the UI yet — there's no customer
  // search/list endpoint to pick one from. Add a CustomerPicker here once
  // that exists (see the note in types/sale.ts about the customer model).
  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      status: status || undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, debouncedSearch, status],
  );

  const fetchSales = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await saleService.list(params);
      // Same envelope shape as Purchases: data.data / data.pagination.
      setSales(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
            <Receipt className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Sales
            </h1>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {total} sale{total === 1 ? "" : "s"} on record
            </p>
          </div>
        </div>

        <Link to="/sales/new">
          <Button icon={<Plus className="size-4" aria-hidden="true" />}>
            New sale
          </Button>
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
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
              placeholder="Search by invoice number"
              className="w-full rounded-md border border-steel-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none transition-colors hover:border-steel-300 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:hover:border-steel-600 dark:focus:border-amber-400/70"
            />
          </div>
        </div>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="All statuses"
          options={SALE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
        />
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <SaleTable sales={sales} isLoading={isLoading} />

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
    </AppLayout>
  );
}
