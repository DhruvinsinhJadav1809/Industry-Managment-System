export interface ChatRequestPayload {
  message: string;
}

/**
 * questionId is null when the message doesn't match a supported financial
 * question (e.g. "What is the weather today?") — the request still
 * succeeds, it's just an out-of-scope answer, not an error.
 */
export interface ChatAnswer {
  questionId: string | null;
  question: string;
  answer: string;
}
