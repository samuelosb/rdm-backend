/**
 * @module CategoriesModel
 *
 * This module defines the Mongoose schema and model for categories.
 * It includes fields for category ID, title, subtitle, number of posts, number of comments, and creation time.
 */

const Mongoose = require("mongoose");

const CategorySchema = new Mongoose.Schema({
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
