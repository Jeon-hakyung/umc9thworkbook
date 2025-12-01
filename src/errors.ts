// src/errors.ts
import { StatusCodes } from "http-status-codes";

export class DuplicateUserEmailError extends Error {
  errorCode = "U001";
  statusCode = StatusCodes.CONFLICT; 
  reason: string;
  data: any;

  constructor(reason: string, data: any) {
    super(reason);
    this.reason = reason;
    this.data = data;
  }
}