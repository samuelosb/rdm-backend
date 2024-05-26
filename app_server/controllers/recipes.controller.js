/**
 * @module RecipesController
 *
 * This module defines the controller for handling recipe-related operations.
 * It includes methods for searching recipes, getting a specific recipe, adding/removing favorites,
 * managing week menus, and fetching favorite recipes.
 */

const axios = require("axios");
const User = require("../models/users");

/**
 * Search for recipes based on various query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function builds the API URL based on the query parameters and fetches the recipes from the Edamam API.
 */
exports.search = async (req, res, next) => {
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
    } catch (error) {
        return res.status(400).json({message: "Error", error: error.message});
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

        // Perform the HTTP GET request to the Edamam API
        const response = await axios.get(apiUrl);
        console.log(await response.data); // Log the response data for debugging purposes

        // Send the response data back to the client as JSON
        res.status(200).json(response.data);
    } catch (error) {
        // Log any errors encountered during the request
        console.error('Error fetching random recipes:', error);

        // Send an error response back to the client
        res.status(500).json({message: "Error fetching random recipes", error: error.message});
    }
};

/**
 * Get a specific recipe by ID from the Edamam API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves a recipe by its ID.
 */
exports.getRecipe = async (req, res, next) => {
    const recipeId = req.query.id;

    // Make a GET request to retrieve recipes with a specific query
    axios.get(
        `https://api.edamam.com/api/recipes/v2/` + recipeId +
        `?type=public&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}`
    )
        .then((response) => {
            res.status(200).json(response.data);
        })
        .catch(function (error) {
            return res.status(404).json({
                message: "ERROR: the Edamam API couldn't get the recipe with id: ", recipeId
            });
        })
};

/**
 * Add a recipe to the user's favorite list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function adds a recipe to the user's favorite list.
 */
exports.addToFavorite = async (req, res, next) => {
    const {userId, recipeId} = req.body;
    try {
        const user = await User.findById(userId);

        user.favList.push({recipeId: recipeId, addedDate: Date.now()});
        await user.save();
        res.status(200).json("Recipe added to favorite. ID " + recipeId);
    } catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}

/**
 * Remove a recipe from the user's favorite list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function removes a recipe from the user's favorite list.
 */
exports.removeFromFavorite = async (req, res, next) => {
    const {userId, recipeId} = req.body;
    try {
        const user = await User.findById(userId);

        user.favList.pull({recipeId: recipeId});

        await user.save();
        res.status(204).json("Recipe deleted from favorites. ID " + recipeId);
    } catch (error) {
        return res.status(404).json({
            message: "Recipe or User not found."
        });
    }
}

/**
 * Get the user's favorite recipe list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the user's favorite recipe list.
 */
exports.getFavouriteRecipeList = async (req, res, next) => {
    const uId = req.query.id;

    // Check if the user ID is provided
    if (!uId) {
        return res.status(400).json({message: "User ID is required"});
    }

    try {
        const user = await User.findById(uId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        // Return the user's favorite list
        res.status(200).json(user.favList);
    } catch (error) {
        // Log the error and return a more descriptive error message
        console.error('Error fetching favorite recipe list:', error);
        return res.status(500).json({
            message: "An error occurred while fetching the favorite recipe list",
            error: error.message
        });
    }
}

/**
 * Add a recipe to the user's week menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function adds a recipe to the user's week menu on a specified day.
 */
exports.addToWeekMenu = async (req, res, next) => {
    const {userId, recipeId, day} = req.body;
    try {
        const user = await User.findById(userId);

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
        res.status(200).json("Recipe added to the week menu. ID " + recipeId);
    } catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}

/**
 * Remove a recipe from the user's week menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function removes a recipe from the user's week menu on a specified day.
 */
exports.delFromWeekMenu = async (req, res, next) => {
    const {userId, recipeId, day} = req.body;
    try {
        const user = await User.findById(userId);
        const dayList = user.weekPlan[day];
        if (dayList.includes(recipeId)) {
            //Create a new array with all elements except the desired recipe to delete
            user.weekPlan[day] = dayList.filter(id => id !== recipeId);
        }

        await user.save();

        res.status(204).json("Recipe removed from to the week menu. ID " +
            recipeId + ', day ' + day);
    } catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}

/**
 * Get the user's week menu
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * This function retrieves the user's week menu.
 */
exports.getWeekMenu = async (req, res, next) => {
    const id = req.query.uId;
    try {
        const user = await User.findById(id);
        res.status(200).json(user.weekPlan);
    } catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}
