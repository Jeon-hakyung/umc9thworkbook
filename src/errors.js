import { StatusCodes } from "http-status-codes";

export class DuplicateUserEmailError extends Error {
    errorCode = "U001";
    statusCode= StatusCodes.CONFLICT;
  
    constructor(reason, data) {
      super(reason);
      this.reason = reason;
      this.data = data;
    }
  }