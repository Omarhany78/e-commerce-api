const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { authorize } = require("../utils/utils");

const createOrder = async (req, res) => {
  const { userId } = req.user;
  const shippingAddress = await Order.getShippingAddress(req);
  const user = await User.findById(userId);
  const cart = await Order.checkCart(Cart, userId);
  const products = await Order.getProducts(cart);
  const totalPrice = await Order.calcMoney(products, user);
  await Order.reduceQuantity(products, Product);
  const order = await Order.create({
    user: userId,
    products,
    shippingAddress,
    totalPrice,
  });
  await cart.deleteOne();
  const deliveryTime = setInterval(async () => {
    order.orderStatus = "Delivered";
    order.paymentStatus = "Paid";
    await order.save();
    clearInterval(deliveryTime);
  }, 1000 * 60);
  res.status(StatusCodes.CREATED).json({ order });
};

const getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.getOrder(id);
  authorize(req, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getUserOrders = async (req, res) => {
  const { userId } = req.user;
  const orders = await Order.find({ user: userId, orderStatus: "Pending" });
  res.status(StatusCodes.OK).json({ numberOfOrders: orders.length, orders });
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const order = await Order.getOrder(id);
  authorize(req, order.user);
  const { totalPrice, products } = order;
  await User.findByIdAndUpdate(userId, { $inc: { money: totalPrice } });
  await order.fixQuantity(products, Product);
  await order.fixStatus();
  res.status(StatusCodes.OK).json({ message: "Order Cancelled successfully" });
};

const getOrderHistory = async (req, res) => {
  const { userId } = req.user;
  const orders = await Order.find({ user: userId });
  res.status(StatusCodes.OK).json({ numberOfOrders: orders.length, orders });
  res.status(StatusCodes.OK).send("Here is your order history!");
};

module.exports = {
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder,
  getOrderHistory,
};
