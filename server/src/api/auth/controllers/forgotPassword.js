
const { User } = require("../../../models/user");
const {
  userforgotPasswordValidation,
  userchangePasswordValidation,
} = require("../../../validations/index");
const bcrypt = require("bcrypt");
const htmlContent = require("../../../utils/forgotPasswordHtml");
const sendEmail = require("../../../utils/sendEmail");
const { getOTP } = require("../../../utils/getOtp");
const logger = require("../../../utils/logger");
const { sanitizeUser } = require("../../../utils/sanitizeResponse");

// ╔══════════════════════════════╗
// ║        forgotPassword        ║
// ╚══════════════════════════════╝
const forgotPassword = async (req, res) => {
  try {
    const { error, value } = userforgotPasswordValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid information. " + error.details[0].message,
      });
    }
    const { step, email, password } = value;

    // Validate step is 1, 2, or 3
    if (![1, 2, 3].includes(step)) {
      return res.status(400).json({
        success: false,
        message: "Invalid step. Step must be 1 (send OTP), 2 (verify OTP), or 3 (reset password)",
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address. Please check your email and try again",
      });
    }
    if (user.provider && user.provider !== "password") {
      return res.status(400).json({
        success: false,
        message: `This account is linked to a ${user.provider} login. Please use ${user.provider} to sign in instead of resetting the password.`,
        provider: user.provider,
      });
    }
    switch (step) {
      case 1:
        const otp = getOTP();
        // Hash OTP before storing
        const hashedOtp = await bcrypt.hash(otp, 10);
        user.forgotOtp = hashedOtp;
        user.otpexpirationTime = new Date(Date.now() + 2 * 60 * 1000);
        const mailOptions = {
          to: email,
          subject: "Forgot Password OTP",
          html: htmlContent(otp),
          from: process.env.EMAIL_MAIL,
        };
        await Promise.all([user.save(), sendEmail(mailOptions)]);

        logger.info('OTP sent for password reset', { email });

        return res.status(200).json({
          success: true,
          message: "A verification code has been sent to your email. Please check your inbox",
        });
      case 2:
        // Compare hashed OTP
        const isOtpValid = await bcrypt.compare(value.otp, user.forgotOtp || '');
        
        if (isOtpValid && new Date() < user.otpexpirationTime) {
          // Set verification timestamp (valid for 5 minutes)
          user.otpVerifiedAt = new Date();
          await user.save();
          
          logger.info('OTP verified successfully', { email });
          return res.status(200).json({
            success: true,
            message: "Verification code confirmed successfully. You can now reset your password",
            canChange: true,
          });
        } else {
          logger.security('INVALID_OTP_ATTEMPT', { email });
          return res.status(400).json({
            success: false,
            message: "Invalid or expired verification code. Please request a new code",
            canChange: false,
          });
        }
      case 3:
        // Check if step 2 (OTP verification) was completed
        if (!user.otpVerifiedAt) {
          logger.security('STEP_3_WITHOUT_VERIFICATION', { email });
          return res.status(403).json({
            success: false,
            message: "Please verify your OTP first (step 2) before resetting password",
          });
        }

        // Check if verification is still valid (5 minutes)
        const verificationAge = (new Date() - new Date(user.otpVerifiedAt)) / 1000; // in seconds
        if (verificationAge > 300) { // 5 minutes
          logger.security('EXPIRED_VERIFICATION', { email });
          return res.status(403).json({
            success: false,
            message: "Verification expired. Please verify your OTP again (step 2)",
          });
        }

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        user.password = hashedPassword;
        user.forgotOtp = undefined;
        user.otpexpirationTime = undefined;
        user.otpVerifiedAt = undefined;
        await user.save();
        
        logger.info('Password reset successful', { email });
        
        return res.status(200).json({
          success: true,
          message: "Your password has been reset successfully. You can now login with your new password",
        });
    }
  } catch (error) {
    logger.error("Forgot password error:", { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: "We couldn't process your password reset request. Please try again later",
    });
  }
};

