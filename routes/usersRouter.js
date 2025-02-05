const express = require("express");
const router = express.Router();

const {
  deleteCurrentUser,
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateCurrentUser,
  makeUserAdmin,
  deleteUser,
} = require("../controllers/usersController");
const { authorizePermission } = require("../middlewares/authenticate");

router.get("/", authorizePermission("admin"), getAllUsers);
router.get("/me", getCurrentUser);
router.get("/:id", authorizePermission("admin"), getSingleUser);
router.patch("/me", updateCurrentUser);
router.get("/role/:id", authorizePermission("admin"), makeUserAdmin);
router.delete("/me", deleteCurrentUser);
router.delete("/:id", authorizePermission("admin"), deleteUser);

module.exports = router;
