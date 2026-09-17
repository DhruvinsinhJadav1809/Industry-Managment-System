export interface ChatRequestPayload {
  questionId: string;
}

export interface ChatAnswer {
  questionId: string;
  question: string;
  answer: string;
}
