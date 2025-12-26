const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");
const logger = require("../../../utils/logger");
const { sanitizeUser } = require("../../../utils/sanitizeResponse");

// JWT expiration time
const JWT_EXPIRATION = '7d';

// ╔══════════════════════════════╗
// ║        Apple Login           ║
// ╚══════════════════════════════╝
const appleLogin = async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    const safeEmail = (email || "").toLowerCase().trim();
    if (!safeEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required to continue with Apple login. Please try again"
      });
    }

    const safeName = (name && String(name).trim()) || safeEmail.split("@")[0] || `User${Date.now()}`;

    // Check if user already exists
    const existingUser = await User.findOne({ email: safeEmail });

    if (existingUser) {
      if (provider && String(provider).trim() !== "" && existingUser.provider !== provider) {
        existingUser.provider = provider;
      }

      if (!existingUser.name || String(existingUser.name).trim() === "") {
        existingUser.name = safeName;
      }

      const token = jwt.sign(
        {
          id: existingUser._id,
          email: existingUser.email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: JWT_EXPIRATION }
      );

      existingUser.token = token;
      await existingUser.save();

      const sanitizedUser = sanitizeUser(existingUser);

      logger.info('Apple login successful', { userId: existingUser._id, email: safeEmail });

      return res.status(200).json({
        success: true,
        message: "Welcome back! Logged in successfully with Apple",
        user: {
          ...sanitizedUser,
          token,
        },
      });
    }

    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = new User({
      name: safeName,
      email: safeEmail,
      password: hashedPassword,
      provider: provider || "apple",
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: JWT_EXPIRATION }
    );

    // Save token
    newUser.token = token;
    await newUser.save();

    const sanitizedUser = sanitizeUser(newUser);

    logger.info('Apple signup successful', { userId: newUser._id, email: safeEmail });

    return res.status(201).json({
      success: true,
      message: "Welcome! Your account has been created successfully with Apple",
      user: {
        ...sanitizedUser,
        token,
      },
    });
  } catch (error) {
    logger.error("Apple Login Error:", { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: "We couldn't complete your Apple login at this time. Please try again later",
    });
  }
};

module.exports = {
  appleLogin,
};
