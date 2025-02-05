const { StatusCodes } = require("http-status-codes");

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED; // 401
  }
}

module.exports = UnauthorizedError;
