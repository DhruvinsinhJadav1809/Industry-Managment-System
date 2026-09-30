import { ArrowRight, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button } from "../components/common";
import { AppLayout } from "../layouts/AppLayout";
import { userService } from "../services/userService";
import type { ApiErrorShape } from "../lib/axios";
import type { UserListItem } from "../types/user";

export default function Staffs() {
  const [staff, setStaff] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStaff = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await userService.list({
          page: 1,
          pageSize: 100,
          roleId: 3,
        });

        setStaff(response.data.items ?? []);
      } catch (err) {
        setError((err as ApiErrorShape).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadStaff();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
              <Users className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Staff directory
              </p>
              <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
                Staff list
              </h1>
            </div>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
          {isLoading ? (
            <div className="py-10 text-center text-steel-500 dark:text-steel-400">
              Loading staff...
            </div>
          ) : staff.length === 0 ? (
            <div className="py-10 text-center text-steel-500 dark:text-steel-400">
              No staff members found.
            </div>
          ) : (
            <div className="space-y-3">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 rounded-lg border border-steel-200 bg-steel-50/80 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-steel-800 dark:bg-steel-950/60"
                >
                  <div>
                    <p className="font-semibold text-steel-900 dark:text-steel-50">
                      {member.fullName}
                    </p>
                    <p className="text-sm text-steel-500 dark:text-steel-400">
                      {member.email}
                    </p>
                  </div>

                  <Link to={`/staff/${member.id}/salary`}>
                    <Button
                      type="button"
                      variant="secondary"
                      icon={
                        <ArrowRight className="size-4" aria-hidden="true" />
                      }
                    >
                      View salary
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
