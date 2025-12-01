// @types/express.d.ts
import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User; // req.user는 Prisma의 User 모델과 같습니다.
    }

    export interface Response {
      success(success: any): this;
      error(error: {
        errorCode?: string;
        reason?: string | null;
        data?: any | null;
      }): this;
    }
  }
}