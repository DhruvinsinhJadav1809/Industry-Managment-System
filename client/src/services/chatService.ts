import { apiClient } from "../lib/axios";
import type { ApiResponse } from "../types/auth";
import type { ChatAnswer, ChatRequestPayload } from "../types/chat";

export const chatService = {
  /** POST /chat */
  ask: async (payload: ChatRequestPayload) => {
    const { data } = await apiClient.post<ApiResponse<ChatAnswer>>(
      "/chat",
      payload,
    );
    return data;
  },
};
