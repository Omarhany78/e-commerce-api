const { StatusCodes } = require("http-status-codes");

class NotFoundError extends Error {
  constructor(message = "Not Found") {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND; // 404
  }
}

module.exports = NotFoundError;
