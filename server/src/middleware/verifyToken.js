const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const logger = require("../utils/logger");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token is required. Please login." });
    }

    // Strip "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trim();
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    const loginUser = await User.findById(decoded.id).select("_id").lean();
    if (!loginUser) {
      logger.security('TOKEN_USER_NOT_FOUND', { tokenUserId: decoded.id });
      return res.status(401).json({
        success: false,
        message: "User account not found. Please login again.",
        isUserExist: false,
      });
    }
    req.user = { id: loginUser._id };
    next();
  } catch (err) {
    logger.security('TOKEN_VERIFICATION_FAILED', { error: err.message });

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Your session has expired. Please login again." });
    }

    return res.status(401).json({ success: false, message: "Invalid authentication token. Please login again." });
  }
};

module.exports = { verifyToken };
