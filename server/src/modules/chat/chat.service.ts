import { getFinancialSummary } from "../dashboard/services/dashboard.service";
import { CHAT_TOOLS } from "./chat.tools";
import type { ChatResponseDto } from "./chat.dto";
import { geminiClient } from "../../shared/config/gemini";
import { GEMINI_CHAT_TOOLS } from "./chat.gemini.tools";
import { CHAT_ERROR_MESSAGES } from "../../shared/constants/chat.constants";
import { GEMINI_TOOL_MAP } from "../../shared/mappers/chat.gemini-tool-map";

export const processGeminiQuestion = async (
  message: string,
): Promise<ChatResponseDto> => {
  const interaction = await geminiClient.interactions.create({
    model: "gemini-3.6-flash",
    input: message,
    tools: GEMINI_CHAT_TOOLS,
  });

  const functionCall = interaction.steps?.find(
    (step) => step.type === "function_call",
  );

  if (!functionCall || functionCall.type !== "function_call") {
    return {
      questionId: null,
      question: message,
      answer: CHAT_ERROR_MESSAGES.OUT_OF_SCOPE,
    };
  }

  const questionId = GEMINI_TOOL_MAP[functionCall.name];

  if (!questionId) {
    console.error(`Unsupported Gemini tool selected: ${functionCall.name}`);

    return {
      questionId: null,
      question: message,
      answer: CHAT_ERROR_MESSAGES.OUT_OF_SCOPE,
    };
  }

  const tool = CHAT_TOOLS[questionId];

  const financialSummary = await getFinancialSummary();

  const toolResult = tool.format(financialSummary);

  const finalInteraction = await geminiClient.interactions.create({
    model: "gemini-3.6-flash",
    previous_interaction_id: interaction.id,
    input: [
      {
        type: "function_result",
        name: functionCall.name,
        call_id: functionCall.id,
        result: toolResult,
      },
    ],
  });

  return {
    questionId,
    question: message,
    answer: finalInteraction.output_text ?? toolResult,
  };
};
