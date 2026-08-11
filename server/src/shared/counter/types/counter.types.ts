import { HydratedDocument } from "mongoose";

export interface ICounter {
  _id: string;

  sequence: number;
}

export type ICounterDocument = HydratedDocument<ICounter>;
