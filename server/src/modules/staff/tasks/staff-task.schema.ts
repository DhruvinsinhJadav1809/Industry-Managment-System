import { model, Schema } from "mongoose";
import {
  IStaffTask,
  STAFF_TASK_PRIORITIES,
  STAFF_TASK_SHIFTS,
  STAFF_TASK_STATUSES,
} from "./staff-task.types";

const commentSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const staffTaskSchema = new Schema<IStaffTask>(
  {
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    assignedDate: { type: Date, required: true },
    shift: { type: String, enum: STAFF_TASK_SHIFTS, required: true },
    priority: { type: String, enum: STAFF_TASK_PRIORITIES, required: true },
    estimatedHours: { type: Number, required: true, min: 0.25, max: 24 },
    overtimeHours: { type: Number, required: true, min: 0, max: 24, default: 0 },
    status: {
      type: String,
      enum: STAFF_TASK_STATUSES,
      required: true,
      default: "PENDING",
    },
    comments: { type: [commentSchema], default: [] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

staffTaskSchema.index({ assignedDate: 1, staffId: 1, shift: 1, createdAt: 1 });
staffTaskSchema.index({ staffId: 1, assignedDate: -1 });

export default model<IStaffTask>("StaffTask", staffTaskSchema);
