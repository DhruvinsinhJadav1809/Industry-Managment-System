import { ChatQuestionId } from "./chat.questions";

export interface ChatRequestDto {
  questionId: ChatQuestionId;
}
export interface ChatResponseDto {
  questionId: ChatQuestionId | null;
  question: string;
  answer: string;
}
