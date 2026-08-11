import { Schema, model } from "mongoose";
import { ICounterDocument } from "./counter.types";

const counterSchema = new Schema<ICounterDocument>({
  _id: {
    type: String,
    required: true,
  },

  sequence: {
    type: Number,
    default: 0,
  },
});

export const CounterModel = model<ICounterDocument>("Counter", counterSchema);
