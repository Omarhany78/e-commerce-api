const mongoose = require("mongoose");
const Product = require("../models/Product");
const CustomError = require("../errors");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, default: 0 },
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
  },
});

cartSchema.statics.checkProducts = async (items) => {
  const productChecks = items.map(async (item) => {
    const productId = item.product;
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
  });
  await Promise.all(productChecks);
};

cartSchema.statics.calculatePrice = async (items) => {
  const totalPrice = await Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.product);
      return product.price * item.quantity;
    })
  ).then((prices) => prices.reduce((sum, price) => sum + price, 0));
  return totalPrice;
};

cartSchema.methods.checkUpdated = async function (productId, quantity) {
  let itemUpdated = false;
  for (let item of this.items) {
    if (item.product._id.toString() === productId) {
      item.quantity += quantity;
      itemUpdated = true;
      break;
    }
  }

  if (!itemUpdated) {
    this.items.push({ product: productId, quantity });
  }
};

cartSchema.statics.fetchReq = async (req) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    throw new CustomError.BadRequestError(
      "Please provide product id and quantity"
    );
  }

  if (quantity <= 0) {
    throw new CustomError.BadRequestError("Quantity must be greater than 0");
  }

  return { productId, quantity };
};

cartSchema.statics.fetchCart = async function (userId) {
  let cart = await this.findOne({ user: userId });

  if (!cart) {
    cart = (await this.create({ user: userId, items: [] })).populate(
      "items.product",
      "name price"
    );
  }

  return cart;
};

cartSchema.statics.checkCart = async function (userId) {
  const cart = await this.findOne({ user: userId });
  if (!cart) {
    throw new CustomError.BadRequestError("No cart has been mad yet");
  }

  if (cart.items.length === 0) {
    throw new CustomError.BadRequestError("Your cart is empty");
  }

  return cart;
};

cartSchema.methods.checkProductExists = async function (productId) {
  const productExists = this.items
    .map((item) => item.product._id.toString())
    .includes(productId);
  if (!productExists) {
    throw new CustomError.BadRequestError(
      `There is no product with id: ${productId} in your cart`
    );
  }
};

cartSchema.methods.getItem = async function (productId) {
  const item = this.items.find((item) => {
    return item.product._id.toString() === productId;
  });
  return item;
};

module.exports = mongoose.model("Cart", cartSchema);
