import { ChatQuestionId } from "./chat.questions";

export interface ChatRequestDto {
  questionId: ChatQuestionId;
}
export interface ChatResponseDto {
  questionId: ChatQuestionId;
  question: string;
  answer: string;
}
