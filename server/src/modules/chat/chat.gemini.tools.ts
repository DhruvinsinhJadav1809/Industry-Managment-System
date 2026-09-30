export interface GeminiFunctionTool {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, never>;
  };
}

export const GEMINI_CHAT_TOOLS: GeminiFunctionTool[] = [
  {
    type: "function",
    name: "financial_summary",
    description:
      "Get the financial summary for the current financial year, including total sales, total purchases, gross profit, and net tax.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "total_sales",
    description: "Get the total sales amount for the current financial year.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "total_purchases",
    description:
      "Get the total purchases amount for the current financial year.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "gross_profit",
    description: "Get the gross profit amount for the current financial year.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    type: "function",
    name: "net_tax",
    description: "Get the net tax amount for the current financial year.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];
