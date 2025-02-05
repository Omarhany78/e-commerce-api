const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const CustomErrors = require("../errors");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cookieOptions = {
  httpOnly: true,
  signed: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
  const user = await User.createUser(req);
  const token = user.createToken();
  const numberOfUsers = await User.countDocuments();
  user.role = numberOfUsers === 1 ? "admin" : "customer";
  await user.save({ validateBeforeSave: false });
  await sendEmail({
    to: user.email,
    subject: "Welcome to our store",
    text: "Welcome to our store",
  });
  res.cookie("token", token, cookieOptions);
  res.status(StatusCodes.CREATED).json({ user, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomErrors.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomErrors.UnauthorizedError("Wrong email provided");
  }

  await user.comparePassword(password);
  const token = user.createToken();
  res.cookie("token", token, cookieOptions);
  res.status(StatusCodes.OK).json({ user, token });
};

const logout = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomErrors.NotFoundError("User not found");
  }

  res.clearCookie("token");
  res.status(StatusCodes.OK).json({ message: "Logged out successfully" });
};

const requestPasswordReset = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId);

  // Generate Token
  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  // Send Email
  const message = `Here is your password reset token: ${resetToken}`;

  await sendEmail({ to: user.email, subject: "Password Reset", text: message });
  res
    .status(StatusCodes.OK)
    .json({ message: "Reset password link sent to your email" });
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }, // Ensure token is not expired
  });

  if (!user) {
    throw new CustomErrors.BadRequestError("Invalid token");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({});
  await sendEmail({
    to: user.email,
    subject: "Password Reset Success",
    text: "Your password has been successfully reset",
  });

  res.status(StatusCodes.OK).json({ message: "Password reset successful" });
};

module.exports = {
  register,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
};
