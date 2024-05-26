/**
 * @module RecipeModel
 *
 * This module defines the schema and model for the Recipe entity using Mongoose.
 * It includes fields for name, description, image, ingredients, instructions,
 * nutritional values, allergen tags, and diet type.
 */

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: String,
    image: String, // URL for the image
    ingredients: [{
        name: String,
        amount: Number,
        unit: String
    }],
    instructions: [{
        description: String,
        image: String // URL for the image
    }],
    nutritionalValues: {
        calories: Number,
        dailyValue: Number,
        servingSize: Number
    },
    allergenTags: [String],
    dietType: String
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
