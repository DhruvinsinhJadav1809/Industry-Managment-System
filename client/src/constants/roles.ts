export const ROLES = {
  ADMIN: 1,
  CUSTOMER: 2,
  STAFF: 3,
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<number, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.CUSTOMER]: "Customer",
  [ROLES.STAFF]: "Staff",
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([id, label]) => ({
  id: Number(id),
  label,
}));
