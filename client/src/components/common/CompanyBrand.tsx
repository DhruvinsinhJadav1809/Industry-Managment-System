import { Logo } from "./Logo";
import { useCompanySettings } from "../../context/CompanySettingsContext";

interface CompanyBrandProps {
  size?: number;
}

export function CompanyBrand({ size = 30 }: CompanyBrandProps) {
  const { settings } = useCompanySettings();

  if (!settings?.logoUrl) {
    return <Logo size={size} />;
  }

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={settings.logoUrl}
        alt={settings.companyName}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-md border border-steel-200 object-contain dark:border-steel-700"
      />
      <div className="flex min-w-0 flex-col leading-none">
        <span className="truncate font-display text-sm font-bold tracking-tight text-steel-900 dark:text-steel-50">
          {settings.companyName}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
          Powered by IMS
        </span>
      </div>
    </div>
  );
}
