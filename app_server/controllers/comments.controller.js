const Categories = require("../models/categories");
const Posts = require("../models/posts");
const Users = require("../models/users");
const Comments = require("../models/comments");
const logger = require('../../logs/winston');

exports.createComment = async (req, res, next) => {
  try {
    const { postId, authorId, content } = req.body;
    const lastComment = await Comments.findOne().sort({ commentId: -1 });
    let commentId = 1; 
    if (lastComment) {
      commentId = lastComment.commentId + 1;
    }
    const post = await Posts.findOne({ postId });
    const user = await Users.findOne({ _id: authorId });
    if (!post) {
      logger.error('Post not found.');
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }
    if (!user) {
      logger.error('User not found.');
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    const newComment = new Comments({
      commentId,
      postId,
      authorId,
      content,
    });
    await newComment.save();
    await Users.updateOne(
      { _id: newComment.authorId },
      { $inc: { numberOfComments: 1 } }
    );
    await Posts.updateOne(
      { postId: newComment.postId },
      { $inc: { numberOfComments: 1 } }
    );
    logger.info('New comment created successfully.');
    res.status(200).json({ success: true, comment: newComment });
  } catch (error) {
    logger.error(`Error creating comment: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllCommsByPostRecent = async (req, res, next) => {
  const postId = req.query.postId;
  try {
    const comms = await Comments.find({ postId: postId }).sort({
      timePublication: -1,
    });
    if (comms.length === 0) {
      logger.error('No comments found for this post.');
      return res.status(404).json({ message: "No comments found for this post." });
    }
    logger.info('Comments found successfully.');
    return res.status(200).json({ comms });
  } catch (error) {
    logger.error(`Error getting comments: ${error.message}`);
    return res.status(400).json({ message: "Error", error: error.message });
  }
};


exports.deleteComment = async (req, res, next) => {
  try {
    const commentId = req.query.commentId;
    const comment = await Comments.findOneAndDelete({ commentId });
    if (!comment) {
      return res
        logger.error('Comment not found.');
        return res.status(404).json({ success: false, error: "Comment not found." });
    }
    const postId = comment.postId;
    const authorId = comment.authorId;
    // Update post, user, and category
    await Promise.all([
      Posts.updateOne({ postId }, { $inc: { numberOfComments: -1 } }),
      Users.updateOne({ _id: authorId }, { $inc: { numberOfComments: -1 } }),
      Categories.updateOne({ categoryId: comment.categoryId }, { $inc: { numberOfComments: -1 } })
    ]);
    return res
      logger.info('Comment successfully deleted.');
      return res.status(200).json({ success: true, message: "Comment successfully deleted." });
  } catch (error) {
    logger.error(`Error deleting comment: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

//this method for post controller
exports.deleteComment_ = async (commentId) => {
  try {
    const comment = await Comments.findOneAndDelete({ commentId });
    if (!comment) {
      logger.error('Comment not found.');
      return { success: false, error: "Comment not found." };
    }
    const postId = comment.postId;
    const authorId = comment.authorId;
    await Promise.all([
      Posts.updateOne({ postId }, { $inc: { numberOfComments: -1 } }),
      Users.updateOne({ _id: authorId }, { $inc: { numberOfComments: -1 } }),
      Categories.updateOne({ categoryId: comment.categoryId }, { $inc: { numberOfComments: -1 } })
    ]);
    logger.info('Comment successfully deleted.');
    return { success: true, message: "Comment successfully deleted" };
  } catch (error) {
    logger.error(`Error deleting comment: ${error.message}`);
    return { success: false, error: error.message };
  }
};


exports.getAllComments = async (req, res) => {
  try {
      const comments = await Comments.find();
      res.status(200).json(comments);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};