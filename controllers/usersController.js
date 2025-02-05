const User = require("../models/User");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(StatusCodes.OK).json({ count: users.length, users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${id}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const getCurrentUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findById(userId);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const updateCurrentUser = async (req, res) => {
  const { userId } = req.user;
  const { firstName, lastName, phoneNumber } = req.body;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      phoneNumber,
    },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const makeUserAdmin = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    { role: "admin" },
    { new: true, runValidators: true }
  );
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${id}`);
  }

  res.status(StatusCodes.OK).json({ user });
};

const deleteCurrentUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findByIdAndDelete(userId, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${userId}`);
  }
  res.clearCookie("token");

  res.status(StatusCodes.OK).json({ message: "User deleted Successfully" });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${id}`);
  }

  if (user.role === "admin") {
    throw new CustomError.BadRequestError("Admin cannot be deleted");
  }

  await user.deleteOne({ runValidators: true, new: true });
  res.status(StatusCodes.OK).json({ message: "User deleted Successfully" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
  makeUserAdmin,
  deleteUser,
};
