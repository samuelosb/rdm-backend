/**
 * @module CategoriesRoutes
 *
 * This module defines the routes for handling category-related operations.
 * It includes routes for creating, deleting, and retrieving categories.
 */

const express = require("express");
const router = express.Router();
const { requireRole } = require("../../middleware/authMiddleware");
const { createCategory, deleteCategory, getAllCategories } = require("../controllers/categories.controller");

// Route to create a new category (accessible to Admin role)
router.route("/create").post(requireRole(["Admin"]), createCategory);

// Route to delete a category (accessible to Admin role)
router.route("/delete").delete(requireRole(["Admin"]), deleteCategory);

// Route to get all categories (accessible to Admin and Basic roles)
router.route("/getAll").get(requireRole(["Admin", "Basic"]), getAllCategories);

module.exports = router;
