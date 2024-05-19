const express = require("express");
const router = express.Router();
const { requireRole } = require("../../middleware/authMiddleware");
const postsController = require("../controllers/posts.controller");

router.route("/create").post(requireRole(['Admin', 'Basic']), postsController.createPost);
router.route("/delete").delete(requireRole(['Admin']), postsController.deletePost);
router.route("/get").get(postsController.getPost);
router.route("/getAllByCategoryRecent").get(postsController.getAllPostsByCategoryIdRecent);
router.route("/search").get(postsController.searchPost);
router.route('/getAll').get(postsController.getAllPosts);

module.exports = router;
