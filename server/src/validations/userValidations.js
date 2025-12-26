const Joi = require("joi");

const userSignupValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  provider: Joi.string().valid("google", "apple", "password"),
});

const userLoginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const userforgotPasswordValidation = Joi.object({
  email: Joi.string().email().max(50).required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email address",
    "string.max": "Email must be less than or equal to 50 characters",
  }),
  step: Joi.number().valid(1, 2, 3).required().messages({
    "any.required": "Step is required",
    "number.base": "Step must be a number",
    "any.only": "Step must be 1 (send OTP), 2 (verify OTP), or 3 (reset password)",
  }),
  otp: Joi.string().when('step', {
    is: 2,
    then: Joi.string().required().messages({
      "any.required": "OTP is required for verification",
    }),
    otherwise: Joi.string().optional(),
  }).messages({
    "string.base": "OTP must be a string",
  }),
  password: Joi.string().when('step', {
    is: 3,
    then: Joi.string().min(6).required().messages({
      "any.required": "New password is required for step 3",
      "string.min": "Password must be at least 6 characters long",
    }),
    otherwise: Joi.string().optional(),
  }).messages({
    "string.base": "Password must be a string",
  }),
});

const userchangePasswordValidation = Joi.object({
  oldPassword: Joi.string().required().messages({
    "any.required": "Old password is required",
    "string.base": "Old password must be a string",
  }),
  newPassword: Joi.string().required().messages({
    "any.required": "New password is required",
    "string.base": "New password must be a string",
  }),
});

module.exports = {
  userSignupValidation,
  userLoginValidation,
  userforgotPasswordValidation,
  userchangePasswordValidation,
};
