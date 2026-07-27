import { Building2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, ConfirmDialog, Pagination } from "../components/common";
import { AssignManagerModal } from "../components/departments/AssignManagerModal";
import { DepartmentCreateModal } from "../components/departments/DepartmentCreateModal";
import { DepartmentEditModal } from "../components/departments/DepartmentEditModal";
import { DepartmentTable } from "../components/departments/DepartmentTable";
import { AppLayout } from "../layouts/AppLayout";
import { useToast } from "../context/ToastContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { departmentService } from "../services/departmentService";
import type { ApiErrorShape } from "../lib/axios";
import type { DepartmentListItem, SortOrder } from "../types/department";

const PAGE_SIZE = 10;

export default function Departments() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [assigningDept, setAssigningDept] = useState<DepartmentListItem | null>(
    null
  );
  const [editingDept, setEditingDept] = useState<DepartmentListItem | null>(
    null
  );
  const [deletingDept, setDeletingDept] = useState<DepartmentListItem | null>(
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

  const fetchDepartments = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await departmentService.list(params);
      setDepartments(res.data.items);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
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
    if (!deletingDept) return;
    setIsDeleting(true);
    try {
      await departmentService.remove(deletingDept.id);
      toast.success(`${deletingDept.name} was deleted.`);
      setDeletingDept(null);
      fetchDepartments();
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
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
              Departments
            </h1>
            <p className="text-sm text-steel-500 dark:text-steel-400">
              {totalRecords} department{totalRecords === 1 ? "" : "s"} across the network
            </p>
          </div>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="size-4" aria-hidden="true" />}
        >
          Add department
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
            placeholder="Search by name or code"
            className="w-full rounded-md border border-steel-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none transition-colors hover:border-steel-300 focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900 dark:text-steel-50 dark:hover:border-steel-600 dark:focus:border-amber-400/70"
          />
        </div>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <DepartmentTable
            departments={departments}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onAssignManager={setAssigningDept}
            onEdit={setEditingDept}
            onDelete={setDeletingDept}
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

      <DepartmentCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          toast.success("Department created.");
          fetchDepartments();
        }}
      />

      <AssignManagerModal
        department={assigningDept}
        onClose={() => setAssigningDept(null)}
        onAssigned={() => {
          setAssigningDept(null);
          toast.success("Manager assigned.");
          fetchDepartments();
        }}
      />

      <DepartmentEditModal
        department={editingDept}
        onClose={() => setEditingDept(null)}
        onSaved={() => {
          setEditingDept(null);
          toast.success("Department updated.");
          fetchDepartments();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingDept)}
        title="Delete department"
        description={
          deletingDept
            ? `This will permanently remove ${deletingDept.name} (${deletingDept.code}). This can't be undone.`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDept(null)}
      />
    </AppLayout>
  );
}
