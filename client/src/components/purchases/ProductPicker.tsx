import { Check, ChevronDown, Package, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { productService } from "../../services/productService";
import type { ProductListItem } from "../../types/product";

interface ProductPickerProps {
  value?: string;
  initialLabel?: string | null;
  onChange: (product: ProductListItem) => void;
  error?: string;
}

export function ProductPicker({
  value,
  initialLabel,
  onChange,
  error,
}: ProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(
    initialLabel ?? null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIsLoading(true);
    productService
      .list({ page: 1, pageSize: 8, search: debouncedQuery || undefined })
      .then((res) => {
        if (!cancelled) setResults(res.data.items);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (product: ProductListItem) => {
    const displayLabel = `${product.name} (${product.sku})`;
    setSelectedLabel(displayLabel);
    onChange(product);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={clsx(
            "flex w-full cursor-pointer items-center gap-2 rounded-md border bg-white px-3.5 py-2.5 text-left text-sm outline-none transition-colors",
            "hover:border-steel-300 dark:bg-steel-900 dark:hover:border-steel-600",
            error
              ? "border-red-400 dark:border-red-500/70"
              : "border-steel-200 focus:border-steel-500 dark:border-steel-700 dark:focus:border-amber-400/70",
          )}
        >
          <Package
            className="size-4 shrink-0 text-steel-400 dark:text-steel-500"
            aria-hidden="true"
          />
          <span
            className={clsx(
              "flex-1 truncate",
              value
                ? "text-steel-900 dark:text-steel-50"
                : "text-steel-400 dark:text-steel-500",
            )}
          >
            {selectedLabel ?? "Select a product"}
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-steel-400 dark:text-steel-500"
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full rounded-md border border-steel-200 bg-white shadow-lg dark:border-steel-700 dark:bg-steel-900">
            <div className="flex items-center gap-2 border-b border-steel-100 px-3 py-2 dark:border-steel-800">
              <Search className="size-3.5 text-steel-400" aria-hidden="true" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-transparent text-sm text-steel-900 outline-none placeholder:text-steel-400 dark:text-steel-50 dark:placeholder:text-steel-500"
              />
            </div>

            <ul className="max-h-56 overflow-y-auto py-1">
              {isLoading ? (
                <li className="px-3 py-3 text-center text-xs text-steel-400">
                  Searching…
                </li>
              ) : results.length === 0 ? (
                <li className="px-3 py-3 text-center text-xs text-steel-400">
                  No matches
                </li>
              ) : (
                results.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(product)}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm text-steel-700 hover:bg-steel-50 dark:text-steel-200 dark:hover:bg-steel-800/70"
                    >
                      <span className="truncate">
                        <span className="font-medium text-steel-900 dark:text-steel-50">
                          {product.name}
                        </span>
                        <span className="ml-1.5 font-mono text-xs text-steel-400">
                          {product.sku}
                        </span>
                      </span>
                      {value === product.id && (
                        <Check
                          className="size-3.5 shrink-0 text-amber-500"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
