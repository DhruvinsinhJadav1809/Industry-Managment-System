import { Types } from "mongoose";
import { BadRequestError } from "../../../shared/errors/bad-request.error";
import { ConflictError } from "../../../shared/errors/conflict.error";
import { NotFoundError } from "../../../shared/errors/not-found.error";
import { logger } from "../../../shared/helpers/logger";
import { UserRole } from "../../../shared/enums/user-role.enum";
import { NotificationType } from "../../notification/enums/notification-type.enum";
import * as notificationService from "../../notification/services/notification.service";
import UserModel from "../../users/schemas/user.schema";
import {
  AssignEmployeeAssetDto,
  CreateEmployeeAssetReleaseRequestDto,
  CreateEmployeeAssetDto,
  ReassignEmployeeAssetDto,
  ReviewEmployeeAssetReleaseRequestDto,
} from "./employee-asset.dto";
import EmployeeAssetModel from "./employee-asset.schema";
import {
  EmployeeAssetDto,
  EmployeeAssetReleaseRequestDto,
  IEmployeeAsset,
  IEmployeeAssetReleaseRequest,
  MyEmployeeAssetDto,
} from "./employee-asset.types";

type EmployeeAssetRecord = IEmployeeAsset & { _id: Types.ObjectId };
type UserNameRecord = { _id: Types.ObjectId; fullName: string };
type UserIdRecord = { _id: Types.ObjectId };

const toReleaseRequestDto = (
  request: IEmployeeAssetReleaseRequest,
): EmployeeAssetReleaseRequestDto => ({
  id: request._id.toString(),
  staffId: request.staffId.toString(),
  staffName: request.staffName,
  quantity: request.quantity,
  note: request.note,
  status: request.status,
  createdAt: request.createdAt,
  reviewedByName: request.reviewedByName,
  reviewedAt: request.reviewedAt,
});

const getStaffNames = async (staffIds: Types.ObjectId[]) => {
  const uniqueIds = [...new Set(staffIds.map((id) => id.toString()))];
  if (uniqueIds.length === 0) return new Map<string, string>();
  const staff = await UserModel.find({ _id: { $in: uniqueIds } })
    .select("_id fullName")
    .lean<UserNameRecord[]>();
  return new Map(staff.map((member) => [member._id.toString(), member.fullName]));
};

