export const CHAT_QUESTIONS = [
  {
    id: "financial-summary",
    question: "What is my financial summary?",
  },
  {
    id: "total-sales",
    question: "What are my total sales?",
  },
  {
    id: "total-purchases",
    question: "What are my total purchases?",
  },
  {
    id: "gross-profit",
    question: "What is my gross profit?",
  },
  {
    id: "net-tax",
    question: "What is my net tax?",
  },
] as const;

export type ChatQuestionId = (typeof CHAT_QUESTIONS)[number]["id"];
