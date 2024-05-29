/**
 * @module RecipesController
 *
 * This module defines the controller for handling recipe-related operations.
 * It includes methods for searching recipes, getting a specific recipe, adding/removing favorites,
 * managing week menus, and fetching favorite recipes.
 */

const axios = require("axios");
const User = require("../models/users");
const AverageRating = require("../models/averageRating");
const logger = require("../../logs/winston");

/**
 * Search for recipes based on various query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function builds the API URL based on the query parameters and fetches the recipes from the Edamam API.
 */
exports.search = async (req, res) => {
    let q = req.query.q;
    let cuisineType = req.query.cuisineType;
    let dishType = req.query.dishType;
    let mealType = req.query.mealType;
    let health = req.query.health;
    let diet = req.query.diet;
    let ingr = req.query.ingr;
    let calories = req.query.calories;
    let time = req.query.time;

    try {
        let apiUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${q}&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}`;

        if (cuisineType) apiUrl += `&cuisineType=${encodeURIComponent(cuisineType)}`;
        if (dishType) apiUrl += `&dishType=${encodeURIComponent(dishType)}`;
        if (mealType) apiUrl += `&mealType=${encodeURIComponent(mealType)}`;
        if (health) apiUrl += `&health=${encodeURIComponent(health)}`;
        if (diet) apiUrl += `&diet=${encodeURIComponent(diet)}`;
        if (ingr) apiUrl += `&ingr=${encodeURIComponent(ingr)}`;
        if (calories) apiUrl += `&calories=${encodeURIComponent(calories)}`;
        if (time) apiUrl += `&time=${encodeURIComponent(time)}`;

        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);
        logger.info("Recipes fetched successfully", {endpoint: 'search', query: req.query});
    } catch (error) {
        logger.error("Error fetching recipes", {endpoint: 'search', error: error.message});
        res.status(400).json({message: "Error fetching recipes. Please try again later.", error: error.message});
    }
};

/**
 * Fetch a list of random recipes from the Edamam API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function performs an HTTP GET request to retrieve a set of random recipes.
 */
exports.searchRandomRecipes = async (req, res) => {
    try {
        const randomQuery = 'random'; // Define the query term for random recipes
        const apiUrl = `https://api.edamam.com/api/recipes/v2?type=public&q=${randomQuery}&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}`;

        const response = await axios.get(apiUrl);
        res.status(200).json(response.data);
        logger.info("Random recipes fetched successfully", {endpoint: 'searchRandomRecipes'});
    } catch (error) {
        logger.error("Error fetching random recipes", {endpoint: 'searchRandomRecipes', error: error.message});
        res.status(500).json({message: "Error fetching random recipes. Please try again later.", error: error.message});
    }
};

/**
 * Get a specific recipe by ID from the Edamam API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves a recipe by its ID.
 */
exports.getRecipe = async (req, res) => {
    const recipeId = req.query.id;

    try {
        const response = await axios.get(
            `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}`
        );
        res.status(200).json(response.data);
        logger.info("Recipe fetched successfully", {endpoint: 'getRecipe', recipeId});
    } catch (error) {
        logger.error("Error fetching recipe", {endpoint: 'getRecipe', recipeId, error: error.message});
        res.status(404).json({
            message: `Error: the Edamam API couldn't get the recipe with id: ${recipeId}`,
            error: error.message
        });
    }
};

/**
 * Add a recipe to the user's favorite list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function adds a recipe to the user's favorite list.
 */