const toAssetDto = (
  asset: EmployeeAssetRecord,
  staffNames: Map<string, string>,
): EmployeeAssetDto => {
  const assignments = asset.assignments.map((assignment) => ({
    staffId: assignment.staffId.toString(),
    staffName: staffNames.get(assignment.staffId.toString()) ?? "Former employee",
    quantity: assignment.quantity,
    assignedAt: assignment.assignedAt,
  }));
  const releaseRequests = (asset.releaseRequests ?? []).map(
    toReleaseRequestDto,
  );
  const assignedQuantity = assignments.reduce(
    (total, assignment) => total + assignment.quantity,
    0,
  );

  return {
    id: asset._id.toString(),
    name: asset.name,
    quantity: asset.quantity,
    assignedQuantity,
    availableQuantity: asset.quantity - assignedQuantity,
    assignments,
    releaseRequests,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
};

const getAssetDto = async (asset: EmployeeAssetRecord) => {
  const names = await getStaffNames(
    asset.assignments.map((assignment) => assignment.staffId),
  );
  return toAssetDto(asset, names);
};

const ensureActiveEmployee = async (staffId: string) => {
  const staff = await UserModel.findOne({
    _id: staffId,
    roleId: UserRole.Employee,
    isActive: true,
    isDeleted: false,
  }).select("_id");
  if (!staff) throw new NotFoundError("Active employee not found.");
  return staff;
};

export const getAssets = async (): Promise<EmployeeAssetDto[]> => {
  const assets = await EmployeeAssetModel.find({ isDeleted: false })
    .sort({ name: 1 })
    .lean<EmployeeAssetRecord[]>();
  const staffIds = assets.flatMap((asset) =>
    [
      ...asset.assignments.map((assignment) => assignment.staffId),
      ...(asset.releaseRequests ?? []).map((request) => request.staffId),
    ],
  );
  const staffNames = await getStaffNames(staffIds);
  return assets.map((asset) => toAssetDto(asset, staffNames));
};

export const getMyAssets = async (
  staffId: string,
): Promise<MyEmployeeAssetDto[]> => {
  const staffObjectId = new Types.ObjectId(staffId);
  const assets = await EmployeeAssetModel.find({
    isDeleted: false,
    $or: [
      { "assignments.staffId": staffObjectId },
      { "releaseRequests.staffId": staffObjectId },
    ],
  })
    .sort({ name: 1 })
    .lean<EmployeeAssetRecord[]>();

  return assets.flatMap((asset) => {
    const quantity = asset.assignments
      .filter((assignment) => assignment.staffId.equals(staffObjectId))
      .reduce((total, assignment) => total + assignment.quantity, 0);
    const releaseRequests = (asset.releaseRequests ?? [])
      .filter((request) => request.staffId.equals(staffObjectId))
      .map(toReleaseRequestDto);
    return quantity > 0 || releaseRequests.length > 0
      ? [
          {
            id: asset._id.toString(),
            name: asset.name,
            quantity,
            releaseRequests,
          },
        ]
      : [];
  });
};

const assignedQuantityExpression = (staffId: Types.ObjectId) => ({
  $sum: {
    $map: {
      input: {
        $filter: {
          input: { $ifNull: ["$assignments", []] },
          as: "assignment",
          cond: { $eq: ["$$assignment.staffId", { $literal: staffId }] },
        },
      },
      as: "assignment",
      in: "$$assignment.quantity",
    },
  },
});

const pendingReleaseQuantityExpression = (staffId: Types.ObjectId) => ({
  $sum: {
    $map: {
      input: {
        $filter: {
          input: { $ifNull: ["$releaseRequests", []] },
          as: "request",
          cond: {
            $and: [
              { $eq: ["$$request.staffId", { $literal: staffId }] },
              { $eq: ["$$request.status", "PENDING"] },
            ],
          },
        },
      },
      as: "request",
      in: "$$request.quantity",
    },
  },
});

export const createAssetReleaseRequest = async (
  assetId: string,
  data: CreateEmployeeAssetReleaseRequestDto,
  staffId: string,
  staffName: string,
) => {
  const staffObjectId = new Types.ObjectId(staffId);
  const requestId = new Types.ObjectId();
  const createdAt = new Date();
  const releaseRequest: IEmployeeAssetReleaseRequest = {
    _id: requestId,
    staffId: staffObjectId,
    staffName,
    quantity: data.quantity,
    note: data.note.trim(),
    status: "PENDING",
    createdAt,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
  };
  const asset = await EmployeeAssetModel.findOneAndUpdate(
    {
      _id: assetId,
      isDeleted: false,
      $expr: {
        $gte: [
          {
            $subtract: [
              assignedQuantityExpression(staffObjectId),
              pendingReleaseQuantityExpression(staffObjectId),
            ],
          },
          data.quantity,
        ],
      },
    },
    { $push: { releaseRequests: releaseRequest } },
    { new: true, runValidators: true },
  ).lean<EmployeeAssetRecord | null>();

  if (!asset) {
    const exists = await EmployeeAssetModel.exists({
      _id: assetId,
      isDeleted: false,
    });
    if (!exists) throw new NotFoundError("Asset not found.");
    throw new BadRequestError(
      "The requested quantity exceeds your unrequested assigned quantity.",
    );
  }

  try {
    const admins = await UserModel.find({
      roleId: UserRole.Admin,
      isActive: true,
      isDeleted: false,
    })
      .select("_id")
      .lean<UserIdRecord[]>();
    if (admins.length > 0) {
      await notificationService.send({
        title: "Asset release request",
        message: `${staffName} requested to release ${data.quantity} ${asset.name}.`,
        type: NotificationType.ASSET_RELEASE,
        recipients: admins.map((admin) => admin._id.toString()),
        metadata: { assetId, requestId: requestId.toString() },
        actionUrl: "/staff/assets",
        createdBy: staffId,
      });
    }
  } catch (error) {
    logger.warn(
      `Asset release request was saved, but admin notification failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return toReleaseRequestDto(releaseRequest);
};

const reduceAssignmentQuantity = (
  staffId: Types.ObjectId,
  quantity: number,
) => ({
  $let: {
    vars: {
      reduced: {
        $reduce: {
          input: { $ifNull: ["$assignments", []] },
          initialValue: { remaining: quantity, assignments: [] },
          in: {
            $let: {
              vars: {
                released: {
                  $cond: [
                    {
                      $and: [
                        {
                          $eq: [
                            "$$this.staffId",
                            { $literal: staffId },
                          ],
                        },
                        { $gt: ["$$value.remaining", 0] },
                      ],
                    },
                    { $min: ["$$this.quantity", "$$value.remaining"] },
                    0,
                  ],
                },
              },
              in: {
                remaining: {
                  $subtract: ["$$value.remaining", "$$released"],
                },
                assignments: {
                  $concatArrays: [
                    "$$value.assignments",
                    {
                      $cond: [
                        {
                          $eq: [
                            "$$this.staffId",
                            { $literal: staffId },
                          ],
                        },
                        {
                          $cond: [
                            {
                              $gt: [
                                {
                                  $subtract: [
                                    "$$this.quantity",
                                    "$$released",
                                  ],
                                },
                                0,
                              ],
                            },
                            [
                              {
                                $mergeObjects: [
                                  "$$this",
                                  {
                                    quantity: {
                                      $subtract: [
                                        "$$this.quantity",
                                        "$$released",
                                      ],
                                    },
                                  },
                                ],
                              },
                            ],
                            [],
                          ],
                        },
                        ["$$this"],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    in: "$$reduced.assignments",
  },
});

export const reviewAssetReleaseRequest = async (
  assetId: string,
  requestId: string,
  data: ReviewEmployeeAssetReleaseRequestDto,
  reviewerId: string,
  reviewerName: string,
) => {
  const assetObjectId = new Types.ObjectId(assetId);
  const requestObjectId = new Types.ObjectId(requestId);
  const existingAsset = await EmployeeAssetModel.findOne({
    _id: assetObjectId,
    isDeleted: false,
  }).lean<EmployeeAssetRecord | null>();
  if (!existingAsset) throw new NotFoundError("Asset not found.");

  const request = (existingAsset.releaseRequests ?? []).find((item) =>
    item._id.equals(requestObjectId),
  );
  if (!request) throw new NotFoundError("Asset release request not found.");
  if (request.status !== "PENDING")
    throw new ConflictError("This asset release request has already been reviewed.");

  const staffObjectId = request.staffId;
  const now = new Date();
  const filter: Record<string, unknown> = {
    _id: assetObjectId,
    isDeleted: false,
    releaseRequests: {
      $elemMatch: { _id: requestObjectId, status: "PENDING" },
    },
  };
  if (data.status === "APPROVED") {
    filter.$expr = {
      $gte: [assignedQuantityExpression(staffObjectId), request.quantity],
    };
  }

  const updatedAsset = await EmployeeAssetModel.findOneAndUpdate(
    filter,
    [
      {
        $set: {
          ...(data.status === "APPROVED"
            ? {
                assignments: reduceAssignmentQuantity(
                  staffObjectId,
                  request.quantity,
                ),
              }
            : {}),
          releaseRequests: {
            $map: {
              input: { $ifNull: ["$releaseRequests", []] },
              as: "releaseRequest",
              in: {
                $cond: [
                  {
                    $and: [
                      {
                        $eq: [
                          "$$releaseRequest._id",
                          { $literal: requestObjectId },
                        ],
                      },
                      { $eq: ["$$releaseRequest.status", "PENDING"] },
                    ],
                  },
                  {
                    $mergeObjects: [
                      "$$releaseRequest",
                      {
                        status: data.status,
                        reviewedBy: { $literal: new Types.ObjectId(reviewerId) },
                        reviewedByName: { $literal: reviewerName },
                        reviewedAt: { $literal: now },
                      },
                    ],
                  },
                  "$$releaseRequest",
                ],
              },
            },
          },
          updatedAt: { $literal: now },
        },
      },
    ],
    { new: true, updatePipeline: true },
  ).lean<EmployeeAssetRecord | null>();

  if (!updatedAsset) {
    throw new ConflictError(
      "The asset assignment changed before this request could be reviewed. Refresh and retry.",
    );
  }

  const reviewedRequest = (updatedAsset.releaseRequests ?? []).find((item) =>
    item._id.equals(requestObjectId),
  );
  if (!reviewedRequest)
    throw new NotFoundError("Asset release request not found.");
  const result = toReleaseRequestDto(reviewedRequest);

  try {
    await notificationService.send({
      title: `Asset release request ${data.status.toLowerCase()}`,
      message: `Your request to release ${request.quantity} ${existingAsset.name} was ${data.status.toLowerCase()}.`,
      type: NotificationType.ASSET_RELEASE,
      recipients: [request.staffId.toString()],
      metadata: { assetId, requestId },
      actionUrl: "/staff/assets",
      createdBy: reviewerId,
    });
  } catch (error) {
    logger.warn(
      `Asset release request was reviewed, but employee notification failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return result;
};

export const createAsset = async (
  data: CreateEmployeeAssetDto,
  currentUserId: string,
): Promise<EmployeeAssetDto> => {
  const asset = await EmployeeAssetModel.create({
    name: data.name,
    quantity: data.quantity,
    createdBy: new Types.ObjectId(currentUserId),
  });
  return getAssetDto(asset.toObject() as EmployeeAssetRecord);
};

export const assignAsset = async (
  assetId: string,
  data: AssignEmployeeAssetDto,
  currentUserId: string,
): Promise<EmployeeAssetDto> => {
  await ensureActiveEmployee(data.staffId);

  const asset = await EmployeeAssetModel.findOneAndUpdate(
    {
      _id: assetId,
      isDeleted: false,
      $expr: {
        $gte: [
          {
            $subtract: [
              "$quantity",
              { $sum: { $ifNull: ["$assignments.quantity", []] } },
            ],
          },
          data.quantity,
        ],
      },
    },
    {
      $push: {
        assignments: {
          staffId: new Types.ObjectId(data.staffId),
          quantity: data.quantity,
          assignedBy: new Types.ObjectId(currentUserId),
          assignedAt: new Date(),
        },
      },
    },
    { new: true, runValidators: true },
  ).lean<EmployeeAssetRecord>();

  if (!asset) {
    const exists = await EmployeeAssetModel.exists({
      _id: assetId,
      isDeleted: false,
    });
    if (!exists) throw new NotFoundError("Asset not found.");
    throw new BadRequestError("Not enough unassigned quantity available.");
  }

  return getAssetDto(asset);
};

export const reassignAsset = async (
  assetId: string,
  staffId: string,
  data: ReassignEmployeeAssetDto,
  currentUserId: string,
): Promise<EmployeeAssetDto> => {
  if (staffId === data.newStaffId)
    throw new BadRequestError("Choose a different employee to reassign this asset.");

  await ensureActiveEmployee(data.newStaffId);

  const sourceStaffId = new Types.ObjectId(staffId);
  const newStaffId = new Types.ObjectId(data.newStaffId);
  const pendingRequest = await EmployeeAssetModel.exists({
    _id: assetId,
    isDeleted: false,
    releaseRequests: {
      $elemMatch: { staffId: sourceStaffId, status: "PENDING" },
    },
  });
  if (pendingRequest)
    throw new ConflictError(
      "Review the employee's pending asset release requests before reassigning.",
    );
  const now = new Date();
  const asset = await EmployeeAssetModel.findOneAndUpdate(
    {
      _id: assetId,
      isDeleted: false,
      "assignments.staffId": sourceStaffId,
      releaseRequests: {
        $not: {
          $elemMatch: { staffId: sourceStaffId, status: "PENDING" },
        },
      },
    },
    [
      {
        $set: {
          assignments: {
            $let: {
              vars: {
                sourceQuantity: {
                  $reduce: {
                    input: {
                      $filter: {
                        input: "$assignments",
                        as: "assignment",
                        cond: {
                          $eq: ["$$assignment.staffId", sourceStaffId],
                        },
                      },
                    },
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.quantity"] },
                  },
                },
              },
              in: {
                $concatArrays: [
                  {
                    $filter: {
                      input: "$assignments",
                      as: "assignment",
                      cond: {
                        $ne: ["$$assignment.staffId", sourceStaffId],
                      },
                    },
                  },
                  [
                    {
                      staffId: { $literal: newStaffId },
                      quantity: "$$sourceQuantity",
                      assignedAt: { $literal: now },
                      assignedBy: {
                        $literal: new Types.ObjectId(currentUserId),
                      },
                    },
                  ],
                ],
              },
            },
          },
          updatedAt: { $literal: now },
        },
      },
    ],
    { new: true, updatePipeline: true },
  ).lean<EmployeeAssetRecord>();

  if (!asset) {
    const exists = await EmployeeAssetModel.exists({
      _id: assetId,
      isDeleted: false,
      "assignments.staffId": sourceStaffId,
    });
    if (!exists) throw new NotFoundError("Employee asset assignment not found.");
    throw new ConflictError("Asset assignment could not be reassigned.");
  }

  return getAssetDto(asset);
};

export const removeAssetAssignment = async (
  assetId: string,
  staffId: string,
): Promise<EmployeeAssetDto> => {
  const staffObjectId = new Types.ObjectId(staffId);
  const pendingRequest = await EmployeeAssetModel.exists({
    _id: assetId,
    isDeleted: false,
    releaseRequests: {
      $elemMatch: { staffId: staffObjectId, status: "PENDING" },
    },
  });
  if (pendingRequest)
    throw new ConflictError(
      "Review the employee's pending asset release requests before removing the assignment.",
    );
  const asset = await EmployeeAssetModel.findOneAndUpdate(
    {
      _id: assetId,
      isDeleted: false,
      "assignments.staffId": staffObjectId,
      releaseRequests: {
        $not: {
          $elemMatch: { staffId: staffObjectId, status: "PENDING" },
        },
      },
    },
    { $pull: { assignments: { staffId: staffObjectId } } },
    { new: true },
  ).lean<EmployeeAssetRecord>();

  if (!asset) throw new NotFoundError("Employee asset assignment not found.");
  return getAssetDto(asset);
};

export const deleteAsset = async (assetId: string) => {
  const asset = await EmployeeAssetModel.findOneAndUpdate(
    { _id: assetId, isDeleted: false, assignments: { $size: 0 } },
    { $set: { isDeleted: true } },
    { new: true },
  );
  if (asset) return { id: asset._id.toString() };

  const existingAsset = await EmployeeAssetModel.findOne({
    _id: assetId,
    isDeleted: false,
  }).select("assignments");
  if (!existingAsset) throw new NotFoundError("Asset not found.");
  if (existingAsset.assignments.length > 0)
    throw new ConflictError("An asset with employee assignments cannot be deleted.");
  throw new ConflictError("Asset could not be deleted. Refresh and retry.");
};
