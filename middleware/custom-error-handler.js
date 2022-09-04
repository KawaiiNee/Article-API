const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    // if no err value, use default
    msg: err.message || "Something went wrong",
    statusCode: err.statusCode || 500,
  };

  // duplication of unique values
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value in the field of ${Object.keys(
      err.keyValue
    )}`;
    customError.statusCode = 400;
  }

  // required values
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((error) => {
        return error.message;
      })
      .join(", ");
    customError.statusCode = 400;
  }

  // Model ID
  if (err.name === "CastError") {
    customError.msg = `No item found with ID: ${err.value}`;
    customError.statusCode = 404;
  }

  // return res.status(customError.statusCode).json({ err });
  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
