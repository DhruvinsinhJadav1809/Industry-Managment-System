import { Package, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, ConfirmDialog, Pagination, Button } from "../components/common";
import { ProductCreateModal } from "../components/products/ProductCreateModal";
import { ProductEditModal } from "../components/products/ProductEditModal";
import { ProductTable } from "../components/products/ProductTable";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { productService } from "../services/productService";
import type { ApiErrorShape } from "../lib/axios";
import type { ProductListItem, SortOrder } from "../types/product";

const PAGE_SIZE = 10;

export default function Products() {
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductListItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 350);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    }),
    [page, debouncedSearch, sortBy, sortOrder]
  );

  const fetchProducts = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await productService.list(params);
      setProducts(res.data.items);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder]);

  const handleSortChange = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await productService.remove(deletingProduct.id);
      toast.success(`${deletingProduct.name} was deleted.`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error((err as ApiErrorShape).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Products
            </h1>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {totalRecords} product{totalRecords === 1 ? "" : "s"} in the catalog
            </p>
          </div>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="size-4" aria-hidden="true" />}
        >
          Add product
        </Button>
      </div>

      <div className="mb-5 max-w-sm">
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
            placeholder="Search by name or SKU"
            className="w-full rounded-md border border-steel-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none transition-colors hover:border-steel-300 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:hover:border-steel-600 dark:focus:border-amber-400/70"
          />
        </div>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <ProductTable
            products={products}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onEdit={(p) => setEditingProductId(p.id)}
            onDelete={setDeletingProduct}
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

      <ProductCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          toast.success("Product created.");
          fetchProducts();
        }}
      />

      <ProductEditModal
        productId={editingProductId}
        onClose={() => setEditingProductId(null)}
        onSaved={() => {
          setEditingProductId(null);
          toast.success("Product updated.");
          fetchProducts();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title="Delete product"
        description={
          deletingProduct
            ? `This will permanently remove ${deletingProduct.name} (${deletingProduct.sku}). This can't be undone.`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
      />
    </AppLayout>
  );
}
