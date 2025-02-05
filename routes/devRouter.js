const express = require("express");
const router = express.Router();

const {
  deleteAllCarts,
  deleteAllOrders,
  deleteAllProducts,
  deleteAllUsers,
  getAllUsers,
  getAllOrders,
} = require("../controllers/devController");

router.delete("/carts", deleteAllCarts);
router.delete("/orders", deleteAllOrders);
router.delete("/products", deleteAllProducts);
router.delete("/users", deleteAllUsers);

router.get("/users", getAllUsers);
router.get("/orders", getAllOrders);

module.exports = router;
