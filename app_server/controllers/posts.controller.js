const Categories = require("../models/categories");
const Posts = require("../models/posts");
const Users = require('../models/users');
const Comments = require("../models/comments");
const commentcontroller = require("../controllers/comments.controller");
const logger = require("../../logs/winston");

exports.createPost = async (req, res, next) => {
    const { categoryId, authorId, postTitle, content } = req.body;
    try {
        const user = await Users.findOne({ _id: authorId });
        if (!user) {
            logger.error("User not found.");
            return res.status(400).json({ message: "AuthorId doesn't exists"});
        }

        const lastPost = await Posts.findOne({}, {}, { sort: { 'postId': -1 } });
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
            { _id: newPost.authorId },
            { $inc: { numberOfPosts: 1 } }
        );
        await Categories.updateOne(
            { categoryId: newPost.categoryId },
            { $inc: { numberOfPosts: 1 } }
        );
        logger.info('Post successfully created');
        return res.status(201).json({ message: "Created, with id ", id :newPost._id }); ;
    } catch (error) {
        logger.error(`Post not successfully created: ${error.message}`);
        return res.status(400).json({ message: "Error", error: error.message });
    }
};

exports.getPost = async (req, res, next) => {
    const postId = req.query.postId;
    try {
        const post = await Posts.findOne({ postId: postId });
        if (!post) {
            logger.error("Post not found");
            return res.status(404).json({ message: "Post not found" });
        }
        logger.info('Post found successfully');
        return res.status(200).json({ post });
    } catch (error) {
        logger.error(`Error finding post: ${error.message}`);
        return res.status(400).json({ message: "Error", error: error.message });
    }
};

exports.searchPost = async (req, res, next) => {
    const search = req.query.q;
    const cId = req.query.cId;
    try {
        const regex = new RegExp(search, 'i');
        const posts = await Posts.find({ postTitle: { $regex: regex } , categoryId: cId });
        if (!posts || posts.length === 0) {
            logger.error("No posts found");
            return res.status(404).json({ message: "No posts found." });
        }
        logger.info('Posts found successfully');
        return res.status(200).json({ posts });
    } catch (error) {
        logger.error(`Error finding posts: ${error.message}`);
        return res.status(400).json({ message: "Error", error: error.message });
    }
};


exports.getAllPostsByCategoryIdRecent = async (req, res, next) => {
    const categoryId = req.query.catId;
    try {
        const posts = await Posts.find({ categoryId: categoryId }).sort({ timePublication: -1 });
        if (!posts || posts.length === 0) {
            logger.error("No posts found for the specified category.");
            return res.status(404).json({ message: "No posts found for the specified category." });
        }
        logger.info('Posts found successfully');
        return res.status(200).json({ posts });
    } catch (error) {
        logger.error(`Error finding posts: ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


//This method is supposed to be available only for admin roles.
exports.deletePost = async (req, res, next) => {
    const postId = req.query.postId;
    try {
        const deletedPost = await Posts.findOneAndDelete({ postId: postId });
        if (!deletedPost) {
            logger.error("Post not found");
            return res.status(404).json({ message: "Post not found" });
        }
        await Users.updateOne(
            { _id: deletedPost.authorId },
            { $inc: { numberOfPosts: -1 } }
        );
        await Categories.updateOne(
            { categoryId: deletedPost.categoryId },
            { $inc: { numberOfPosts: -1 } }
        );
        const comments = await Comments.find({ postId: postId });
        for (const comment of comments) {
            await commentcontroller.deleteComment_(comment.commentId);
        }
        logger.info('Post successfully deleted');
        return res.status(200).json({ 
            message: "Post sucesfully deleted",
            post: deletedPost
         });

    } catch (error) {
        logger.error(`Post not successfully deleted: ${error.message}`);
        return res.status(400).json({ message: "Error", error: error.message });
    }

};

//this method was created for categories.controller. with the purpose of deleting all the posts it has when any category is deleted.
exports.deletePost_ = async (postId) => {
    try {
        const deletedPost = await Posts.findOneAndDelete({ postId: postId });
        if (!deletedPost) {
            logger.error("Post not found");
            throw new Error("Post not found");
        }
        await Users.updateOne(
            { _id: deletedPost.authorId },
            { $inc: { numberOfPosts: -1 } }
        );
        await Categories.updateOne(
            { categoryId: deletedPost.categoryId },
            { $inc: { numberOfPosts: -1 } }
        );
        const comments = await Comments.find({ postId: postId });
        for (const comment of comments) {
            await commentcontroller.deleteComment_(comment.commentId);
        }
        logger.info('Post successfully deleted');
        return { success: true, message: "Post successfully deleted" };
    } catch (error) {
        logger.error(`Post not successfully deleted: ${error.message}`);
        throw new Error(error.message);
    }
};


exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Posts.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};