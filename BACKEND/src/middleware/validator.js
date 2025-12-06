const { matchedData } = require("express-validator");
const ErrorResponse = require("../utils/errorResponse");

const validator = (validations) => async (req, _, next) => {
  try {
    const extractedErrors = [];

    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        result.array().map((err) =>
          extractedErrors.push({
            field: err.path,
            message: err.msg,
          })
        );
      }
    }

    if (extractedErrors.length > 0) {
      return next(new ErrorResponse("Validation Error", 400, extractedErrors));
    }

    const validatedData = matchedData(req, {
      onlyValidData: true,
      locations: ["body", "query"],
    });

    const requestFields = [
      ...new Set([
        ...Object.keys(req.body || {}),
        ...Object.keys(req.query || {}),
      ]),
    ];
    const allowedFields = Object.keys(validatedData);
    const extraFields = requestFields.filter(
      (key) => !allowedFields.includes(key)
    );

    if (extraFields.length > 0) {
      return next(
        new ErrorResponse(
          "Unexpected fields in request",
          400,
          extraFields.map((field) => ({
            field,
            message: `${field} is not allowed`,
          }))
        )
      );
    }

    next();
  } catch (error) {
    console.log(error);
    throw new ErrorResponse("Invalid payload", 400);
  }
};

module.exports = validator;
