const errorHandler = (err, req, res, next) => {
  const errorObject = {
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  };

  if (err.name === "ValidationError") {
    errorObject.message = Object.values(err.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (err.code === 11000) {
    errorObject.message = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )}`;
    errorObject.statusCode = 400;
  }

  if (err.name === "CastError") {
    errorObject.message = `No item found with id: ${err.value}`;
    errorObject.statusCode = 404;
  }

  if (err.name === "JsonWebTokenError") {
    errorObject.message = "JWT is invalid";
    errorObject.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    errorObject.message = "JWT is expired";
    errorObject.statusCode = 401;
  }

  return res.status(errorObject.statusCode).json({
    error: errorObject.message,
  });
};

module.exports = errorHandler;
