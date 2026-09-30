import * as chatService from "./chat.service";
import { asyncHandler } from "../../shared/helpers/async-handler";
import { successResponse } from "../../shared/response/response.helper";

export const chat = asyncHandler(async (req, res) => {
  const result = await chatService.processGeminiQuestion(req.body.message);

  return res.json(
    successResponse(result, "Chat response generated successfully."),
  );
});
