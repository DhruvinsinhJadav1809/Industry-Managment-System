import { IUserDocument } from "../modules/users/types/user.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export {};
