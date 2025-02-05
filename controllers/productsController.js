const Product = require("../models/Product");
const CustomError = require("../errors");
const { StatusCodes } = require("http-status-codes");

const getAllProducts = async (req, res) => {
  const result = Product.applyFilters(req.query);
  const products = await result.select("-__v");
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${id}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const createProduct = async (req, res) => {
  const { name, description, price, category, quantity } = req.body;
  const { userId } = req.user;
  const product = await Product.create({
    name,
    description,
    price,
    category,
    quantity,
    seller: userId,
  });
  res.status(StatusCodes.CREATED).json({ product });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const product = await Product.findByIdAndUpdate(
    id,
    { name, description, price },
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${id}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id, { new: true });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${id}`);
  }

  res.status(StatusCodes.OK).json({ message: "Product deleted succsesfully" });
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
