import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import * as notificationService from "../../notification/services/notification.service";
import UserModel from "../../users/schemas/user.schema";
import EmployeeAssetModel from "./employee-asset.schema";
import {
  createAssetReleaseRequest,
  reassignAsset,
  reviewAssetReleaseRequest,
} from "./employee-asset.service";

const originalFindOne = UserModel.findOne;
const originalFind = UserModel.find;
const originalExists = EmployeeAssetModel.exists;
const originalAssetFindOne = EmployeeAssetModel.findOne;
const originalFindOneAndUpdate = EmployeeAssetModel.findOneAndUpdate;
const originalNotificationSend = notificationService.send;

afterEach(() => {
  Object.defineProperty(UserModel, "findOne", {
    configurable: true,
    writable: true,
    value: originalFindOne,
  });
  Object.defineProperty(UserModel, "find", {
    configurable: true,
    writable: true,
    value: originalFind,
  });
  Object.defineProperty(EmployeeAssetModel, "exists", {
    configurable: true,
    writable: true,
    value: originalExists,
  });
  Object.defineProperty(EmployeeAssetModel, "findOne", {
    configurable: true,
    writable: true,
    value: originalAssetFindOne,
  });
  Object.defineProperty(EmployeeAssetModel, "findOneAndUpdate", {
    configurable: true,
    writable: true,
    value: originalFindOneAndUpdate,
  });
  Object.defineProperty(notificationService, "send", {
    configurable: true,
    writable: true,
    value: originalNotificationSend,
  });
});

