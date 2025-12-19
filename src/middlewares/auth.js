const { User } = require("../models");
const { errorResponse } = require("../utils/responseHandler");

exports.authenticate = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return errorResponse(res, 401, "Not authenticated");
  }

  const user = await User.findByPk(req.session.userId);
  if (!user || !user.is_active) {
    return errorResponse(res, 403, "Account inactive");
  }

  req.user = user;
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, "Access denied");
    }

    next();
  };
};
