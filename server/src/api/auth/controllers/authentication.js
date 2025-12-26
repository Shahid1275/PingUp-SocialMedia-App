const { User } = require("../../../models/user");
const {
  userSignupValidation,
  userLoginValidation,
} = require("../../../validations/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../../../utils/logger");
const { sanitizeUser } = require("../../../utils/sanitizeResponse");

// JWT expiration time
const JWT_EXPIRATION = '7d';

// ╔══════════════════════════════╗
// ║        signup                ║
// ╚══════════════════════════════╝
const signup = async (req, res) => {
  try {
    const { error, value } = userSignupValidation.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid information to create your account",
        error: error.details[0].message,
      });
    }

    const { email, password } = value;

    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please login or use a different email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = new User({
      ...value,
      password: hashedPassword,
      provider: value.provider || "password",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email }, 
      process.env.JWT_SECRET_KEY,
      { expiresIn: JWT_EXPIRATION }
    );

    const sanitizedUser = sanitizeUser(newUser);

    logger.info('User registered successfully', { userId: newUser._id, email: newUser.email });

    res.status(201).json({
      success: true,
      message: "Welcome! Your account has been created successfully",
      user: {
        ...sanitizedUser,
        token,
      },
    });
  } catch (error) {
    logger.error("Signup error:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "We couldn't create your account at this time. Please try again later",
    });
  }
};

// ╔══════════════════════════════╗
// ║        login                 ║
// ╚══════════════════════════════╝
const login = async (req, res) => {
  try {
    const { error, value } = userLoginValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email and password to login",
        error: error.details[0].message,
      });
    }

    const { email, password } = value;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please sign up first",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      logger.security('FAILED_LOGIN_ATTEMPT', { email, ip: null });
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please check your password and try again",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET_KEY,
      { expiresIn: JWT_EXPIRATION }
    );

    const sanitizedUser = sanitizeUser(user);

    logger.info('User logged in successfully', { userId: user._id, email: user.email });

    res.status(200).json({
      success: true,
      message: "Welcome back! You have been logged in successfully",
      user: {
        ...sanitizedUser,
        token,
      },
    });
  } catch (error) {
    logger.error("Login error:", { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "We couldn't log you in at this time. Please try again later",
    });
  }
};

module.exports = { signup, login };
