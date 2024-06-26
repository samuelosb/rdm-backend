/**
 * @module RatingController
 *
 * This module defines the controller for handling rating-related operations.
 * It includes methods for rating a recipe, getting average ratings, recalculating average ratings,
 * fetching top-rated recipes, and getting user-specific ratings.
 */

const Rating = require('../models/rating');
const AverageRating = require('../models/averageRating');
const axios = require('axios');
const logger = require('../../logs/winston');

/**
 * Rate a recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function allows a user to rate a recipe. It checks if the user has already rated the recipe
 * and updates the rating if it exists, or creates a new rating if it does not. It also recalculates
 * the average rating for the recipe.
 */
exports.rateRecipe = async (req, res) => {
    const {recipeId, userId, rating} = req.body;

    try {
        // Check if the user has already rated this recipe
        let existingRating = await Rating.findOne({recipeId, userId});

        if (existingRating) {
            // Update the existing rating
            existingRating.rating = rating;
            await existingRating.save();
        } else {
            // Create a new rating
            const newRating = new Rating({recipeId, userId, rating});
            await newRating.save();
        }

        // Recalculate average rating
        await recalculateAverageRating(recipeId);

        res.status(200).json({message: 'Rating submitted successfully'});
        logger.info('Rating submitted successfully', {recipeId, userId, rating});
    } catch (error) {
        logger.error('Error submitting rating', {recipeId, userId, error: error.message});
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

/**
 * Recalculate the average rating for a recipe
 * @param {String} recipeId - ID of the recipe
 * This function recalculates the average rating for a given recipe based on all its ratings.
 */
const recalculateAverageRating = async (recipeId) => {
    const ratings = await Rating.find({recipeId});

    if (ratings.length === 0) {
        return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    const averageRatingDoc = await AverageRating.findOne({recipeId});

    if (averageRatingDoc) {
        averageRatingDoc.averageRating = averageRating;
        averageRatingDoc.numberOfRatings = ratings.length;
        await averageRatingDoc.save();
    } else {
        const newAverageRating = new AverageRating({recipeId, averageRating, numberOfRatings: ratings.length});
        await newAverageRating.save();
    }
    logger.info('Average rating recalculated', {recipeId, averageRating});
};

/**
 * Recalculate average ratings for all recipes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function recalculates the average ratings for all recipes in the database.
 */
exports.recalculateAllAverageRatings = async (req, res) => {
    try {
        const recipes = await Rating.distinct('recipeId');

        for (const recipeId of recipes) {
            await recalculateAverageRating(recipeId);
        }

        res.status(200).json({message: 'All average ratings recalculated successfully.'});
        logger.info('All average ratings recalculated');
    } catch (error) {
        logger.error('Error recalculating all average ratings', {error: error.message});
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

/**
 * Get the top-rated recipes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the top-rated recipes based on their average ratings.
 */
exports.getTopRatedRecipes = async (req, res) => {
    try {
        const topRatings = await AverageRating.find()
            .sort({averageRating: -1})
            .limit(20);

        if (topRatings.length === 0) {
            return res.status(404).json({message: 'No top-rated recipes found.'});
        }

        const topRecipes = await Promise.all(
            topRatings.map(async (rating) => {
                const recipeId = rating.recipeId;
                try {
                    const response = await axios.get(
                        `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}`
                    );
                    return {
                        ...response.data.recipe,
                        averageRating: rating.averageRating,
                        numberOfRatings: rating.numberOfRatings
                    };
                } catch (error) {
                    logger.error(`Error fetching recipe with ID ${recipeId}`, {error: error.message});
                    return null;
                }
            })
        );

        const filteredTopRecipes = topRecipes.filter(recipe => recipe !== null);

        res.status(200).json(filteredTopRecipes);
        logger.info('Top-rated recipes retrieved', {count: filteredTopRecipes.length});
    } catch (error) {
        logger.error('Error fetching top-rated recipes', {error: error.message});
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

/**
 * Get the user's rating for a specific recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the rating given by a specific user for a specific recipe.
 */
exports.getUserRating = async (req, res) => {
    const {recipeId, userId} = req.query;

    if (!recipeId) {
        return res.status(400).json({message: 'Recipe ID is required.'});
    }

    try {
        const rating = await Rating.findOne({recipeId, userId});

        const response = {
            userRating: rating ? rating.rating : null,
            message: rating ? 'User rating retrieved' : 'No rating found for this recipe by this user.'
        };

        res.status(200).json(response);
        logger.info('User rating retrieved', {recipeId, userId});
    } catch (error) {
        logger.error('Error fetching user rating', {recipeId, userId, error: error.message});
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

/**
 * Get the average rating of a recipe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the average rating for a specified recipe.
 */
exports.getAverageRating = async (req, res) => {
    const {recipeId} = req.query;

    if (!recipeId) {
        return res.status(400).json({message: 'Recipe ID is required.'});
    }

    try {
        const averageRatingDoc = await AverageRating.findOne({recipeId});

        if (!averageRatingDoc) {
            return res.status(200).json({
                averageRating: 0,
                numberOfRatings: 0
            });
        }

        res.status(200).json({
            averageRating: averageRatingDoc.averageRating,
            numberOfRatings: averageRatingDoc.numberOfRatings
        });
        logger.info('Average rating retrieved', {recipeId, averageRating: averageRatingDoc.averageRating});
    } catch (error) {
        logger.error('Error retrieving average rating', {recipeId, error: error.message});
        res.status(500).json({message: 'Server error', error: error.message});
    }
};
