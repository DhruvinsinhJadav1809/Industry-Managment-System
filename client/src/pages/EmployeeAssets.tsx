import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowRightLeft,
  Download,
  Package,
  Plus,
  RotateCcw,
  Trash2,
  UserPlus,
} from "lucide-react";
import ExcelJS from "exceljs";
import {
  Alert,
  Button,
  ConfirmDialog,
  Modal,
  Select,
} from "../components/common";
import { ROLES } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { ApiErrorShape } from "../lib/axios";
import { AppLayout } from "../layouts/AppLayout";
import { employeeAssetService } from "../services/employeeAssetService";
import { userService } from "../services/userService";
import { saveAs } from "file-saver";
import type {
  EmployeeAsset,
  EmployeeAssetReleaseRequest,
  MyEmployeeAsset,
} from "../types/employeeAsset";
import type { UserListItem } from "../types/user";

const inputClasses =
  "w-full rounded-md border border-steel-200 bg-white px-3.5 py-2.5 text-sm text-steel-900 outline-none focus:border-steel-500 dark:border-steel-700 dark:bg-steel-900/40 dark:text-steel-50 dark:focus:border-amber-400/70";

function styleAssetReportSheet(
  worksheet: ExcelJS.Worksheet,
  columnCount: number,
  lastDataRow: number,
) {
  const lastColumn = worksheet.getColumn(columnCount).letter;
  worksheet.mergeCells(`A1:${lastColumn}1`);
  worksheet.getCell("A1").font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 18,
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F4E78" },
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getRow(1).height = 32;
  worksheet.getCell("A2").font = {
    italic: true,
    color: { argb: "FF64748B" },
  };

  const headerRow = worksheet.getRow(4);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    cell.alignment = { vertical: "middle", wrapText: true };
  });

  if (lastDataRow >= 4) {
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: lastDataRow, column: columnCount },
    };
  }
  worksheet.views = [{ state: "frozen", ySplit: 4 }];

  const totalRow = worksheet.lastRow;
  if (totalRow && totalRow.number > lastDataRow) {
    totalRow.font = { bold: true };
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FF94A3B8" } },
      };
    });
  }
}

