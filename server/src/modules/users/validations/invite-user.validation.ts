import { z } from "zod";

const userRoleId = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const inviteUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters.")
    .max(100, "Full name cannot exceed 100 characters."),
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email("Please provide a valid email address.")),
  roleId: userRoleId,
});

export const confirmBulkInvitationsSchema = z.object({
  rows: z
    .array(
      z.object({
        rowNumber: z.number().int().positive(),
        fullName: z.string().max(100),
        email: z.string().max(254),
        roleId: userRoleId,
      }),
    )
    .min(1)
    .max(200),
});
