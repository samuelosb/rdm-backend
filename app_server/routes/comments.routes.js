/**
 * @module CommentsRoutes
 *
 * This module defines the routes for handling comment-related operations.
 * It includes routes for creating, retrieving, and deleting comments.
 */

const express = require("express");
const router = express.Router();
const {requireRole} = require("../../middleware/authMiddleware");
const {
    createComment,
    getAllCommsByPostRecent,
    deleteComment,
    getAllComments
} = require("../controllers/comments.controller");

// Route to create a new comment (accessible to Admin and Basic roles)
router.route("/create").post(requireRole(["Admin", "Basic"]), createComment);

// Route to delete a comment (accessible to Admin role)
router.route("/delete").delete(requireRole(["Admin"]), deleteComment);

// Route to get all comments by post, sorted by most recent (accessible to public)
router.route("/getAllCommsByPostRecent").get(getAllCommsByPostRecent);

// Route to get all comments (accessible to Admin and Basic roles)
router.route("/getAll").get(requireRole(["Admin", "Basic"]), getAllComments);

module.exports = router;
