/**
 * @module CommentsController
 *
 * This module defines the controller for handling comment-related operations.
 * It includes methods for creating, retrieving, deleting comments, and fetching all comments.
 */

const Categories = require("../models/categories");
const Posts = require("../models/posts");
const Users = require("../models/users");
const Comments = require("../models/comments");
const logger = require('../../logs/winston');

/**
 * Create a new comment on a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createComment = async (req, res) => {
    try {
        const {postId, authorId, content} = req.body;
        const lastComment = await Comments.findOne().sort({commentId: -1});
        let commentId = 1;
        if (lastComment) {
            commentId = lastComment.commentId + 1;
        }
        const post = await Posts.findOne({postId});
        const user = await Users.findOne({_id: authorId});
        if (!post) {
            logger.warn('Post not found', {postId});
            return res.status(404).json({success: false, error: 'Post not found.'});
        }
        if (!user) {
            logger.warn('User not found', {authorId});
            return res.status(404).json({success: false, error: 'User not found.'});
        }
        const newComment = new Comments({
            commentId,
            postId,
            authorId,
            content,
        });
        await newComment.save();
        await Users.updateOne(
            {_id: newComment.authorId},
            {$inc: {numberOfComments: 1}}
        );
        await Posts.updateOne(
            {postId: newComment.postId},
            {$inc: {numberOfComments: 1}}
        );
        await Categories.updateOne(
            {categoryId : post.categoryId},
            {$inc: {numberOfComments: 1}}
        );
        logger.info('New comment created successfully', {commentId, postId, authorId});
        res.status(200).json({success: true, comment: newComment});
    } catch (error) {
        logger.error('Error creating comment', {error: error.message});
        res.status(500).json({success: false, error: error.message});
    }
};

/**
 * Get all comments for a post, sorted by most recent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllCommsByPostRecent = async (req, res) => {
    const postId = req.query.postId;
    try {
        const comms = await Comments.find({postId: postId}).sort({
            timePublication: 1,
        });
        if (comms.length === 0) {
            logger.warn('No comments found for this post', {postId});
            return res.status(200).json({message: "No comments found for this post."});
        }
        logger.info('Comments retrieved successfully', {postId, resultCount: comms.length});
        return res.status(200).json({comms});
    } catch (error) {
        logger.error('Error retrieving comments', {postId, error: error.message});
        return res.status(400).json({message: "Error", error: error.message});
    }
};

/**
 * Delete a comment by commentId (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.query.commentId;
        const comment = await Comments.findOneAndDelete({commentId});
        if (!comment) {
            logger.warn('Comment not found', {commentId});
            return res.status(404).json({success: false, error: "Comment not found."});
        }
        const postId = comment.postId;
        const authorId = comment.authorId;
        const post = await Posts.findOne({ postId });
        await Promise.all([
            Posts.updateOne({postId}, {$inc: {numberOfComments: -1}}),
            Users.updateOne({_id: authorId}, {$inc: {numberOfComments: -1}}),
            Categories.updateOne({categoryId: post.categoryId}, {$inc: {numberOfComments: -1}})
        ]);
        logger.info('Comment successfully deleted', {commentId, postId});
        return res.status(200).json({success: true, message: "Comment successfully deleted."});
    } catch (error) {
        logger.error('Error deleting comment', {commentId, error: error.message});
        return res.status(500).json({success: false, error: error.message});
    }
};

/**
 * Delete a comment by commentId (Internal use)
 * @param {String} commentId - ID of the comment to delete
 */
exports.deleteComment_ = async (commentId) => {
    try {
        const comment = await Comments.findOneAndDelete({commentId});
        if (!comment) {
            logger.warn('Comment not found', {commentId});
            return {success: false, error: "Comment not found."};
        }
        const postId = comment.postId;
        const authorId = comment.authorId;
        const post = await Posts.findOne({ postId });
        await Promise.all([
            Posts.updateOne({postId}, {$inc: {numberOfComments: -1}}),
            Users.updateOne({_id: authorId}, {$inc: {numberOfComments: -1}}),
            Categories.updateOne({categoryId: post.categoryId}, {$inc: {numberOfComments: -1}})
        ]);
        logger.info('Comment successfully deleted', {commentId, postId});
        return {success: true, message: "Comment successfully deleted"};
    } catch (error) {
        logger.error('Error deleting comment', {commentId, error: error.message});
        return {success: false, error: error.message};
    }
};

/**
 * Get all comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comments.find();
        res.status(200).json(comments);
        logger.info('All comments retrieved', {count: comments.length});
    } catch (error) {
        logger.error('Error retrieving all comments', {error: error.message});
        res.status(500).json({message: error.message});
    }
};
