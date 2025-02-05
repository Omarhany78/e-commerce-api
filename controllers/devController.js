const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { StatusCodes } = require("http-status-codes");

const deleteAllUsers = async (req, res) => {
  await User.deleteMany({});
  res.clearCookie("token");
  res
    .status(StatusCodes.OK)
    .json({ message: "All users deleted successfully" });
};

const deleteAllProducts = async (req, res) => {
  await Product.deleteMany({});
  res.status(StatusCodes.OK).json({ message: "All products deleted" });
};

const deleteAllCarts = async (req, res) => {
  await Cart.deleteMany();
  res.status(StatusCodes.OK).json({ message: "All carts deleted" });
};

const deleteAllOrders = async (req, res) => {
  await Order.deleteMany();
  res.status(StatusCodes.OK).json({ message: "All Orders deleted" });
};

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(StatusCodes.OK).json({ count: users.length, users });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate(
    "user",
    "firstName lastName email"
  );
  res.status(StatusCodes.OK).json({ count: orders.length, orders });
};

module.exports = {
  deleteAllUsers,
  deleteAllProducts,
  deleteAllCarts,
  deleteAllOrders,
  getAllUsers,
  getAllOrders,
};
