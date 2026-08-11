import { Trash2 } from "lucide-react";
import { ProductPicker } from "./ProductPicker";
import type { PurchaseItemFormValues } from "../../lib/validations/purchaseSchemas";
import type { ProductListItem } from "../../types/product";

interface ItemFieldError {
  productId?: string;
  quantity?: string;
  unitPrice?: string;
  taxPercentage?: string;
}

interface PurchaseItemRowProps {
  index: number;
  item: PurchaseItemFormValues;
  error?: ItemFieldError;
  onChange: (index: number, patch: Partial<PurchaseItemFormValues>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

function numberInputClasses(hasError: boolean) {
  return `w-full rounded-md border bg-white px-3 py-2 text-sm text-steel-900 outline-none transition-colors dark:bg-steel-900 dark:text-steel-50 ${
    hasError
      ? "border-red-400 dark:border-red-500/70"
      : "border-steel-200 focus:border-steel-500 dark:border-steel-700 dark:focus:border-amber-400/70"
  }`;
}

export function PurchaseItemRow({
  index,
  item,
  error,
  onChange,
  onRemove,
  canRemove,
}: PurchaseItemRowProps) {
  const lineTotal =
    item.quantity && item.unitPrice
      ? item.quantity * item.unitPrice * (1 + (item.taxPercentage || 0) / 100)
      : 0;

  const handleProductSelect = (product: ProductListItem) => {
    onChange(index, {
      productId: product.id,
      productLabel: `${product.name} (${product.sku})`,
      // Pre-fill from the product's cost price if this row's price is still empty.
      unitPrice: item.unitPrice || product.costPrice,
    });
  };

  return (
    <div className="grid grid-cols-12 gap-3 border-b border-steel-100 py-4 last:border-0 dark:border-steel-800/60">
      <div className="col-span-12 sm:col-span-4">
        <ProductPicker
          value={item.productId}
          initialLabel={item.productLabel}
          onChange={handleProductSelect}
          error={error?.productId}
        />
      </div>

      <div className="col-span-4 sm:col-span-2">
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
          Qty
        </label>
        <input
          type="number"
          min="0"
          step="1"
          value={item.quantity || ""}
          onChange={(e) =>
            onChange(index, {
              quantity: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
          className={numberInputClasses(Boolean(error?.quantity))}
        />
        {error?.quantity && (
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
            {error.quantity}
          </p>
        )}
      </div>

      <div className="col-span-4 sm:col-span-2">
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
          Unit price
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unitPrice || ""}
          onChange={(e) =>
            onChange(index, {
              unitPrice: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
          className={numberInputClasses(Boolean(error?.unitPrice))}
        />
        {error?.unitPrice && (
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
            {error.unitPrice}
          </p>
        )}
      </div>

      <div className="col-span-4 sm:col-span-2">
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
          Tax %
        </label>
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={item.taxPercentage || ""}
          onChange={(e) =>
            onChange(index, {
              taxPercentage: e.target.value === "" ? 0 : Number(e.target.value),
            })
          }
          className={numberInputClasses(Boolean(error?.taxPercentage))}
        />
        {error?.taxPercentage && (
          <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
            {error.taxPercentage}
          </p>
        )}
      </div>

      <div className="col-span-10 flex flex-col justify-end sm:col-span-1">
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-steel-500 dark:text-steel-400">
          Line total
        </label>
        <p className="py-2 text-right font-mono text-sm font-medium text-steel-800 dark:text-steel-100">
          {lineTotal.toFixed(2)}
        </p>
      </div>

      <div className="col-span-2 flex items-end justify-end sm:col-span-1">
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          aria-label="Remove item"
          className="cursor-pointer rounded-md p-2 text-steel-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
