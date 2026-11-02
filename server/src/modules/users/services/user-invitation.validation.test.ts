import assert from "node:assert/strict";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { inviteUserSchema } from "../validations/invite-user.validation";
import { buildUserInvitationTemplate } from "../../../shared/email/templates/user-invitation.template";
import { createUserTemplate } from "./user-invitation.service";
import {
  resolveUserRole,
  validateBulkUserRows,
} from "./user-invitation.validation";

test("resolves canonical role values without accepting mismatched labels", () => {
  assert.deepEqual(resolveUserRole("2 - Customer"), {
    roleId: 2,
    roleLabel: "Customer",
  });
  assert.deepEqual(resolveUserRole("3 - Employee"), {
    roleId: 3,
    roleLabel: "Staff (Employee)",
  });
  assert.deepEqual(resolveUserRole("3 - Staff (Employee)"), {
    roleId: 3,
    roleLabel: "Staff (Employee)",
  });
  assert.equal(resolveUserRole("2 - Employee"), null);
  assert.deepEqual(resolveUserRole("Customer"), {
    roleId: 2,
    roleLabel: "Customer",
  });
});

test("validates email, role, existing accounts, and duplicate spreadsheet rows", () => {
  const rows = validateBulkUserRows(
    [
      {
        rowNumber: 2,
        fullName: "Valid User",
        email: "valid@example.com",
        role: "2",
      },
      {
        rowNumber: 3,
        fullName: "Existing User",
        email: "taken@example.com",
        role: "3 - Staff (Employee)",
      },
      {
        rowNumber: 4,
        fullName: "Duplicate One",
        email: "duplicate@example.com",
        role: "Admin",
      },
      {
        rowNumber: 5,
        fullName: "Duplicate Two",
        email: "DUPLICATE@example.com",
        role: "1",
      },
      {
        rowNumber: 6,
        fullName: "Invalid User",
        email: "not-an-email",
        role: "2 - Employee",
      },
    ],
    new Set(["taken@example.com"]),
  );

  assert.equal(rows[0].status, "valid");
  assert.equal(rows[0].roleId, 2);
  assert.equal(rows[1].errors[0], "Email already exists in the system.");
  assert.ok(rows[2].errors.includes("Email appears more than once in this file."));
  assert.ok(rows[3].errors.includes("Email appears more than once in this file."));
  assert.ok(rows[4].errors.includes("Email address is not valid."));
  assert.ok(rows[4].errors.some((error) => error.startsWith("Role is invalid.")));
});

test("normalizes the single-invite email and enforces known role IDs", () => {
  assert.deepEqual(
    inviteUserSchema.parse({
      fullName: "Valid User",
      email: "  VALID@example.com ",
      roleId: 3,
    }),
    {
      fullName: "Valid User",
      email: "VALID@example.com",
      roleId: 3,
    },
  );
  assert.throws(() =>
    inviteUserSchema.parse({
      fullName: "Valid User",
      email: "valid@example.com",
      roleId: 4,
    }),
  );
});

test("generates an Excel template with fixed columns and role guidance", async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await createUserTemplate());

  const usersSheet = workbook.getWorksheet("Users");
  const guideSheet = workbook.getWorksheet("Role Guide");
  assert.ok(usersSheet);
  assert.ok(guideSheet);
  assert.deepEqual(
    [1, 2, 3].map((column) => usersSheet.getCell(1, column).text),
    ["name", "email", "role"],
  );
  assert.equal(
    usersSheet.getCell("C2").dataValidation.formulae[0],
    '"1 - Admin,2 - Customer,3 - Staff (Employee)"',
  );
  assert.equal(guideSheet.getCell("A3").text, "2 - Customer");
  assert.equal(guideSheet.getCell("A4").text, "3 - Staff (Employee)");
});

test("renders invitation email using IMS branding and escapes dynamic content", () => {
  const html = buildUserInvitationTemplate({
    userName: "<Sam & Co>",
    setupLink: "https://example.com/set-password?token=abc&source=invite",
  });

  assert.match(html, /#0e2a44/);
  assert.match(html, /#f0a93a/);
  assert.match(html, /Set your password/);
  assert.match(html, /expires in <strong>12 hours<\/strong>/);
  assert.match(html, /&lt;Sam &amp; Co&gt;/);
  assert.match(html, /token=abc&amp;source=invite/);
});