test("reassigns an employee asset using an enabled update pipeline", async () => {
  const assetId = new Types.ObjectId();
  const previousStaffId = new Types.ObjectId();
  const nextStaffId = new Types.ObjectId();
  const adminId = new Types.ObjectId();
  const timestamp = new Date("2026-10-27T00:00:00.000Z");
  let updateFilter: Record<string, unknown> | undefined;
  let updatePipeline: unknown;
  let updateOptions: Record<string, unknown> | undefined;

  Object.defineProperty(EmployeeAssetModel, "exists", {
    configurable: true,
    value: async () => null,
  });
  Object.defineProperty(UserModel, "findOne", {
    configurable: true,
    value: () => ({
      select: async () => ({ _id: nextStaffId }),
    }),
  });
  Object.defineProperty(UserModel, "find", {
    configurable: true,
    value: () => ({
      select: () => ({
        lean: async () => [{ _id: nextStaffId, fullName: "New employee" }],
      }),
    }),
  });
  Object.defineProperty(EmployeeAssetModel, "findOneAndUpdate", {
    configurable: true,
    value: (filter: Record<string, unknown>, pipeline: unknown, options: Record<string, unknown>) => {
      updateFilter = filter;
      updatePipeline = pipeline;
      updateOptions = options;
      return {
        lean: async () => ({
          _id: assetId,
          name: "Safety helmet",
          quantity: 5,
          assignments: [
            {
              staffId: nextStaffId,
              quantity: 2,
              assignedBy: adminId,
              assignedAt: timestamp,
            },
          ],
          isDeleted: false,
          createdBy: adminId,
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      };
    },
  });

  const result = await reassignAsset(
    assetId.toString(),
    previousStaffId.toString(),
    { newStaffId: nextStaffId.toString() },
    adminId.toString(),
  );

  assert.equal(
    String(updateFilter?.["assignments.staffId"]),
    previousStaffId.toString(),
  );
  assert.equal(updateOptions?.updatePipeline, true);
  assert.equal(updateOptions?.new, true);
  assert.ok(Array.isArray(updatePipeline));

  const assignmentsExpression = updatePipeline[0].$set.assignments.$let;
  assert.deepEqual(
    assignmentsExpression.in.$concatArrays[0].$filter.cond,
    { $ne: ["$$assignment.staffId", previousStaffId] },
  );
  assert.equal(
    assignmentsExpression.in.$concatArrays[1][0].quantity,
    "$$sourceQuantity",
  );
  assert.deepEqual(result.assignments.map((assignment) => assignment.staffId), [
    nextStaffId.toString(),
  ]);
  assert.equal(result.assignedQuantity, 2);
  assert.equal(result.availableQuantity, 3);
});

test("employee release request checks unrequested assignment quantity and notifies admins", async () => {
  const assetId = new Types.ObjectId();
  const staffId = new Types.ObjectId();
  const adminId = new Types.ObjectId();
  const assignmentTimestamp = new Date("2026-10-27T00:00:00.000Z");
  let updateFilter: Record<string, unknown> | undefined;
  let updateDocument: Record<string, any> | undefined;
  let notification: Record<string, any> | undefined;

  Object.defineProperty(EmployeeAssetModel, "findOneAndUpdate", {
    configurable: true,
    value: (filter: Record<string, unknown>, update: Record<string, any>) => {
      updateFilter = filter;
      updateDocument = update;
      return {
        lean: async () => ({
          _id: assetId,
          name: "Safety helmet",
          quantity: 4,
          assignments: [
            {
              staffId,
              quantity: 3,
              assignedBy: adminId,
              assignedAt: assignmentTimestamp,
            },
          ],
          releaseRequests: [update.$push.releaseRequests],
          isDeleted: false,
          createdBy: adminId,
          createdAt: assignmentTimestamp,
          updatedAt: assignmentTimestamp,
        }),
      };
    },
  });
  Object.defineProperty(EmployeeAssetModel, "exists", {
    configurable: true,
    value: async () => ({ _id: assetId }),
  });
  Object.defineProperty(UserModel, "find", {
    configurable: true,
    value: () => ({
      select: () => ({
        lean: async () => [{ _id: adminId }],
      }),
    }),
  });
  Object.defineProperty(notificationService, "send", {
    configurable: true,
    value: async (data: Record<string, any>) => {
      notification = data;
    },
  });

  const result = await createAssetReleaseRequest(
    assetId.toString(),
    { quantity: 2, note: "Returning one item and keeping another." },
    staffId.toString(),
    "Employee One",
  );

  assert.ok(updateFilter?.$expr);
  assert.ok((updateFilter?.$expr as Record<string, any>).$gte[0].$subtract[1]);
  assert.equal(updateDocument?.$push.releaseRequests.quantity, 2);
  assert.equal(
    updateDocument?.$push.releaseRequests.note,
    "Returning one item and keeping another.",
  );
  assert.equal(result.status, "PENDING");
  assert.equal(result.staffName, "Employee One");
  assert.deepEqual(notification?.recipients, [adminId.toString()]);
  assert.equal(notification?.actionUrl, "/staff/assets");
});

test("admin approval atomically releases requested quantity and updates request status", async () => {
  const assetId = new Types.ObjectId();
  const requestId = new Types.ObjectId();
  const staffId = new Types.ObjectId();
  const adminId = new Types.ObjectId();
  const timestamp = new Date("2026-10-27T00:00:00.000Z");
  const pendingRequest = {
    _id: requestId,
    staffId,
    staffName: "Employee One",
    quantity: 2,
    note: "Returning two.",
    status: "PENDING" as const,
    createdAt: timestamp,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
  };
  let updateFilter: Record<string, any> | undefined;
  let updatePipeline: Record<string, any>[] | undefined;
  let notification: Record<string, any> | undefined;

  Object.defineProperty(EmployeeAssetModel, "findOne", {
    configurable: true,
    value: () => ({
      lean: async () => ({
        _id: assetId,
        name: "Safety helmet",
        quantity: 4,
        assignments: [
          { staffId, quantity: 3, assignedBy: adminId, assignedAt: timestamp },
        ],
        releaseRequests: [pendingRequest],
        isDeleted: false,
        createdBy: adminId,
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    }),
  });
  Object.defineProperty(EmployeeAssetModel, "findOneAndUpdate", {
    configurable: true,
    value: (filter: Record<string, any>, pipeline: Record<string, any>[]) => {
      updateFilter = filter;
      updatePipeline = pipeline;
      return {
        lean: async () => ({
          _id: assetId,
          name: "Safety helmet",
          quantity: 4,
          assignments: [
            { staffId, quantity: 1, assignedBy: adminId, assignedAt: timestamp },
          ],
          releaseRequests: [
            {
              ...pendingRequest,
              status: "APPROVED",
              reviewedBy: adminId,
              reviewedByName: "Admin One",
              reviewedAt: timestamp,
            },
          ],
          isDeleted: false,
          createdBy: adminId,
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      };
    },
  });
  Object.defineProperty(notificationService, "send", {
    configurable: true,
    value: async (data: Record<string, any>) => {
      notification = data;
    },
  });

  const result = await reviewAssetReleaseRequest(
    assetId.toString(),
    requestId.toString(),
    { status: "APPROVED" },
    adminId.toString(),
    "Admin One",
  );

  assert.equal(updateFilter?.$expr.$gte[1], 2);
  assert.ok(updatePipeline?.[0].$set.assignments.$let.vars.reduced.$reduce);
  assert.ok(updatePipeline?.[0].$set.releaseRequests.$map);
  assert.equal(result.status, "APPROVED");
  assert.equal(result.reviewedByName, "Admin One");
  assert.deepEqual(notification?.recipients, [staffId.toString()]);
});

test("admin rejection keeps the employee assignment unchanged", async () => {
  const assetId = new Types.ObjectId();
  const requestId = new Types.ObjectId();
  const staffId = new Types.ObjectId();
  const adminId = new Types.ObjectId();
  const timestamp = new Date("2026-10-27T00:00:00.000Z");
  const pendingRequest = {
    _id: requestId,
    staffId,
    staffName: "Employee One",
    quantity: 1,
    note: "No longer needed.",
    status: "PENDING" as const,
    createdAt: timestamp,
    reviewedBy: null,
    reviewedByName: null,
    reviewedAt: null,
  };
  let updatePipeline: Record<string, any>[] | undefined;

  Object.defineProperty(EmployeeAssetModel, "findOne", {
    configurable: true,
    value: () => ({
      lean: async () => ({
        _id: assetId,
        name: "Safety helmet",
        quantity: 4,
        assignments: [
          { staffId, quantity: 2, assignedBy: adminId, assignedAt: timestamp },
        ],
        releaseRequests: [pendingRequest],
        isDeleted: false,
        createdBy: adminId,
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    }),
  });
  Object.defineProperty(EmployeeAssetModel, "findOneAndUpdate", {
    configurable: true,
    value: (_filter: Record<string, any>, pipeline: Record<string, any>[]) => {
      updatePipeline = pipeline;
      return {
        lean: async () => ({
          _id: assetId,
          name: "Safety helmet",
          quantity: 4,
          assignments: [
            { staffId, quantity: 2, assignedBy: adminId, assignedAt: timestamp },
          ],
          releaseRequests: [
            {
              ...pendingRequest,
              status: "REJECTED",
              reviewedBy: adminId,
              reviewedByName: "Admin One",
              reviewedAt: timestamp,
            },
          ],
          isDeleted: false,
          createdBy: adminId,
          createdAt: timestamp,
          updatedAt: timestamp,
        }),
      };
    },
  });
  Object.defineProperty(notificationService, "send", {
    configurable: true,
    value: async () => undefined,
  });

  const result = await reviewAssetReleaseRequest(
    assetId.toString(),
    requestId.toString(),
    { status: "REJECTED" },
    adminId.toString(),
    "Admin One",
  );

  assert.equal(updatePipeline?.[0].$set.assignments, undefined);
  assert.equal(result.status, "REJECTED");
});
