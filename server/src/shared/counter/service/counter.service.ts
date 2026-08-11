import { ClientSession } from "mongoose";
import { CounterModel } from "../schemas/counter.schema";

export const getNextSequence = async (
  counterName: string,
  session?: ClientSession,
): Promise<number> => {
  const counter = await CounterModel.findOneAndUpdate(
    {
      _id: counterName,
    },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      new: true,

      upsert: true,

      session,
    },
  );

  return counter.sequence;
};

export const generatePurchaseNumber = async (session: ClientSession) => {
  const sequence = await getNextSequence("purchase", session);

  return `PUR${sequence.toString().padStart(6, "0")}`;
};
