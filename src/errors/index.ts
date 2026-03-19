export class NotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends Error {
  readonly statusCode = 500;

  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}
