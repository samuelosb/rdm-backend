/**
 * @module CategoriesController
 *
 * This module defines the controller for handling category-related operations.
 * It includes methods for creating, deleting, and retrieving categories.
 */

const Categories = require("../models/categories");
const Posts = require("../models/posts");
const PostsController = require("../controllers/posts.controller");
const logger = require("../../logs/winston");

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next middleware function
 */
exports.createCategory = async (req, res, _next) => {
    const {categoryTitle, categorySubtitle} = req.body;
    try {
        // Retrieve the last categoryId
        const lastCategory = await Categories.findOne({}, {}, {sort: {'categoryId': -1}});
        let categoryId = 1; // Default value if no category exists

        if (lastCategory) {
            categoryId = lastCategory.categoryId + 1;
        }

        const newCategory = await Categories.create({
            categoryId: categoryId,
            categoryTitle: categoryTitle,
            categorySubtitle: categorySubtitle
        });
        logger.info('Category successfully created', {categoryId: newCategory.categoryId});
        return res.status(201).json({
            message: "Category successfully created",
            category: newCategory.categoryId,
        });
    } catch (error) {
        logger.error('Category creation failed', {error: error.message});
        return res.status(400).json({message: "Error", error: error.message});
    }
};

/**
 * Delete a category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next middleware function
 */
exports.deleteCategory = async (req, res, _next) => {
    const categoryId = req.query.categoryId;
    try {
        const deletedCategory = await Categories.findOneAndDelete({categoryId: categoryId});
        if (!deletedCategory) {
            logger.warn('Category does not exist', {categoryId});
            return res.status(404).json({message: "Category does not exist."});
        }
        const posts = await Posts.find({categoryId: categoryId});
        for (const post of posts) {
            await PostsController.deletePost_(post.postId);
        }
        logger.info('Category successfully deleted', {categoryId, deletedPosts: posts.length});
        return res.status(200).json({
            message: "Category successfully deleted",
            category: deletedCategory._id,
            deletedPosts: posts
        });
    } catch (error) {
        logger.error('Category deletion failed', {categoryId, error: error.message});
        return res.status(500).json({message: "Error", error: error.message});
    }
};

/**
 * Get all categories
 * @param {Object} _req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next middleware function
 */
exports.getAllCategories = async (_req, res, _next) => {
    try {
        const categories = await Categories.find({});
        logger.info('Categories retrieved successfully', {count: categories.length});
        return res.status(200).json({categories});
    } catch (error) {
        logger.error('Error retrieving categories', {error: error.message});
        return res.status(400).json({message: "Error", error: error.message});
    }
};


exports.getCategories = async (req, res) => {
    try {
        const categories = await Categories.find();
        res.status(200).json(categories);
        logger.info("Fetched all categories successfully", { endpoint: 'getCategories', resultCount: categories.length });
    } catch (error) {
        logger.error("Failed to fetch categories", { endpoint: 'getCategories', error: error.message });
        res.status(500).json({ message: "Failed to fetch categories. Please try again later." });
    }
};