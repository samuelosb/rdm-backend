/**
 * @module Rating
 *
 * This module defines the Rating model for storing user ratings for recipes in the MongoDB database.
 * It uses Mongoose to define the schema and model for ratings, ensuring data validation and consistency.
 */

const mongoose = require('mongoose');

// Define the Rating schema
const RatingSchema = new mongoose.Schema({
    recipeId: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    rating: {
        type: Number,
        min: 0.5,
        max: 5,
        required: true,
        validate: {
            validator: function (value) {
                // Check if the value is an increment of 0.5
                return value % 0.5 === 0;
            },
            message: props => `${props.value} is not a valid rating! Rating must be in increments of 0.5.`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Create the Rating model from the schema
const Rating = mongoose.model('ratings', RatingSchema);

module.exports = Rating;
