const mongoose = require("mongoose");
const CustomError = require("../errors");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price can't be less than 0"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

OrderSchema.statics.checkCart = async function (Cart, userId) {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name price"
  );
  if (!cart) {
    throw new CustomError.BadRequestError("No cart has been made");
  }

  if (cart.items.length === 0) {
    throw new CustomError.BadRequestError("There are no product in your cart");
  }

  return cart;
};

OrderSchema.statics.getProducts = function (cart) {
  const products = cart.items.map((item) => {
    const finalProduct = {
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    };
    return finalProduct;
  });

  return products;
};

OrderSchema.statics.calcMoney = async function (products, user) {
  const totalPrice = products.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);
  if (user.money < totalPrice) {
    throw new CustomError.BadRequestError("Insufficient funds");
  }

  user.money = user.money - totalPrice;
  await user.save({ validateBeforeSave: false });
  return totalPrice;
};

OrderSchema.statics.reduceQuantity = async function (products, Product) {
  await Promise.all(
    products.map(async (product) => {
      const tempProduct = await Product.findById(product.product);
      if (!tempProduct || tempProduct.quantity < product.quantity) {
        throw new CustomError.BadRequestError(
          `Not enough stock for ${product.name}`
        );
      }
      tempProduct.quantity -= product.quantity;
      await tempProduct.save();
      return;
    })
  );
};

OrderSchema.statics.getShippingAddress = async function (req) {
  const { shippingAddress } = req.body;
  if (!shippingAddress) {
    throw new CustomError.BadRequestError("Shipping address is required");
  }

  return shippingAddress;
};

OrderSchema.methods.fixQuantity = async function (products, Product) {
  await Promise.all(
    products.map(async (product) => {
      const tempProduct = await Product.findById(product.product);
      tempProduct.quantity += product.quantity;
      await tempProduct.save();
    })
  );
};

OrderSchema.methods.fixStatus = async function () {
  this.orderStatus = "Cancelled";
  this.paymentStatus = "Failed";
  await this.save();
};

OrderSchema.statics.getOrder = async function (id) {
  const order = await this.findById(id).populate("user", "firstName lastName");
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id: ${id}`);
  }

  return order;
};

module.exports = mongoose.model("Order", OrderSchema);
