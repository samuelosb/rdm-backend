/**
 * @module RecipesRoutes
 *
 * This module defines the routes for handling recipe-related operations.
 * It includes routes for searching recipes, getting a specific recipe, adding/removing favorites,
 * managing week menus, and fetching top-rated and user-specific ratings.
 */

const express = require("express");
const router = express.Router();
const {requireRole} = require("../../middleware/authMiddleware");
const {
    search,
    getRecipe,
    addToFavorite,
    removeFromFavorite,
    addToWeekMenu,
    delFromWeekMenu,
    getWeekMenu,
    getFavouriteRecipeList,
    searchRandomRecipes
} = require("../controllers/recipes.controller");
const ratingController = require('../controllers/rating.controller');

// Define the routes for the recipes
router.route("/search").get(search);

router.route("/get").get(getRecipe);

router.route("/addFav").put(requireRole(['Admin', 'Basic']), addToFavorite);

router.route("/addWeekMenu").put(requireRole(['Admin', 'Basic']), addToWeekMenu);

router.route("/delWeekMenu").delete(requireRole(['Admin', 'Basic']), delFromWeekMenu);

router.route("/getWeekMenu").get(requireRole(['Admin', 'Basic']), getWeekMenu);

router.route("/getFavs").get(requireRole(['Admin', 'Basic']), getFavouriteRecipeList);

router.route("/delFav").delete(requireRole(['Admin', 'Basic']), removeFromFavorite);

// Routes for the ratings:
router.post("/rate", requireRole(['Admin', 'Basic']), ratingController.rateRecipe);

router.route("/user-rating").get(requireRole(['Admin', 'Basic']), ratingController.getUserRating);

router.route("/average-rating").get(ratingController.getAverageRating);

router.route("/recalculate-average-ratings").get(requireRole(['Admin']), ratingController.recalculateAllAverageRatings);

router.route("/top-rated").get(ratingController.getTopRatedRecipes);

router.route("/random-recipes").get(searchRandomRecipes);

module.exports = router;
