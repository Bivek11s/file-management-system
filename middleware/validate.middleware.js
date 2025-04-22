import { formatErrorResponse } from "../utils/response.utils.js";

// Validation middleware
export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const validationErrors =
      error.errors && Array.isArray(error.errors)
        ? error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          }))
        : [{ message: error.message || "Validation failed" }];
    res
      .status(400)
      .json(
        formatErrorResponse(
          "Validation Error",
          "Invalid request Payload",
          validationErrors
        )
      );
  }
};
