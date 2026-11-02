import bcrypt from "bcrypt";
import { Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import { Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import {
  generateSecureToken,
  hashToken,
} from "../../../shared/helpers/token.helper";
import { logger } from "../../../shared/helpers/logger";
import { mailService } from "../../../shared/email/mail.service";
import { buildUserInvitationTemplate } from "../../../shared/email/templates/user-invitation.template";
import { BCRYPT_SALT_ROUNDS } from "../constants/user.constants";
import UserModel from "../schemas/user.schema";
import {
  BulkUserPreviewRow,
  RawBulkUserRow,
  validateBulkUserRows,
} from "./user-invitation.validation";

const INVITATION_EXPIRY_HOURS = 12;
const MAX_BULK_USERS = 20;
const roleOptions = ["2 - Customer", "3 - Staff (Employee)"];

const toArrayBuffer = (bytes: Buffer): ArrayBuffer => {
  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  return arrayBuffer;
};

const toCellText = (cell: ExcelJS.Cell): string => cell.text.trim();

export const createUserTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Users");
  worksheet.columns = [
    { header: "name", key: "name", width: 30 },
    { header: "email", key: "email", width: 36 },
    { header: "role", key: "role", width: 30 },
  ];
  worksheet.getRow(1).font = { bold: true };
  for (let rowNumber = 2; rowNumber <= 21; rowNumber += 1) {
    worksheet.getCell(rowNumber, 3).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${roleOptions.join(",")}"`],
      showErrorMessage: true,
      errorTitle: "Invalid role",
      error: "Select one of the listed role values.",
    };
  }

  const guide = workbook.addWorksheet("Role Guide");
  guide.addRows([
    ["Role value", "Role ID", "Meaning"],

    [roleOptions[0], 2, "Customer"],
    [roleOptions[1], 3, "Staff / Employee"],
  ]);
  guide.getRow(1).font = { bold: true };
  guide.columns = [{ width: 30 }, { width: 12 }, { width: 28 }];
  guide.addRow([]);
  guide.addRow([
    "Use the exact role value shown in the Users sheet. Role ID 2 is Customer; role ID 3 is Staff/Employee.",
  ]);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

const parseWorkbook = async (buffer: Buffer): Promise<RawBulkUserRow[]> => {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(toArrayBuffer(buffer));
  } catch {
    throw new BadRequestError(
      "The uploaded file is not a valid .xlsx workbook.",
    );
  }
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new BadRequestError("The Excel file does not contain a worksheet.");
  }

  const headers = [1, 2, 3].map((column) =>
    toCellText(worksheet.getRow(1).getCell(column)).toLowerCase(),
  );
  if (headers.join(",") !== "name,email,role") {
    throw new BadRequestError(
      "The first worksheet must have the columns name, email, role in that order.",
    );
  }

  const rows: RawBulkUserRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = [1, 2, 3].map((column) => toCellText(row.getCell(column)));
    if (values.every((value) => !value)) return;
    rows.push({
      rowNumber,
      fullName: values[0],
      email: values[1],
      role: values[2],
    });
  });

  if (!rows.length) {
    throw new BadRequestError("The Excel file does not contain any user rows.");
  }
  if (rows.length > MAX_BULK_USERS) {
    throw new BadRequestError(
      `The Excel file can contain at most ${MAX_BULK_USERS} users.`,
    );
  }
  return rows;
};

const findExistingEmails = async (emails: string[]): Promise<Set<string>> => {
  if (!emails.length) return new Set();
  const users = await UserModel.find({ email: { $in: emails } })
    .select("email")
    .lean();
  return new Set(users.map((user) => user.email.toLowerCase()));
};

const issueInvitation = async (
  user: {
    fullName: string;
    email: string;
    roleId: number;
  },
  createdBy: string,
): Promise<void> => {
  const token = generateSecureToken();
  const password = await bcrypt.hash(generateSecureToken(), BCRYPT_SALT_ROUNDS);
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000,
  );
  let createdUser;
  try {
    createdUser = await UserModel.create({
      fullName: user.fullName.trim(),
      email: user.email.trim().toLowerCase(),
      roleId: user.roleId,
      password,
      isActive: false,
      activationToken: hashToken(token),
      activationExpiresAt: expiresAt,
      createdBy: new Types.ObjectId(createdBy),
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new ConflictError("Email already exists in the system.");
    }
    throw error;
  }

  try {
    const setupLink = `${process.env.CLIENT_URL}/set-password?token=${token}`;
    await mailService.send({
      to: createdUser.email,
      subject: "Set up your Industry Management System account",
      html: buildUserInvitationTemplate({
        userName: createdUser.fullName,
        setupLink,
      }),
    });
  } catch (error) {
    logger.error(`Failed to send user invitation: ${error}`);
    await UserModel.deleteOne({ _id: createdUser._id });
    throw new Error("Invitation email could not be sent.");
  }
};

export const inviteUser = async (
  user: { fullName: string; email: string; roleId: number },
  createdBy: string,
): Promise<void> => {
  const email = user.email.trim().toLowerCase();
  const existingUser = await UserModel.findOne({ email }).select("_id");
  if (existingUser)
    throw new ConflictError("Email already exists in the system.");

  await issueInvitation({ ...user, email }, createdBy);
};

export const previewBulkInvitations = async (
  file: Buffer,
): Promise<BulkUserPreviewRow[]> => {
  const rawRows = await parseWorkbook(file);
  const validEmails = rawRows
    .map((row) => row.email.trim().toLowerCase())
    .filter((email) => email.length > 0);
  const existingEmails = await findExistingEmails(validEmails);
  return validateBulkUserRows(rawRows, existingEmails);
};

export const confirmBulkInvitations = async (
  rows: Array<{
    rowNumber: number;
    fullName: string;
    email: string;
    roleId: number;
  }>,
  createdBy: string,
): Promise<BulkUserPreviewRow[]> => {
  if (!rows.length || rows.length > MAX_BULK_USERS) {
    throw new BadRequestError(`Provide between 1 and ${MAX_BULK_USERS} users.`);
  }
  const rawRows = rows.map((row) => ({
    rowNumber: row.rowNumber,
    fullName: row.fullName,
    email: row.email,
    role: String(row.roleId),
  }));
  const existingEmails = await findExistingEmails(
    rawRows.map((row) => row.email.trim().toLowerCase()),
  );
  const results = validateBulkUserRows(rawRows, existingEmails);

  for (const result of results) {
    if (result.status !== "valid" || result.roleId === null) continue;
    try {
      await issueInvitation(
        {
          fullName: result.fullName,
          email: result.email,
          roleId: result.roleId,
        },
        createdBy,
      );
      result.status = "created";
    } catch (error) {
      logger.error(`Failed to create bulk user invitation: ${error}`);
      result.status = "error";
      result.errors = [
        error instanceof Error ? error.message : "Could not create invitation.",
      ];
    }
  }
  return results;
};
