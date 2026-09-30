import { ChatQuestionId } from "../../modules/chat/chat.questions";

export const GEMINI_TOOL_MAP: Record<string, ChatQuestionId> = {
  financial_summary: "financial-summary",
  total_sales: "total-sales",
  total_purchases: "total-purchases",
  gross_profit: "gross-profit",
  net_tax: "net-tax",
};
