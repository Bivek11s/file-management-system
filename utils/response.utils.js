const formatSuccessResponse = (message, data = null) => {
  return {
    success: true,
    message,
    data,
  };
};

const formatErrorResponse = (message, error, validationErrors = null) => {
  return {
    success: false,
    message,
    error,
    validationErrors,
  };
};

export { formatSuccessResponse, formatErrorResponse };
