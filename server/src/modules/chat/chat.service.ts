import { getFinancialSummary } from "../dashboard/services/dashboard.service";

import {
  formatFinancialSummary,
  formatTotalSales,
  formatTotalPurchases,
  formatGrossProfit,
  formatNetTax,
} from "./chat.formatters";

import type { ChatQuestionId } from "./chat.questions";
import type { ChatResponseDto } from "./chat.dto";
import { CHAT_TOOLS } from "./chat.tools";

export const processQuestion = async (
  questionId: ChatQuestionId,
): Promise<ChatResponseDto> => {
  const tool = CHAT_TOOLS[questionId];
  const financialSummary = await getFinancialSummary();

  return {
    questionId,
    question: tool.question,
    answer: tool.format(financialSummary),
  };
};
