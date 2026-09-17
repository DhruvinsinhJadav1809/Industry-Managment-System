import type { FinancialSummaryDto } from "../dashboard/dto/financial-summary.dto";
import {
  formatFinancialSummary,
  formatTotalSales,
  formatTotalPurchases,
  formatGrossProfit,
  formatNetTax,
} from "./chat.formatters";
import type { ChatQuestionId } from "./chat.questions";

interface ChatTool {
  question: string;
  format: (data: FinancialSummaryDto) => string;
}

export const CHAT_TOOLS: Record<ChatQuestionId, ChatTool> = {
  "financial-summary": {
    question: "What is my financial summary?",
    format: formatFinancialSummary,
  },

  "total-sales": {
    question: "What are my total sales?",
    format: formatTotalSales,
  },

  "total-purchases": {
    question: "What are my total purchases?",
    format: formatTotalPurchases,
  },

  "gross-profit": {
    question: "What is my gross profit?",
    format: formatGrossProfit,
  },

  "net-tax": {
    question: "What is my net tax?",
    format: formatNetTax,
  },
};
