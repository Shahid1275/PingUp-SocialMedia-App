const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../../../models/user");
const logger = require("../../../utils/logger");
const { sanitizeUser } = require("../../../utils/sanitizeResponse");

// JWT expiration time
const JWT_EXPIRATION = '7d';

// ╔══════════════════════════════╗
// ║       Google Login          ║
// ╚══════════════════════════════╝
const googleLogin = async (req, res) => {
  try {
    const { email, name, provider } = req.body;

    const safeEmail = (email || "").toLowerCase().trim();
    if (!safeEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required to continue with Google login. Please try again",
      });
    }

    const safeName = (name && String(name).trim()) || safeEmail.split("@")[0] || `User${Date.now()}`;

    const alreadyRegistered = await User.findOne({ email: safeEmail });

    if (alreadyRegistered) {
      if (provider && String(provider).trim() !== "" && alreadyRegistered.provider !== provider) {
        alreadyRegistered.provider = provider;
      }

      if (!alreadyRegistered.name || String(alreadyRegistered.name).trim() === "") {
        alreadyRegistered.name = safeName;
      }

     
      const token = jwt.sign(
        { id: alreadyRegistered._id.toString(), email: alreadyRegistered.email, provider: alreadyRegistered.provider || provider || "google" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: JWT_EXPIRATION }
      );

      alreadyRegistered.token = token;
      await alreadyRegistered.save();

      const sanitizedUser = sanitizeUser(alreadyRegistered);

      logger.info('Google login successful', { userId: alreadyRegistered._id, email: safeEmail });

      return res.status(200).json({
        success: true,
        message: "Welcome back! Logged in successfully with Google",
        user: {
          ...sanitizedUser,
          token,
        },
      });
    }
    const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const data = {
      email: safeEmail,
      name: safeName,
      password: hashedPassword,
      provider: provider || "google",
    };

    // First create the user without the token
    let user = await User.create(data);

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, provider: user.provider || provider || "google" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: JWT_EXPIRATION }
    );

    user.token = token;
    await user.save();

    const sanitizedUser = sanitizeUser(user);

    logger.info('Google signup successful', { userId: user._id, email: safeEmail });

    return res.status(200).json({
      success: true,
      message: "Welcome! Your account has been created successfully with Google",
      user: {
        ...sanitizedUser,
        token,
      },
    });
  } catch (error) {
    logger.error("Google login error:", { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: "We couldn't complete your Google login at this time. Please try again later",
    });
  }
};


module.exports = {
  googleLogin,
};
