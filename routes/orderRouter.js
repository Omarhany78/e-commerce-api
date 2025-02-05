const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder,
  getOrderHistory,
} = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/:id", getOrder);
router.get("/", getUserOrders);
router.delete("/:id", cancelOrder);
router.get("/history", getOrderHistory);

module.exports = router;
