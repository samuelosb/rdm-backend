const express = require("express")
const router = express.Router()
const { adminAuth } = require("../../middleware/authMiddleware")
const { search, getRecipe, addToFavorite, removeFromFavorite, getFavList,
    addToWeekMenu, getWeekMenu } = require("../controllers/recipes.controller")


router.route("/search").get(search);

router.route("/get").get(getRecipe);

router.route("/addFav").put(addToFavorite);

router.route("/addWeekMenu").put(addToWeekMenu);

router.route("/getWeekMenu").get(getWeekMenu);

router.route("/delFav").delete(removeFromFavorite);

router.route("/getFavs").get(getFavList);

module.exports = router
