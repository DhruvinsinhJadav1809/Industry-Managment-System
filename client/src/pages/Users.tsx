import { Search, Users as UsersIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pagination, Select } from "../components/common";
import { UserEditModal } from "../components/users/UserEditModal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { UserTable } from "../components/users/UserTable";
import { AppLayout } from "../layouts/AppLayout";
import { ROLE_OPTIONS } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { userService } from "../services/userService";
import type { ApiErrorShape } from "../lib/axios";
import type { SortOrder, UserListItem } from "../types/user";

const PAGE_SIZE = 10;

export default function Users() {
  const { user: currentUser } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState<string>("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 350);

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      roleId: roleId ? Number(roleId) : undefined,
      sortBy,
      sortOrder,
    }),
    [page, debouncedSearch, roleId, sortBy, sortOrder]
  );

  const fetchUsers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await userService.list(params);
      setUsers(res.data.items);
      setTotalRecords(res.data.totalRecords);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setLoadError((err as ApiErrorShape).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Reset to page 1 whenever filters change underneath the current page.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleId, sortBy, sortOrder]);

  const handleSortChange = (key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await userService.remove(deletingUser.id);
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      setActionError((err as ApiErrorShape).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
          <UsersIcon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-steel-900 dark:text-steel-50">
            User management
          </h1>
          <p className="text-sm text-steel-500 dark:text-steel-400">
            {totalRecords} account{totalRecords === 1 ? "" : "s"} across the network
          </p>
        </div>
      </div>

      {actionError && (
        <div className="mb-4">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

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
              placeholder="Search by name or email"
              className="w-full rounded-md border border-steel-200 bg-white/70 py-2.5 pl-10 pr-3.5 text-sm text-steel-900 outline-none transition-colors focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <Select
            label="Role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            placeholder="All roles"
            options={ROLE_OPTIONS.map((r) => ({ value: r.id, label: r.label }))}
          />
        </div>
      </div>

      {loadError ? (
        <Alert variant="error">{loadError}</Alert>
      ) : (
        <>
          <UserTable
            users={users}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
            currentUserId={currentUser?.id}
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

      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => {
          setEditingUser(null);
          fetchUsers();
        }}
      />

      <ConfirmDialog
        open={Boolean(deletingUser)}
        title="Delete user"
        description={
          deletingUser
            ? `This will permanently remove ${deletingUser.fullName} (${deletingUser.email}). This can't be undone.`
            : ""
        }
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingUser(null)}
      />
    </AppLayout>
  );
}
