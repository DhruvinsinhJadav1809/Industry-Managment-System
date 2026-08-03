import { Image as ImageIcon, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "../common";
import { useToast } from "../../context/ToastContext";
import { settingsService } from "../../services/settingsService";
import type { ApiErrorShape } from "../../lib/axios";

interface LogoUploaderProps {
  logoUrl: string | null;
  onUploaded: (logoUrl: string) => void;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export function LogoUploader({ logoUrl, onUploaded }: LogoUploaderProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so selecting the same file again still fires onChange
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Logo must be under 2MB.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await settingsService.uploadLogo(file);
      onUploaded(res.data.logoUrl);
      toast.success("Logo updated.");
    } catch (err) {
      toast.error((err as ApiErrorShape).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-steel-200 bg-steel-50 dark:border-steel-700 dark:bg-steel-900">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Company logo"
            className="size-full object-contain"
          />
        ) : (
          <ImageIcon
            className="size-7 text-steel-300 dark:text-steel-600"
            aria-hidden="true"
          />
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          isLoading={isUploading}
          icon={<Upload className="size-4" aria-hidden="true" />}
        >
          {logoUrl ? "Change logo" : "Upload logo"}
        </Button>
        <p className="mt-1.5 text-xs text-steel-400 dark:text-steel-500">
          PNG, JPG, or SVG — up to 2MB.
        </p>
      </div>
    </div>
  );
}
