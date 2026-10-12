import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { settingsService } from "../services/settingsService";
import type { CompanySettings } from "../types/settings";
import { ROLES } from "../constants/roles";

interface CompanySettingsContextValue {
  settings: CompanySettings | null;
  isLoading: boolean;
  setSettings: (settings: CompanySettings) => void;
  refresh: () => void;
}

const CompanySettingsContext = createContext<
  CompanySettingsContextValue | undefined
>(undefined);

export function CompanySettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const shouldLoadSettings = isAuthenticated && user?.roleId !== ROLES.CUSTOMER;
  const [settings, setSettingsState] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = useCallback(() => {
    if (!shouldLoadSettings) {
      setSettingsState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    settingsService
      .get()
      .then((res) => setSettingsState(res.data))
      .catch(() => {
        // Not set up yet, or the request failed — sidebar falls back to
        // the default IMS brand mark, so this can fail quietly.
        setSettingsState(null);
      })
      .finally(() => setIsLoading(false));
  }, [shouldLoadSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      setSettings: setSettingsState,
      refresh: fetchSettings,
    }),
    [settings, isLoading, fetchSettings],
  );

  return (
    <CompanySettingsContext.Provider value={value}>
      {children}
    </CompanySettingsContext.Provider>
  );
}

export function useCompanySettings() {
  const ctx = useContext(CompanySettingsContext);
  if (!ctx) {
    throw new Error(
      "useCompanySettings must be used within a CompanySettingsProvider",
    );
  }
  return ctx;
}
