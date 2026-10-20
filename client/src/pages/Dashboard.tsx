import { AppLayout } from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { LowStockPanel } from "../components/dashboard/LowStockPanel";
import { InventoryPanel } from "../components/dashboard/InventoryPanel";
import { PurchaseTrendChart } from "../components/dashboard/PurchaseTrendChart";
import { FinancialSummaryPanel } from "../components/dashboard/Financialsummarypanel";
import { ProductProfitabilityChart } from "../components/dashboard/Productprofitabilitychart";
import { PendingOrdersPanel } from "../components/dashboard/PendingOrdersPanel";
import { OrderSummaryPanel } from "../components/dashboard/OrderSummaryPanel";
import { StaffDailyAttendance } from "../components/dashboard/StaffDailyAttendance";
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <h1 className="mb-6 font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
        Welcome, {user?.fullName ?? "back"}
      </h1>

      <div className="flex flex-col gap-6">
        {user?.roleId === ROLES.ADMIN && (
          <>
            <StaffDailyAttendance />
            <PendingOrdersPanel />
            <OrderSummaryPanel />
          </>
        )}
        {/* Purchases are admin-only elsewhere in the app, so only show this
            chart to admins — everyone else would just hit a 403. */}
        {user?.roleId === ROLES.ADMIN && (
          <>
            <FinancialSummaryPanel />
            <ProductProfitabilityChart />

            <PurchaseTrendChart />
          </>
        )}

        {user?.roleId === ROLES.CUSTOMER ? (
          <InventoryPanel />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <LowStockPanel />
            </div>
            <div className="lg:col-span-2">
              <InventoryPanel />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
