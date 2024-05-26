/**
 * @module PostsRoutes
 *
 * This module defines the routes for handling post-related operations.
 * It includes routes for creating, retrieving, searching, and deleting posts,
 * as well as fetching the latest or most commented posts.
 */

const express = require("express");
const router = express.Router();
const {requireRole} = require("../../middleware/authMiddleware");
const postsController = require("../controllers/posts.controller");

// Define the routes for the posts
router.route("/create").post(requireRole(['Admin', 'Basic']), postsController.createPost);
router.route("/delete").delete(requireRole(['Admin']), postsController.deletePost);
router.route("/get").get(postsController.getPost);
router.route("/getAllByCategoryRecent").get(postsController.getAllPostsByCategoryIdRecent);
router.route("/search").get(postsController.searchPost);
router.route('/getAll').get(postsController.getAllPosts);
router.route('/latest').get(postsController.getLatestPosts);
router.route('/most-commented').get(postsController.getMostCommentedPosts);

module.exports = router;
