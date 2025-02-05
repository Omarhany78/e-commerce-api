const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      default: "Product description",
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
    quantity: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

ProductSchema.statics.applyFilters = function (query) {
  let { category, minPrice, maxPrice, name, sort, fields } = query;

  let queryObject = {};

  if (category) {
    queryObject.category = category;
  }

  if (minPrice || maxPrice) {
    queryObject.price = {};
    if (minPrice) queryObject.price.$gte = Number(minPrice);
    if (maxPrice) queryObject.price.$lte = Number(maxPrice);
  }

  if (name) {
    queryObject.name = { $regex: name };
  }

  let result = this.find(queryObject);

  if (sort) {
    const sortBy = sort.split(",").join(" ");
    result = result.sort(sortBy);
  }

  if (fields) {
    const selectedFields = fields.split(",").join(" ");
    result = result.select(selectedFields);
  }

  return result;
};

module.exports = mongoose.model("Product", ProductSchema);
