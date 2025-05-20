const jwt = require("jsonwebtoken");
const User = require("../schema/User");
const createError = require("../utils/appError");

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError("Authentication token missing", 401));
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.secretKey);
    } catch (err) {
      return next(createError("Invalid or expired token", 401));
    }

    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return next(createError("User not found", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
