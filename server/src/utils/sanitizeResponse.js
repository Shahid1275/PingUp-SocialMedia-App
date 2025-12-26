
const sanitizeUser = (user) => {
  if (!user) return null;

  const userObj = user.toObject ? user.toObject() : { ...user };

  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'forgotOtp',
    'otpexpirationTime',
    '__v',
    'loginAttempts',
    'lockUntil',
  ];

  sensitiveFields.forEach((field) => delete userObj[field]);

  return userObj;
};


const sanitizeUsers = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map((user) => sanitizeUser(user));
};

module.exports = {
  sanitizeUser,
  sanitizeUsers,
};
