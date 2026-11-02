import { asyncHandler } from "../../../shared/helpers/async-handler";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { successResponse } from "../../../shared/response/response.helper";
import {
  confirmBulkInvitations,
  createUserTemplate,
  inviteUser,
  previewBulkInvitations,
} from "../services/user-invitation.service";

export const inviteUserController = asyncHandler(async (req, res) => {
  await inviteUser(req.body, req.user.id);
  return res
    .status(201)
    .json(successResponse(null, "Invitation sent successfully."));
});

export const previewBulkInvitationsController = asyncHandler(
  async (req, res) => {
    if (!req.file || !req.file.originalname.toLowerCase().endsWith(".xlsx")) {
      throw new BadRequestError("Upload an .xlsx Excel file.");
    }

    const rows = await previewBulkInvitations(req.file.buffer);
    return res.json(
      successResponse(rows, "User spreadsheet preview created successfully."),
    );
  },
);

export const confirmBulkInvitationsController = asyncHandler(
  async (req, res) => {
    const rows = await confirmBulkInvitations(req.body.rows, req.user.id);
    return res.json(
      successResponse(rows, "Bulk user invitations processed."),
    );
  },
);

export const downloadUserTemplateController = asyncHandler(
  async (_req, res) => {
    const buffer = await createUserTemplate();
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="user-import-template.xlsx"',
    );
    return res.send(buffer);
  },
);
