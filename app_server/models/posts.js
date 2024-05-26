/**
 * @module PostsModel
 *
 * This module defines the schema and model for the Post entity using Mongoose.
 * It includes fields for post ID, category ID, author ID, post title, content,
 * time of publication, and the number of comments.
 */

const Mongoose = require("mongoose");

const PostSchema = new Mongoose.Schema({
    postId: {
        type: Number,
        unique: true,
        required: true
    },
    categoryId: {
        type: Number,
        required: true
    },
    authorId: { // Links to the _id string of user collection in mongoDB
        type: String,
        required: true
    },
    postTitle: {
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
    numberOfComments: {
        type: Number,
        default: 0
    },
});

const Posts = Mongoose.model("posts", PostSchema);

module.exports = Posts;
