export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // Restore prototype chain (important when extending built-ins in TS)
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
