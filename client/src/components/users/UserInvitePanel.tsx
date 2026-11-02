import { useState, type FormEvent } from "react";
import { Alert, Button, Select } from "../common";
import { ROLE_OPTIONS } from "../../constants/roles";
import type { ApiErrorShape } from "../../lib/axios";
import { inviteUserDetailsSchema } from "../../lib/validations/userSchemas";
import { userService } from "../../services/userService";
import type { UserInvitationPreviewRow } from "../../types/user";
import { downloadBlob } from "../../lib/downloadFile";

interface UserInvitePanelProps {
  onComplete: (count: number) => void;
  onClose: () => void;
}

export function UserInvitePanel({ onComplete, onClose }: UserInvitePanelProps) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
  }>({});
  const [roleId, setRoleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<UserInvitationPreviewRow[] | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = inviteUserDetailsSchema.safeParse({ fullName, email });
    if (!validation.success) {
      setFieldErrors(
        validation.error.issues.reduce<{ fullName?: string; email?: string }>(
          (errors, issue) => {
            const field = issue.path[0];
            if ((field === "fullName" || field === "email") && !errors[field]) {
              errors[field] = issue.message;
            }
            return errors;
          },
          {},
        ),
      );
      return;
    }
    setFieldErrors({});
    if (!roleId) {
      setApiError("Choose a role.");
      return;
    }

    setApiError(null);
    setIsSubmitting(true);
    try {
      await userService.invite({
        fullName: validation.data.fullName,
        email: validation.data.email,
        roleId: Number(roleId),
      });
      setFullName("");
      setEmail("");
      setRoleId("");
      setFieldErrors({});
      onComplete(1);
    } catch (error) {
      setApiError((error as ApiErrorShape).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setApiError("Choose an .xlsx file to preview.");
      return;
    }
    setApiError(null);
    setIsSubmitting(true);
    try {
      const response = await userService.previewBulkInvitations(file);
      setRows(response.data);
    } catch (error) {
      setApiError((error as ApiErrorShape).message);
      setRows(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!rows) return;
    const validRows = rows.filter(
      (row): row is UserInvitationPreviewRow & { roleId: number } =>
        row.status === "valid" && row.roleId !== null,
    );
    if (!validRows.length) return;

    setApiError(null);
    setIsSubmitting(true);
    try {
      const response = await userService.confirmBulkInvitations(
        validRows.map((row) => ({
          rowNumber: row.rowNumber,
          fullName: row.fullName,
          email: row.email,
          roleId: row.roleId,
        })),
      );
      const resultsByRow = new Map(
        response.data.map((row) => [row.rowNumber, row]),
      );
      setRows(
        (currentRows) =>
          currentRows?.map((row) => resultsByRow.get(row.rowNumber) ?? row) ??
          [],
      );
      const created = response.data.filter(
        (row) => row.status === "created",
      ).length;
      if (created) onComplete(created);
    } catch (error) {
      setApiError((error as ApiErrorShape).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = async () => {
    setApiError(null);
    try {
      const blob = await userService.downloadImportTemplate();
      downloadBlob(blob, "user-import-template.xlsx");
    } catch (error) {
      setApiError((error as ApiErrorShape).message);
    }
  };

  const handleModeChange = (nextMode: "single" | "bulk") => {
    setMode(nextMode);
    setApiError(null);
  };

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    setRows(null);
    setApiError(null);
  };

  const createdCount =
    rows?.filter((row) => row.status === "created").length ?? 0;
  const validCount = rows?.filter((row) => row.status === "valid").length ?? 0;

  return (
    <section className="mb-6 rounded-lg border border-steel-200 bg-white p-5 dark:border-steel-700 dark:bg-steel-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-steel-900 dark:text-steel-50">
            Add users
          </h2>
          <p className="mt-1 text-sm text-steel-500 dark:text-steel-400">
            New users receive an email link to set their password. The link
            expires after 12 hours.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mb-5 flex gap-2" role="tablist" aria-label="Add users">
        <Button
          type="button"
          variant={mode === "single" ? "primary" : "secondary"}
          role="tab"
          aria-selected={mode === "single"}
          disabled={isSubmitting}
          onClick={() => handleModeChange("single")}
        >
          Add one user
        </Button>
        <Button
          type="button"
          variant={mode === "bulk" ? "primary" : "secondary"}
          role="tab"
          aria-selected={mode === "bulk"}
          disabled={isSubmitting}
          onClick={() => handleModeChange("bulk")}
        >
          Add multiple users
        </Button>
      </div>

      {apiError && <Alert variant="error">{apiError}</Alert>}

      {mode === "single" ? (
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={handleInvite}
          noValidate
        >
          <label className="text-sm font-medium text-steel-700 dark:text-steel-200">
            Name
            <input
              required
              minLength={3}
              maxLength={100}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={
                fieldErrors.fullName ? "invite-name-error" : undefined
              }
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setFieldErrors((errors) => ({
                  ...errors,
                  fullName: undefined,
                }));
              }}
              className="mt-1.5 w-full rounded-md border border-steel-200 bg-white px-3 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-950 dark:text-steel-50"
            />
            {fieldErrors.fullName && (
              <span
                id="invite-name-error"
                className="mt-1 block text-xs text-red-600 dark:text-red-400"
              >
                {fieldErrors.fullName}
              </span>
            )}
          </label>
          <label className="text-sm font-medium text-steel-700 dark:text-steel-200">
            Email
            <input
              required
              type="email"
              maxLength={254}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "invite-email-error" : undefined
              }
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((errors) => ({ ...errors, email: undefined }));
              }}
              className="mt-1.5 w-full rounded-md border border-steel-200 bg-white px-3 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-950 dark:text-steel-50"
            />
            {fieldErrors.email && (
              <span
                id="invite-email-error"
                className="mt-1 block text-xs text-red-600 dark:text-red-400"
              >
                {fieldErrors.email}
              </span>
            )}
          </label>
          <Select
            label="Role"
            value={roleId}
            onChange={(event) => setRoleId(event.target.value)}
            placeholder="Choose a role"
            options={ROLE_OPTIONS.slice(1).map((role) => ({
              value: role.id,
              label: `${role.id} - ${role.label}`,
            }))}
          />
          <div className="flex items-end justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              Send invitation
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={downloadTemplate}
            >
              Download Excel template
            </Button>
            <label className="text-sm font-medium text-steel-700 dark:text-steel-200">
              Upload completed .xlsx template
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                disabled={isSubmitting}
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
                className="mt-1.5 block max-w-full cursor-pointer text-sm text-steel-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-steel-800 file:px-3 file:py-2 file:font-semibold file:text-steel-50 file:shadow-sm file:transition-colors hover:file:bg-steel-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-steel-300 dark:file:bg-amber-400 dark:file:text-steel-950 dark:hover:file:bg-amber-300"
              />
            </label>
            <Button
              type="button"
              onClick={handlePreview}
              isLoading={isSubmitting && !rows}
              disabled={!file || isSubmitting}
            >
              Preview spreadsheet
            </Button>
          </div>

          <p className="text-xs text-steel-500 dark:text-steel-400">
            Keep the columns in this order: <strong>name</strong>,{" "}
            <strong>email</strong>, <strong>role</strong>. Role values are{" "}
            <strong>2 - Customer</strong>, or{" "}
            <strong>3 - Staff (Employee)</strong>. Role 2 is Customer; role 3 is
            Staff/Employee.
          </p>

          {rows && (
            <>
              <div className="overflow-x-auto rounded-md border border-steel-200 dark:border-steel-700">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-steel-50 text-xs uppercase text-steel-600 dark:bg-steel-800 dark:text-steel-300">
                    <tr>
                      <th className="px-3 py-2.5">Excel row</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Email</th>
                      <th className="px-3 py-2.5">Role</th>
                      <th className="px-3 py-2.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-steel-100 dark:divide-steel-800">
                    {rows.map((row) => (
                      <tr key={row.rowNumber}>
                        <td className="px-3 py-2.5">{row.rowNumber}</td>
                        <td className="px-3 py-2.5">{row.fullName || "—"}</td>
                        <td className="px-3 py-2.5">{row.email || "—"}</td>
                        <td className="px-3 py-2.5">
                          {row.roleLabel ?? (row.role || "—")}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={
                              row.status === "valid" || row.status === "created"
                                ? "font-semibold text-green-700 dark:text-green-400"
                                : "font-semibold text-red-700 dark:text-red-400"
                            }
                          >
                            {row.status === "valid"
                              ? "Ready"
                              : row.status === "created"
                                ? "Invitation sent"
                                : row.errors.join(" ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-steel-600 dark:text-steel-300">
                  {createdCount
                    ? `${createdCount} invitation${createdCount === 1 ? "" : "s"} sent.`
                    : `${validCount} user${validCount === 1 ? "" : "s"} ready; invalid rows will be skipped.`}
                </p>
                {!createdCount && (
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    disabled={!validCount}
                  >
                    Confirm and send invitations
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
