const successResponse = (
  res,
  statusCode = 200,
  message = "Success",
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  statusCode = 500,
  message = "Internal Server Error",
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

const paginatedResponse = (
  res,
  statusCode = 200,
  message = "Data retrieved",
  data = [],
  pagination = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || data.length,
      totalItems: pagination.totalItems || data.length,
      totalPages:
        pagination.limit && pagination.totalItems
          ? Math.ceil(pagination.totalItems / pagination.limit)
          : 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
