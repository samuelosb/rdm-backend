const mongoose = require('mongoose');

const AverageRatingSchema = new mongoose.Schema({
    recipeId: {
        type: String,
        required: true,
        unique: true
    },
    averageRating: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfRatings: {
        type: Number,
        required: true,
        default: 0
    }
});

const AverageRating = mongoose.model('averageRatings', AverageRatingSchema);

module.exports = AverageRating;
