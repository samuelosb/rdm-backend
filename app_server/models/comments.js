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

module.exports =  Comments ;

