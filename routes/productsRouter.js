const express = require("express");
const router = express.Router();

const {
  authorizePermission,
  authenticate,
} = require("../middlewares/authenticate");
const {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} = require("../controllers/productsController");

router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.post("/", authenticate, authorizePermission("admin"), createProduct);
router.patch("/:id", authenticate, authorizePermission("admin"), updateProduct);
router.delete(
  "/:id",
  authenticate,
  authorizePermission("admin"),
  deleteProduct
);
module.exports = router;
