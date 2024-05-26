/**
 * @module PostsController
 *
 * This module defines the controller for handling post-related operations.
 * It includes methods for creating, retrieving, searching, deleting posts, and fetching latest or most commented posts.
 */

const Categories = require("../models/categories");
const Posts = require("../models/posts");
const Users = require('../models/users');
const Comments = require("../models/comments");
const commentcontroller = require("../controllers/comments.controller");
const logger = require("../../logs/winston");

/**
 * Create a new post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.createPost = async (req, res, next) => {
    const {categoryId, authorId, postTitle, content} = req.body;
    try {
        const user = await Users.findOne({_id: authorId});
        if (!user) {
            logger.error("User not found.");
            return res.status(400).json({message: "AuthorId doesn't exist"});
        }

        const lastPost = await Posts.findOne({}, {}, {sort: {'postId': -1}});
        let postId = 1;

        if (lastPost) {
            postId = lastPost.postId + 1;
        }
        const newPost = await Posts.create({
            categoryId: categoryId,
            authorId: authorId,
            postId: postId,
            postTitle: postTitle,
            content: content
        });
        await Users.updateOne(
            {_id: newPost.authorId},
            {$inc: {numberOfPosts: 1}}
        );
        await Categories.updateOne(
            {categoryId: newPost.categoryId},
            {$inc: {numberOfPosts: 1}}
        );
        logger.info('Post successfully created');
        return res.status(201).json({message: "Created, with id ", id: newPost._id});
    } catch (error) {
        logger.error(`Post not successfully created: ${error.message}`);
        return res.status(400).json({message: "Error", error: error.message});
    }
};

/**
 * Get a post by postId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getPost = async (req, res, next) => {
    const postId = req.query.postId;
    try {
        const post = await Posts.findOne({postId: postId});
        if (!post) {
            logger.error("Post not found");
            return res.status(404).json({message: "Post not found"});
        }
        logger.info('Post found successfully');
        return res.status(200).json({post});
    } catch (error) {
        logger.error(`Error finding post: ${error.message}`);
        return res.status(400).json({message: "Error", error: error.message});
    }
};

/**
 * Search for posts based on a query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.searchPost = async (req, res, next) => {
    const search = req.query.q;
    const cId = req.query.cId;
    try {
        const regex = new RegExp(search, 'i');
        const posts = await Posts.find({postTitle: {$regex: regex}, categoryId: cId});
        if (!posts || posts.length === 0) {
            logger.error("No posts found");
            return res.status(404).json({message: "No posts found."});
        }
        logger.info('Posts found successfully');
        return res.status(200).json({posts});
    } catch (error) {
        logger.error(`Error finding posts: ${error.message}`);
        return res.status(400).json({message: "Error", error: error.message});
    }
};

/**
 * Get all posts in a category, sorted by most recent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAllPostsByCategoryIdRecent = async (req, res, next) => {
    const categoryId = req.query.catId;
    try {
        const posts = await Posts.find({categoryId: categoryId}).sort({timePublication: -1});
        if (!posts || posts.length === 0) {
            logger.error("No posts found for the specified category.");
            return res.status(404).json({message: "No posts found for the specified category."});
        }
        logger.info('Posts found successfully');
        return res.status(200).json({posts});
    } catch (error) {
        logger.error(`Error finding posts: ${error.message}`);
        return res.status(500).json({message: "Internal Server Error", error: error.message});
    }
};

/**
 * Delete a post by postId (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deletePost = async (req, res, next) => {
    const postId = req.query.postId;
    try {
        const deletedPost = await Posts.findOneAndDelete({postId: postId});
        if (!deletedPost) {
            logger.error("Post not found");
            return res.status(404).json({message: "Post not found"});
        }
        await Users.updateOne(
            {_id: deletedPost.authorId},
            {$inc: {numberOfPosts: -1}}
        );
        await Categories.updateOne(
            {categoryId: deletedPost.categoryId},
            {$inc: {numberOfPosts: -1}}
        );
        const comments = await Comments.find({postId: postId});
        for (const comment of comments) {
            await commentcontroller.deleteComment_(comment.commentId);
        }
        logger.info('Post successfully deleted');
        return res.status(200).json({
            message: "Post successfully deleted",
            post: deletedPost
        });

    } catch (error) {
        logger.error(`Post not successfully deleted: ${error.message}`);
        return res.status(400).json({message: "Error", error: error.message});
    }
};

/**
 * Delete a post by postId (Internal use)
 * @param {String} postId - ID of the post to delete
 */
exports.deletePost_ = async (postId) => {
    try {
        const deletedPost = await Posts.findOneAndDelete({postId: postId});
        if (!deletedPost) {
            logger.error("Post not found");
            throw new Error("Post not found");
        }
        await Users.updateOne(
            {_id: deletedPost.authorId},
            {$inc: {numberOfPosts: -1}}
        );
        await Categories.updateOne(
            {categoryId: deletedPost.categoryId},
            {$inc: {numberOfPosts: -1}}
        );
        const comments = await Comments.find({postId: postId});
        for (const comment of comments) {
            await commentcontroller.deleteComment_(comment.commentId);
        }
        logger.info('Post successfully deleted');
        return {success: true, message: "Post successfully deleted"};
    } catch (error) {
        logger.error(`Post not successfully deleted: ${error.message}`);
        throw new Error(error.message);
    }
};

/**
 * Get all posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Posts.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

/**
 * Get the latest forum posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This method finds the latest 35 posts sorted by publication time.
 */
exports.getLatestPosts = async (req, res) => {
    try {
        const posts = await Posts.find().sort({timePublication: -1}).limit(35); // Adjust the limit as needed
        if (!posts || posts.length === 0) {
            logger.error("No posts found");
            return res.status(404).json({message: "No posts found"});
        }
        logger.info('Latest posts found successfully');
        return res.status(200).json({posts});
    } catch (error) {
        logger.error(`Error fetching latest posts: ${error.message}`);
        return res.status(500).json({message: "Internal Server Error", error: error.message});
    }
};

/**
 * Get the most commented forum posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This method finds the 35 most commented posts sorted by the number of comments.
 */
exports.getMostCommentedPosts = async (req, res) => {
    try {
        const posts = await Posts.find().sort({numberOfComments: -1}).limit(35); // Adjust the limit as needed
        if (!posts || posts.length === 0) {
            logger.error("No posts found");
            return res.status(404).json({message: "No posts found"});
        }
        logger.info('Most commented posts found successfully');
        return res.status(200).json({posts});
    } catch (error) {
        logger.error(`Error fetching most commented posts: ${error.message}`);
        return res.status(500).json({message: "Internal Server Error", error: error.message});
    }
};
