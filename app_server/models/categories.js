const Mongoose = require("mongoose");

const { Comments } = require("./comments");


const CategorySchema = new Mongoose.Schema({

    // _id internal of mongoDB

    categoryId: {
        type: Number,
        unique: true,
        required: true
    },
    categoryTitle: {
        type: String,
        required: true
    },
    categorySubtitle: {
        type: String,
        required: true
    },
    numberOfPosts: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfComments: {
        type: Number,
        required: true,
        default: 0
    },
    timeCreation: {
        type: Date,
        default: Date.now
    }
});

const Categories = Mongoose.model("categories", CategorySchema);
 
module.exports = Categories;