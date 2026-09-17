import { z } from "zod";

export const chatRequestSchema = z.object({
  questionId: z.enum([
    "financial-summary",
    "total-sales",
    "total-purchases",
    "gross-profit",
    "net-tax",
  ]),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