// ╔══════════════════════════════╗
// ║        changePassword        ║
// ╚══════════════════════════════╝
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    // If middleware didn't attach user info, return a clear 401 error
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please login again to change your password",
      });
    }
    const { error, value } = userchangePasswordValidation.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Please provide valid password information. " + error.details[0].message,
      });
    }

    const user = await User.findOne({ _id: userId }).select("password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please login again",
      });
    }

    const validPassword = await bcrypt.compare(
      value.oldPassword,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect. Please try again.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(value.newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your password has been changed successfully",
    });
  } catch (error) {
    logger.error("Change password error:", { error: error.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: "We couldn't change your password at this time. Please try again later",
    });
  }
};
// ╔══════════════════════════════╗
// ║        updateProfile         ║
// ╚══════════════════════════════╝
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      profileImage,
      gender,
      username,
      bio,
      gym,
      links,
    } = req.body;

    // Get current user to check if gym is changing
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please login again",
      });
    }

    const updatePayload = {};
    if (typeof name !== "undefined") updatePayload.name = name;
    if (typeof profileImage !== "undefined") updatePayload.profileImage = profileImage;
    if (typeof gender !== "undefined") updatePayload.gender = gender;
    if (typeof username !== "undefined") {
      // Check if username is already taken by another user
      if (username && username.trim() !== "") {
        const existingUser = await User.findOne({ 
          username: username.trim(), 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "This username is already taken. Please choose a different username",
          });
        }
      }
      updatePayload.username = username.trim();
    }
    if (typeof bio !== "undefined") updatePayload.bio = bio;
    if (typeof gym !== "undefined") updatePayload.gym = gym;
    
    if (typeof links !== "undefined") {
      if (Array.isArray(links)) updatePayload.links = links;
      else if (typeof links === "string") updatePayload.links = links.split(",").map(l => l.trim()).filter(Boolean);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updatePayload,
      {
        new: true,
        select: "-password -forgotOtp -otpexpirationTime ",
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Account not found. Please login again",
      });
    }

    logger.info('Profile updated', { userId });

    return res.status(200).json({
      success: true,
      message: "Your profile has been updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    logger.error("Update profile error:", { error: error.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: "We couldn't update your profile at this time. Please try again later",
    });
  }
};
// ╔══════════════════════════════╗
// ║        deleteUserData        ║
// ╚══════════════════════════════╝

const deleteUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found. It may have already been deleted",
      });
    }
    // Delete all user-related data
    await Promise.all([
          User.findByIdAndDelete(userId),
    ]);

    logger.info('User account deleted', { userId });

    return res.status(200).json({
      success: true,
      message: "Your account and all related data have been deleted successfully. We're sorry to see you go!",
    });
  } catch (error) {
    logger.error("Delete user error:", { error: error.message, userId: req.user?.id });
    return res.status(500).json({
      success: false,
      message: "We couldn't delete your account at this time. Please try again later or contact support",
    });
  }
};
// ╔══════════════════════════════╗
// ║        logout                ║
// ╚══════════════════════════════╝
const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found. You may already be logged out" });
    }

    res.json({
      success: true,
      message: "You have been logged out successfully. Come back soon!",
    });
  } catch (err) {
    logger.error("Logout error:", { error: err.message, userId: req.user?.id });
    res.status(500).json({ success: false, message: "We couldn't log you out at this time. Please try again" });
  }
};
// ╔══════════════════════════════╗
// ║        profileSet            ║
// ╚══════════════════════════════╝
const profileSet = async (req, res) => {
  try {
    const { profileImage, bio, age, gender, country, state } = req.body;

    const ProfileData = {
      bio,
      age,
      gender,
      country,
      state,
      profileImage,
    };
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: ProfileData },
      { new: true }
    );

    logger.info('Profile set successfully', { userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "Your profile has been set up successfully",
      user,
    });

  } catch (error) {
    logger.error("Profile set error:", { error: error.message, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: "We couldn't set up your profile at this time. Please try again later",
    });
  }
};
module.exports = {
  forgotPassword,
  changePassword, 
  updateProfile,
  deleteUserData,
  profileSet,
  logout,
};
