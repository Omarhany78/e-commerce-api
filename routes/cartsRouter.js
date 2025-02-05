const express = require("express");
const router = express.Router();

const {
  addItem,
  createCart,
  emptyCart,
  getCart,
  removeItem,
  updateItemQuantity,
} = require("../controllers/cartsController");

router.post("/", createCart);
router.get("/", getCart);
router.post("/add", addItem);
router.patch("/update", updateItemQuantity);
router.delete("/remove", removeItem);
router.delete("/empty", emptyCart);

module.exports = router;
