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
    authorId: { //Links to the _id string of user collection in mongoDB
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


//Users.updateNumberOfPosts(newPost.usernameAuthor, 1)

/*
PostSchema.statics.updateNumberOfComments = async function (postId, incrementBy) {
    try {
        const result = await this.updateOne(
            { postId: postId },
            { $inc: { numberOfComments: incrementBy } }
        );
    } catch (error) {
        console.error("Erreur lors de la mise à jour du nombre de commentaires de l'utilisateur :", error);
        throw error;
    }
};*/

//Users.updateNumberOfPosts(deletedPost.usernameAuthor, -1)

