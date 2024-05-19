const express = require("express");
const router = express.Router();
const { requireRole } = require("../../middleware/authMiddleware");
const { createCategory, deleteCategory, getAllCategories } = require("../controllers/categories.controller");

router.route("/create").post(requireRole(["Admin"]), createCategory);
router.route("/delete").delete(requireRole(["Admin"]), deleteCategory);
router.route("/getAll").get(requireRole(["Admin", "Basic"]),getAllCategories);


module.exports = router;
