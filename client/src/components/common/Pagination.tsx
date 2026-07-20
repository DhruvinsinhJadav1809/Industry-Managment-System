import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalRecords === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRecords);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-steel-100 pt-4 dark:border-steel-800 sm:flex-row">
      <p className="font-mono text-xs text-steel-500 dark:text-steel-400">
        Showing {start}–{end} of {totalRecords}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-md p-1.5 text-steel-500 transition-colors hover:bg-steel-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-steel-400 dark:hover:bg-steel-800"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center">
              {showEllipsis && (
                <span className="px-1 font-mono text-xs text-steel-400">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={clsx(
                  "min-w-8 rounded-md px-2 py-1.5 font-mono text-xs font-medium transition-colors",
                  p === page
                    ? "bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950"
                    : "text-steel-600 hover:bg-steel-100 dark:text-steel-400 dark:hover:bg-steel-800"
                )}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="rounded-md p-1.5 text-steel-500 transition-colors hover:bg-steel-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-steel-400 dark:hover:bg-steel-800"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
