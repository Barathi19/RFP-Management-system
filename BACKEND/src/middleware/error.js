const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, _, res, next) => {
  console.error(err.stack?.red);

  let error = err;

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const [key, value] = Object.entries(err.keyValue)[0];
    const message = `Duplicate ${key}: '${value}' already exists.`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((errorObj) => ({
      field: errorObj.properties.path,
      message: errorObj.message,
    }));
    error = new ErrorResponse("Validation Error", 400, messages);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(error.messageWithField && { details: error.messageWithField }),
  });
};

module.exports = errorHandler;
