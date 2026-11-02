import { z } from "zod";
import { UserRole } from "../../../shared/enums/user-role.enum";

const roleLabels: Record<UserRole, string[]> = {
  [UserRole.Admin]: ["admin"],
  [UserRole.Customer]: ["customer"],
  [UserRole.Employee]: ["staff", "employee", "staff (employee)"],
};

const roleNames: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.Customer]: "Customer",
  [UserRole.Employee]: "Staff (Employee)",
};

export interface RawBulkUserRow {
  rowNumber: number;
  fullName: string;
  email: string;
  role: string;
}

export interface BulkUserPreviewRow {
  rowNumber: number;
  fullName: string;
  email: string;
  role: string;
  roleId: UserRole | null;
  roleLabel: string | null;
  status: "valid" | "error" | "created";
  errors: string[];
}

export const resolveUserRole = (
  value: string,
): { roleId: UserRole; roleLabel: string } | null => {
  const normalized = value.trim().toLowerCase();
  const idAndLabel = /^([2-3])\s*-\s*(.+)$/.exec(normalized);

  if (idAndLabel) {
    const roleId = Number(idAndLabel[1]) as UserRole;
    if (roleLabels[roleId].includes(idAndLabel[2].trim())) {
      return { roleId, roleLabel: roleNames[roleId] };
    }
    return null;
  }

  const roleId = Number(normalized);
  if (Number.isInteger(roleId) && roleId in roleNames) {
    return {
      roleId: roleId as UserRole,
      roleLabel: roleNames[roleId as UserRole],
    };
  }

  const matchingRole = (
    Object.entries(roleLabels) as [string, string[]][]
  ).find(([, labels]) => labels.includes(normalized));
  if (!matchingRole) return null;

  const matchedRoleId = Number(matchingRole[0]) as UserRole;
  return { roleId: matchedRoleId, roleLabel: roleNames[matchedRoleId] };
};

export const validateBulkUserRows = (
  rows: RawBulkUserRow[],
  existingEmails: Set<string> = new Set(),
): BulkUserPreviewRow[] => {
  const normalizedEmails = rows.map((row) => row.email.trim().toLowerCase());
  const emailCounts = new Map<string, number>();
  for (const email of normalizedEmails) {
    if (email) emailCounts.set(email, (emailCounts.get(email) ?? 0) + 1);
  }

  return rows.map((row, index) => {
    const fullName = row.fullName.trim();
    const email = normalizedEmails[index];
    const role = resolveUserRole(row.role);
    const errors: string[] = [];

    if (!z.string().min(3).max(100).safeParse(fullName).success) {
      errors.push("Name must be between 3 and 100 characters.");
    }
    if (!z.email().safeParse(email).success) {
      errors.push("Email address is not valid.");
    } else if (existingEmails.has(email)) {
      errors.push("Email already exists in the system.");
    } else if ((emailCounts.get(email) ?? 0) > 1) {
      errors.push("Email appears more than once in this file.");
    }
    if (!role) {
      errors.push(
        "Role is invalid. Use  2 - Customer, or 3 - Staff (Employee).",
      );
    }

    return {
      rowNumber: row.rowNumber,
      fullName,
      email,
      role: row.role.trim(),
      roleId: role?.roleId ?? null,
      roleLabel: role?.roleLabel ?? null,
      status: errors.length ? "error" : "valid",
      errors,
    };
  });
};
