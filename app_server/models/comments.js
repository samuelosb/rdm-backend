/**
 * @module CommentsModel
 *
 * This module defines the schema and model for the Comment entity using Mongoose.
 * It includes fields for comment ID, post ID, author ID, content, and time of publication.
 */

const Mongoose = require("mongoose");

const CommentSchema = new Mongoose.Schema({
    commentId: {
        type: Number,
        unique: true,
        required: true
    },
    postId: {
        type: Number,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timePublication: {
        type: Date,
        default: Date.now
    },
});

const Comments = Mongoose.model("comments", CommentSchema);

module.exports = Comments;
