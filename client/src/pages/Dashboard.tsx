import { AppLayout } from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { LowStockPanel } from "../components/dashboard/LowStockPanel";
import { InventoryPanel } from "../components/dashboard/InventoryPanel";
import { PurchaseTrendChart } from "../components/dashboard/PurchaseTrendChart";
import { FinancialSummaryPanel } from "../components/dashboard/Financialsummarypanel";
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1 className="mb-6 font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
        Welcome, {user?.fullName ?? "back"}
      </h1>

      <div className="flex flex-col gap-6">
        {/* Purchases are admin-only elsewhere in the app, so only show this
            chart to admins — everyone else would just hit a 403. */}
        {user?.roleId === ROLES.ADMIN && (
          <>
            <PurchaseTrendChart />
            <FinancialSummaryPanel />{" "}
          </>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <LowStockPanel />
          </div>
          <div className="lg:col-span-2">
            <InventoryPanel />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
