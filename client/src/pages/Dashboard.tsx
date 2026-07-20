import { AppLayout } from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="corner-frame rounded-lg border border-steel-200 bg-white/70 px-8 py-14 text-center dark:border-steel-800 dark:bg-steel-900/40">
        <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
          Welcome, {user?.fullName ?? "back"}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-steel-500 dark:text-steel-400">
          The plant dashboard is coming next — facilities, crews, and reports
          will live here.
        </p>
      </div>
    </AppLayout>
  );
}
