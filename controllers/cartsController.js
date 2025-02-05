const Cart = require("../models/Cart");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const createCart = async (req, res) => {
  const { userId } = req.user;
  const alreadyMadeCart = await Cart.findOne({ user: userId });
  if (alreadyMadeCart) {
    throw new CustomError.BadRequestError("You have already made a cart");
  }
  const { items } = req.body;
  await Cart.checkProducts(items);
  const totalPrice = await Cart.calculatePrice(items);
  const cart = await (
    await Cart.create({ user: userId, items, totalPrice })
  ).populate("items.product", "name price");
  res
    .status(StatusCodes.CREATED)
    .json({ NumberOfItems: cart.items.length, cart });
};

const getCart = async (req, res) => {
  const { userId } = req.user;
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price"
  );
  if (!cart || !cart.items) {
    return res
      .status(StatusCodes.OK)
      .json({ message: "No cart has been made yet" });
  }

  res.status(StatusCodes.OK).json({
    NumberOfItems: cart.items.length,
    cart: await cart.populate("items.product", "name price"),
  });
};

const addItem = async (req, res) => {
  const { userId } = req.user;
  const { productId, quantity } = await Cart.fetchReq(req);
  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${productId}`);
  }

  const cart = await Cart.fetchCart(userId);
  await cart.checkUpdated(productId, quantity);
  cart.totalPrice = await Cart.calculatePrice(cart.items);
  await cart.save();
  res.status(StatusCodes.OK).json({
    NumberOfItems: cart.items.length,
    cart: await cart.populate("items.product", "name price"),
  });
};

const updateItemQuantity = async (req, res) => {
  const { userId } = req.user;
  const { productId, quantity } = await Cart.fetchReq(req);
  const cart = await Cart.checkCart(userId);
  await cart.checkProductExists(productId);
  const item = await cart.getItem(productId);
  item.quantity = quantity;
  cart.totalPrice = await Cart.calculatePrice(cart.items);
  await cart.save();
  res.status(StatusCodes.OK).json({
    NumberOfItems: cart.items.length,
    cart: await cart.populate("items.product", "name price"),
  });
};

const removeItem = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.body;
  const cart = await Cart.checkCart(userId);
  await cart.checkProductExists(productId);
  cart.items = cart.items.filter(
    (item) => item.product._id.toString() !== productId
  );
  cart.totalPrice = await Cart.calculatePrice(cart.items);
  await cart.save();
  res.status(StatusCodes.OK).json({
    message: "Item removed successfully",
    NumberOfItems: cart.items.length,
    cart: await cart.populate("items.product", "name price"),
  });
};

const emptyCart = async (req, res) => {
  const { userId } = req.user;
  const cart = await Cart.checkCart(userId);
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();
  res
    .status(StatusCodes.OK)
    .json({ message: "Cart emptied successfully", cart });
};

module.exports = {
  createCart,
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  emptyCart,
};