exports.addToFavorite = async (req, res) => {
    const {userId, recipeId} = req.body;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }

        user.favList.push({recipeId: recipeId, addedDate: Date.now()});
        await user.save();
        res.status(200).json({message: "Recipe added to favorites successfully", recipeId});
        logger.info("Recipe added to favorites", {endpoint: 'addToFavorite', userId, recipeId});
    } catch (error) {
        logger.error("Error adding recipe to favorites", {
            endpoint: 'addToFavorite',
            userId,
            recipeId,
            error: error.message
        });
        res.status(500).json({
            message: "Error adding recipe to favorites. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Remove a recipe from the user's favorite list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function removes a recipe from the user's favorite list.
 */
exports.removeFromFavorite = async (req, res) => {
    const {userId, recipeId} = req.body;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }

        user.favList.pull({recipeId: recipeId});
        await user.save();
        res.status(204).json({message: "Recipe removed from favorites successfully", recipeId});
        logger.info("Recipe removed from favorites", {endpoint: 'removeFromFavorite', userId, recipeId});
    } catch (error) {
        logger.error("Error removing recipe from favorites", {
            endpoint: 'removeFromFavorite',
            userId,
            recipeId,
            error: error.message
        });
        res.status(500).json({
            message: "Error removing recipe from favorites. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Get the user's favorite recipe list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the user's favorite recipe list.
 */
exports.getFavouriteRecipeList = async (req, res) => {
    const uId = req.query.id;

    if (!uId) {
        return res.status(400).json({message: "User ID is required"});
    }

    try {
        const user = await User.findById(uId);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const favList = user.favList;

        // Fetch average ratings for the favorite recipes
        const recipeIds = favList.map(fav => fav.recipeId);
        const averageRatings = await AverageRating.find({recipeId: {$in: recipeIds}});

        // Create a map for easy lookup of average ratings
        const averageRatingMap = {};
        averageRatings.forEach(rating => {
            averageRatingMap[rating.recipeId] = rating;
        });

        // Sort the favorite recipes based on average rating and number of ratings
        favList.sort((a, b) => {
            const ratingA = averageRatingMap[a.recipeId];
            const ratingB = averageRatingMap[b.recipeId];

            if (ratingA && ratingB) {
                // Compare average ratings first
                if (ratingA.averageRating !== ratingB.averageRating) {
                    return ratingB.averageRating - ratingA.averageRating;
                }
                // If average ratings are the same, compare the number of ratings
                return ratingB.numberOfRatings - ratingA.numberOfRatings;
            }
            // If one of the ratings is missing, prioritize the one with a rating
            if (ratingA) return -1;
            if (ratingB) return 1;
            return 0;
        });

        res.status(200).json(favList);
        logger.info("Favorite recipe list retrieved", {endpoint: 'getFavouriteRecipeList', userId: uId});
    } catch (error) {
        logger.error("Error fetching favorite recipe list", {
            endpoint: 'getFavouriteRecipeList',
            userId: uId,
            error: error.message
        });
        res.status(500).json({
            message: "An error occurred while fetching the favorite recipe list",
            error: error.message
        });
    }
};

/**
 * Add a recipe to the user's week menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function adds a recipe to the user's week menu on a specified day.
 */
exports.addToWeekMenu = async (req, res) => {
    const {userId, recipeId, day} = req.body;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }

        if (day === "mon" && !user.weekPlan.monday.includes(recipeId)) {
            user.weekPlan.monday.push(recipeId);
        } else if (day === "tue" && !user.weekPlan.tuesday.includes(recipeId)) {
            user.weekPlan.tuesday.push(recipeId);
        } else if (day === "wed" && !user.weekPlan.wednesday.includes(recipeId)) {
            user.weekPlan.wednesday.push(recipeId);
        } else if (day === "thu" && !user.weekPlan.thursday.includes(recipeId)) {
            user.weekPlan.thursday.push(recipeId);
        } else if (day === "fri" && !user.weekPlan.friday.includes(recipeId)) {
            user.weekPlan.friday.push(recipeId);
        } else if (day === "sat" && !user.weekPlan.saturday.includes(recipeId)) {
            user.weekPlan.saturday.push(recipeId);
        } else if (day === "sun" && !user.weekPlan.sunday.includes(recipeId)) {
            user.weekPlan.sunday.push(recipeId);
        }

        await user.save();
        res.status(200).json({message: "Recipe added to the week menu successfully", recipeId, day});
        logger.info("Recipe added to week menu", {endpoint: 'addToWeekMenu', userId, recipeId, day});
    } catch (error) {
        logger.error("Error adding recipe to week menu", {
            endpoint: 'addToWeekMenu',
            userId,
            recipeId,
            error: error.message
        });
        res.status(500).json({
            message: "Error adding recipe to week menu. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Remove a recipe from the user's week menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function removes a recipe from the user's week menu on a specified day.
 */
exports.delFromWeekMenu = async (req, res) => {
    const {userId, recipeId, day} = req.body;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }

        const dayList = user.weekPlan[day];
        if (dayList.includes(recipeId)) {
            user.weekPlan[day] = dayList.filter(id => id !== recipeId);
        }

        await user.save();
        res.status(204).json({message: "Recipe removed from the week menu successfully", recipeId, day});
        logger.info("Recipe removed from week menu", {endpoint: 'delFromWeekMenu', userId, recipeId, day});
    } catch (error) {
        logger.error("Error removing recipe from week menu", {
            endpoint: 'delFromWeekMenu',
            userId,
            recipeId,
            error: error.message
        });
        res.status(500).json({
            message: "Error removing recipe from week menu. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Get the user's week menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the user's week menu.
 */
exports.getWeekMenu = async (req, res) => {
    const id = req.query.uId;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }

        res.status(200).json(user.weekPlan);
        logger.info("Week menu retrieved", {endpoint: 'getWeekMenu', userId: id});
    } catch (error) {
        logger.error("Error fetching week menu", {endpoint: 'getWeekMenu', userId: id, error: error.message});
        res.status(500).json({message: "Error fetching week menu. Please try again later.", error: error.message});
    }
};