export default function EmployeeAssets() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.roleId === ROLES.ADMIN;
  const [assets, setAssets] = useState<EmployeeAsset[]>([]);
  const [myAssets, setMyAssets] = useState<MyEmployeeAsset[]>([]);
  const [staff, setStaff] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assigningAsset, setAssigningAsset] = useState<EmployeeAsset | null>(
    null,
  );
  const [deletingAsset, setDeletingAsset] = useState<EmployeeAsset | null>(
    null,
  );
  const [reassigning, setReassigning] = useState<{
    asset: EmployeeAsset;
    staffId: string;
    staffName: string;
    quantity: number;
  } | null>(null);
  const [removingAssignment, setRemovingAssignment] = useState<{
    asset: EmployeeAsset;
    staffId: string;
    staffName: string;
    quantity: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [releasingAsset, setReleasingAsset] = useState<MyEmployeeAsset | null>(
    null,
  );
  const [reviewingRelease, setReviewingRelease] = useState<{
    asset: EmployeeAsset;
    request: EmployeeAssetReleaseRequest;
    status: "APPROVED" | "REJECTED";
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      if (isAdmin) {
        const [assetResponse, staffResponse] = await Promise.all([
          employeeAssetService.getAll(),
          userService.list({ page: 1, pageSize: 100, roleId: ROLES.STAFF }),
        ]);
        setAssets(assetResponse.data ?? []);
        setStaff(
          (staffResponse.data.items ?? []).filter((member) => member.isActive),
        );
      } else {
        const response = await employeeAssetService.getMine();
        setMyAssets(response.data ?? []);
      }
    } catch (error) {
      setLoadError(
        (error as ApiErrorShape).message || "Could not load employee assets.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const exportAssets = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Industry Management System";
      workbook.subject = "Employee asset inventory and assignments";
      workbook.created = new Date();

      const summarySheet = workbook.addWorksheet("Asset Inventory");
      summarySheet.columns = [
        { header: "Asset", key: "asset", width: 32 },
        { header: "Total quantity", key: "total", width: 18 },
        { header: "Assigned quantity", key: "assigned", width: 20 },
        { header: "Available quantity", key: "available", width: 20 },
      ];
      summarySheet.addRow(["Employee Asset Inventory"]);
      summarySheet.addRow([`Generated: ${new Date().toLocaleString("en-IN")}`]);
      summarySheet.addRow([]);
      summarySheet.addRow(
        summarySheet.columns.map((column) => String(column.header ?? "")),
      );
      summarySheet.addRows(
        assets.map((asset) => ({
          asset: asset.name,
          total: asset.quantity,
          assigned: asset.assignedQuantity,
          available: asset.availableQuantity,
        })),
      );
      const summaryLastDataRow = summarySheet.rowCount;
      const summaryTotalRow = summarySheet.addRow([
        "TOTAL",
        assets.reduce((total, asset) => total + asset.quantity, 0),
        assets.reduce((total, asset) => total + asset.assignedQuantity, 0),
        assets.reduce((total, asset) => total + asset.availableQuantity, 0),
      ]);
      summaryTotalRow.eachCell((cell, columnNumber) => {
        if (columnNumber > 1) cell.numFmt = "#,##0";
      });
      styleAssetReportSheet(summarySheet, 4, summaryLastDataRow);

      const assignmentSheet = workbook.addWorksheet("Employee Assignments");
      assignmentSheet.columns = [
        { header: "Asset", key: "asset", width: 32 },
        { header: "Employee", key: "employee", width: 30 },
        { header: "Quantity assigned", key: "quantity", width: 22 },
      ];
      assignmentSheet.addRow(["Employee Asset Assignments"]);
      assignmentSheet.addRow([
        `Generated: ${new Date().toLocaleString("en-IN")}`,
      ]);
      assignmentSheet.addRow([]);
      assignmentSheet.addRow(
        assignmentSheet.columns.map((column) => String(column.header ?? "")),
      );

      const assignments = assets.flatMap((asset) => {
        const byEmployee = new Map<
          string,
          { employee: string; quantity: number }
        >();
        asset.assignments.forEach((assignment) => {
          const current = byEmployee.get(assignment.staffId);
          if (current) {
            current.quantity += assignment.quantity;
          } else {
            byEmployee.set(assignment.staffId, {
              employee: assignment.staffName,
              quantity: assignment.quantity,
            });
          }
        });
        return [...byEmployee.values()].map((assignment) => ({
          asset: asset.name,
          employee: assignment.employee,
          quantity: assignment.quantity,
        }));
      });
      assignmentSheet.addRows(assignments);
      const assignmentLastDataRow = assignmentSheet.rowCount;
      const assignedTotal = assignments.reduce(
        (total, assignment) => total + assignment.quantity,
        0,
      );
      const assignmentTotalRow = assignmentSheet.addRow([
        "TOTAL",
        "",
        assignedTotal,
      ]);
      assignmentTotalRow.getCell(3).numFmt = "#,##0";
      styleAssetReportSheet(assignmentSheet, 3, assignmentLastDataRow);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const date = new Date().toISOString().slice(0, 10);
      saveAs(blob, `employee-assets-${date}.xlsx`);
      toast.success("Employee asset report downloaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Employee asset report could not be exported.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const createAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const quantity = Number(formData.get("quantity"));
    setIsSaving(true);
    try {
      await employeeAssetService.create({ name, quantity });
      toast.success("Asset added to inventory.");
      setIsCreateOpen(false);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Asset could not be added.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const assignAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!assigningAsset) return;
    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      await employeeAssetService.assign(assigningAsset.id, {
        staffId: String(formData.get("staffId") ?? ""),
        quantity: Number(formData.get("quantity")),
      });
      toast.success(`${assigningAsset.name} assigned to the employee.`);
      setAssigningAsset(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Asset could not be assigned.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAsset = async () => {
    if (!deletingAsset) return;
    setIsSaving(true);
    try {
      await employeeAssetService.remove(deletingAsset.id);
      toast.success(`${deletingAsset.name} removed from inventory.`);
      setDeletingAsset(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Asset could not be deleted.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const reassignAsset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reassigning) return;
    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      await employeeAssetService.reassign(
        reassigning.asset.id,
        reassigning.staffId,
        String(formData.get("newStaffId") ?? ""),
      );
      toast.success(`${reassigning.asset.name} reassigned successfully.`);
      setReassigning(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message || "Asset could not be reassigned.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeAssignment = async () => {
    if (!removingAssignment) return;
    setIsSaving(true);
    try {
      await employeeAssetService.removeAssignment(
        removingAssignment.asset.id,
        removingAssignment.staffId,
      );
      toast.success(
        `${removingAssignment.asset.name} removed from ${removingAssignment.staffName}.`,
      );
      setRemovingAssignment(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message ||
          "Asset could not be removed from this employee.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const requestAssetRelease = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!releasingAsset) return;
    const formData = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      await employeeAssetService.requestRelease(releasingAsset.id, {
        quantity: Number(formData.get("quantity")),
        note: String(formData.get("note") ?? "").trim(),
      });
      toast.success("Asset release request sent to an administrator.");
      setReleasingAsset(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message ||
          "Asset release request could not be submitted.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const reviewReleaseRequest = async () => {
    if (!reviewingRelease) return;
    setIsSaving(true);
    try {
      await employeeAssetService.reviewReleaseRequest(
        reviewingRelease.asset.id,
        reviewingRelease.request.id,
        reviewingRelease.status,
      );
      toast.success(
        `Asset release request ${reviewingRelease.status.toLowerCase()}.`,
      );
      setReviewingRelease(null);
      await loadData();
    } catch (error) {
      toast.error(
        (error as ApiErrorShape).message ||
          "Asset release request could not be reviewed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = isAdmin ? "Employee assets" : "My assigned assets";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-steel-800 text-steel-50 dark:bg-amber-400 dark:text-steel-950">
              <Package className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel-500 dark:text-steel-400">
                Asset inventory
              </p>
              <h1 className="font-display text-2xl font-bold text-steel-900 dark:text-steel-50">
                {pageTitle}
              </h1>
            </div>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void exportAssets()}
                isLoading={isExporting}
                disabled={isLoading || assets.length === 0}
                icon={<Download className="size-4" aria-hidden="true" />}
              >
                Export Excel
              </Button>
              <Button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                icon={<Plus className="size-4" aria-hidden="true" />}
              >
                Add asset
              </Button>
            </div>
          )}
        </div>

        {loadError && <Alert variant="error">{loadError}</Alert>}

        <section className="rounded-xl border border-steel-200 bg-white p-5 shadow-sm dark:border-steel-800 dark:bg-steel-900/80">
          {isLoading ? (
            <div className="py-10 text-center text-steel-500 dark:text-steel-400">
              Loading assets...
            </div>
          ) : isAdmin ? (
            assets.length === 0 ? (
              <div className="py-10 text-center text-steel-500 dark:text-steel-400">
                No assets have been added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {assets.map((asset) => (
                  <article
                    key={asset.id}
                    className="rounded-lg border border-steel-200 bg-steel-50/80 p-4 dark:border-steel-800 dark:bg-steel-950/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-steel-900 dark:text-steel-50">
                          {asset.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-steel-600 dark:text-steel-400">
                          <span>Total: {asset.quantity}</span>
                          <span>Assigned: {asset.assignedQuantity}</span>
                          <span>Available: {asset.availableQuantity}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {asset.availableQuantity > 0 && staff.length > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setAssigningAsset(asset)}
                            icon={
                              <UserPlus
                                className="size-4"
                                aria-hidden="true"
                              />
                            }
                          >
                            Assign
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={asset.assignedQuantity > 0}
                          title={
                            asset.assignedQuantity > 0
                              ? "Assets that have been assigned cannot be deleted."
                              : "Delete asset"
                          }
                          onClick={() => setDeletingAsset(asset)}
                          icon={
                            <Trash2 className="size-4" aria-hidden="true" />
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    {asset.assignments.length > 0 && (
                      <div className="mt-4 border-t border-steel-200 pt-3 dark:border-steel-800">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
                          Assigned to
                        </h3>
                        <ul className="space-y-2">
                          {[...asset.assignments
                            .reduce((grouped, assignment) => {
                              const existing = grouped.get(assignment.staffId);
                              if (existing) {
                                existing.quantity += assignment.quantity;
                              } else {
                                grouped.set(assignment.staffId, {
                                  ...assignment,
                                });
                              }
                              return grouped;
                            }, new Map<string, (typeof asset.assignments)[number]>())
                            .values()].map((assignment) => (
                            <li
                              key={assignment.staffId}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 text-sm text-steel-700 dark:bg-steel-900 dark:text-steel-300"
                            >
                              <span>
                                {assignment.staffName}: {assignment.quantity}
                              </span>
                              <span className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() =>
                                    setReassigning({
                                      asset,
                                      staffId: assignment.staffId,
                                      staffName: assignment.staffName,
                                      quantity: assignment.quantity,
                                    })
                                  }
                                  icon={
                                    <ArrowRightLeft
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  }
                                >
                                  Reassign
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() =>
                                    setRemovingAssignment({
                                      asset,
                                      staffId: assignment.staffId,
                                      staffName: assignment.staffName,
                                      quantity: assignment.quantity,
                                    })
                                  }
                                  icon={
                                    <Trash2
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  }
                                >
                                  Remove
                                </Button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {asset.releaseRequests.length > 0 && (
                      <div className="mt-4 border-t border-steel-200 pt-3 dark:border-steel-800">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">
                          Release requests
                        </h3>
                        <ul className="space-y-2">
                          {asset.releaseRequests.map((request) => (
                            <li
                              key={request.id}
                              className="rounded-md bg-white px-3 py-3 text-sm text-steel-700 dark:bg-steel-900 dark:text-steel-300"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold">
                                    {request.staffName} requested release of{" "}
                                    {request.quantity} {asset.name}
                                    <span
                                      className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        request.status === "PENDING"
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
                                          : request.status === "APPROVED"
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                                            : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                                      }`}
                                    >
                                      {request.status.toLowerCase()}
                                    </span>
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-steel-500 dark:text-steel-400">
                                    Note: {request.note}
                                  </p>
                                  <p className="mt-1 text-xs text-steel-400">
                                    Requested{" "}
                                    {new Date(
                                      request.createdAt,
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                {request.status === "PENDING" && (
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      disabled={isSaving}
                                      onClick={() =>
                                        setReviewingRelease({
                                          asset,
                                          request,
                                          status: "APPROVED",
                                        })
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      disabled={isSaving}
                                      onClick={() =>
                                        setReviewingRelease({
                                          asset,
                                          request,
                                          status: "REJECTED",
                                        })
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )
          ) : myAssets.length === 0 ? (
            <div className="py-10 text-center text-steel-500 dark:text-steel-400">
              No assets have been assigned to you.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myAssets.map((asset) => (
                <article
                  key={asset.id}
                  className="rounded-lg border border-steel-200 bg-steel-50/80 p-4 dark:border-steel-800 dark:bg-steel-950/60"
                >
                  <h2 className="font-semibold text-steel-900 dark:text-steel-50">
                    {asset.name}
                  </h2>
                  <p className="mt-2 text-sm text-steel-600 dark:text-steel-400">
                    Quantity: {asset.quantity}
                  </p>
                  {asset.releaseRequests.length > 0 && (
                    <ul className="mt-3 space-y-2 border-t border-steel-200 pt-3 dark:border-steel-800">
                      {asset.releaseRequests.map((request) => (
                        <li
                          key={request.id}
                          className="text-sm text-steel-600 dark:text-steel-400"
                        >
                          <span className="font-medium">
                            {request.quantity} requested release
                          </span>
                          <span className="ml-2 rounded-full bg-steel-100 px-2 py-0.5 text-xs dark:bg-steel-800">
                            {request.status.toLowerCase()}
                          </span>
                          <p className="mt-1 whitespace-pre-wrap text-xs">
                            Note: {request.note}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {asset.quantity > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4 w-full"
                      disabled={
                        asset.quantity -
                          asset.releaseRequests
                            .filter((request) => request.status === "PENDING")
                            .reduce(
                              (total, request) => total + request.quantity,
                              0,
                            ) <=
                        0
                      }
                      onClick={() => setReleasingAsset(asset)}
                      icon={
                        <RotateCcw className="size-4" aria-hidden="true" />
                      }
                    >
                      {asset.quantity -
                        asset.releaseRequests
                          .filter((request) => request.status === "PENDING")
                          .reduce(
                            (total, request) => total + request.quantity,
                            0,
                          ) <=
                      0
                        ? "Release request pending"
                        : "Request release"}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add employee asset"
        description="Add stock available for assignment. No photos are required."
      >
        <form className="space-y-4" onSubmit={(event) => void createAsset(event)}>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Asset name
            <input
              name="name"
              required
              maxLength={120}
              className={inputClasses}
              placeholder="e.g. Safety helmet"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Total quantity
            <input
              name="quantity"
              type="number"
              required
              min={1}
              max={100000}
              step={1}
              className={inputClasses}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Add asset
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={releasingAsset !== null}
        onClose={() => setReleasingAsset(null)}
        title={`Request release: ${releasingAsset?.name ?? "asset"}`}
        description="Submit the quantity you want to return and a note for the administrator."
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void requestAssetRelease(event)}
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Quantity to release
            <input
              name="quantity"
              type="number"
              required
              min={1}
              max={
                releasingAsset
                  ? releasingAsset.quantity -
                    releasingAsset.releaseRequests
                      .filter((request) => request.status === "PENDING")
                      .reduce((total, request) => total + request.quantity, 0)
                  : 1
              }
              step={1}
              defaultValue={1}
              className={inputClasses}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Note
            <textarea
              name="note"
              required
              maxLength={1000}
              rows={4}
              className={inputClasses}
              placeholder="Explain why you are returning this asset."
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReleasingAsset(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Send request
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={assigningAsset !== null}
        onClose={() => setAssigningAsset(null)}
        title={`Assign ${assigningAsset?.name ?? "asset"}`}
        description={`Available quantity: ${assigningAsset?.availableQuantity ?? 0}`}
      >
        <form className="space-y-4" onSubmit={(event) => void assignAsset(event)}>
          <Select
            name="staffId"
            label="Employee"
            options={staff.map((member) => ({
              value: member.id,
              label: `${member.fullName} (${member.email})`,
            }))}
            placeholder="Select an employee"
            required
          />
          <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-steel-600 dark:text-steel-400">
            Quantity
            <input
              name="quantity"
              type="number"
              required
              min={1}
              max={assigningAsset?.availableQuantity ?? 1}
              step={1}
              defaultValue={1}
              className={inputClasses}
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAssigningAsset(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Assign asset
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={reassigning !== null}
        onClose={() => setReassigning(null)}
        title={`Reassign ${reassigning?.asset.name ?? "asset"}`}
        description={`${reassigning?.quantity ?? 0} assigned to ${reassigning?.staffName ?? "employee"} will be moved to another employee.`}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => void reassignAsset(event)}
        >
          <Select
            name="newStaffId"
            label="Reassign to employee"
            options={staff
              .filter((member) => member.id !== reassigning?.staffId)
              .map((member) => ({
                value: member.id,
                label: `${member.fullName} (${member.email})`,
              }))}
            placeholder="Select an employee"
            required
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReassigning(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Reassign
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={reviewingRelease !== null}
        title={`${
          reviewingRelease?.status === "APPROVED" ? "Approve" : "Reject"
        } asset release request?`}
        description={
          reviewingRelease
            ? `${reviewingRelease.request.quantity} ${reviewingRelease.asset.name} requested by ${reviewingRelease.request.staffName}. Note: ${reviewingRelease.request.note}${
                reviewingRelease.status === "APPROVED"
                  ? " The quantity will be returned to available inventory."
                  : ""
              }`
            : ""
        }
        confirmLabel={
          reviewingRelease?.status === "APPROVED" ? "Approve request" : "Reject request"
        }
        isLoading={isSaving}
        onCancel={() => setReviewingRelease(null)}
        onConfirm={() => void reviewReleaseRequest()}
      />

      <ConfirmDialog
        open={removingAssignment !== null}
        title="Remove asset from employee?"
        description={`${removingAssignment?.quantity ?? 0} ${removingAssignment?.asset.name ?? "asset"} will be removed from ${removingAssignment?.staffName ?? "this employee"} and returned to available stock.`}
        confirmLabel="Remove assignment"
        isLoading={isSaving}
        onCancel={() => setRemovingAssignment(null)}
        onConfirm={() => void removeAssignment()}
      />

      <ConfirmDialog
        open={deletingAsset !== null}
        title="Delete asset?"
        description={`${deletingAsset?.name ?? "This asset"} will be removed from inventory. Assigned assets cannot be deleted.`}
        isLoading={isSaving}
        onCancel={() => setDeletingAsset(null)}
        onConfirm={() => void deleteAsset()}
      />
    </AppLayout>
  );
}
