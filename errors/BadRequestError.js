const { StatusCodes } = require("http-status-codes");

class BadRequestError extends Error {
  constructor(message = "Bad Request") {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST; // 400
  }
}

module.exports = BadRequestError;
