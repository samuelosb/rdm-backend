const axios = require("axios");
const User = require("../models/users");

exports.search = async (req, res, next) => {
    const  q  = req.query.q;
    const page = req.query.page
    try {
        const from = 1;
        // Make a GET request to retrieve recipes with a specific query
        axios.get(
            // Needed to use the v1 api, for pagination support (from - to)
            `https://api.edamam.com/search?q=` + q +
                `&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}` + '&from=' +
                  ((parseInt(page) * 20) - 20)+
                '&to=' + (parseInt(page) * 20) 
            )
            .then((response) => {
                console.log(q);
                res.status(200).json(response.data);
            });
        } catch (error) {
        return res.status(400).json({ message: "Error", error: error.message });
        }
}; 

exports.getRecipe = async (req, res, next) => {
    const  recipeId  = req.query.id;

    // Make a GET request to retrieve recipes with a specific query
    axios.get(
        `https://api.edamam.com/api/recipes/v2/` + recipeId +
        `?type=public&app_key=${process.env.APP_KEY}&app_id=${process.env.APP_ID}`
    )
    .then((response) => {
        res.status(200).json(response.data);
        console.log(response.data);
    })
    .catch (function (error) {
        return res.status(404).json({
            message: "ERROR:the Edamam api couldn't get the recipe"+
            " with id: ", recipeId
        });
    })
};

exports.addToFavorite = async (req, res, next) => {
    const { userId, recipeId} = req.body;
        try{
            const user = await User.findById(userId);
            
            user.favList.push({ recipeId: recipeId, addedDate: Date.now() });
            await user.save();
            res.status(200).json("Recipe added to favorite. ID " + recipeId);
        }
        catch (error){
                return res.status(404).json({
                    message: "error ", error
                }) ;
        }
}

exports.removeFromFavorite = async (req, res, next) => {
    const { userId, recipeId } = req.body;
    try {
        const user = await User.findById(userId);
        
        user.favList.pull({ recipeId: recipeId });
        
        await user.save();
        res.status(204).json("Recipe deleted from favorites. ID " + recipeId);
    }
    catch (error) {
        return res.status(404).json({
            message: "Recipe or User not found."
        });
    }
}

exports.getFavList = async (req, res, next) => {
    const uId = req.query.id;
    try {
        const user = await User.findById(uId);
        res.status(200).json(user.favList);
    }
    catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}

exports.addToWeekMenu = async (req, res, next) => {
    const { userId, recipeId, day } = req.body;
    try {
        const user = await User.findById(userId);

        if (day == "mon") { user.weekPlan.monday.push(recipeId); }
        else if (day == "tue") { user.weekPlan.tuesday.push(recipeId); }
        else if (day == "wed") { user.weekPlan.wednesday.push(recipeId); }
        else if (day == "thu") { user.weekPlan.thursday.push(recipeId); }
        else if (day == "fri") { user.weekPlan.friday.push(recipeId); }
        else if (day == "sat") { user.weekPlan.saturday.push(recipeId); }
        else if (day == "sun") { user.weekPlan.sunday.push(recipeId); }
        
        await user.save();
        res.status(200).json("Recipe added to the week menu. ID " + recipeId);
    }
    catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}

exports.getWeekMenu = async (req, res, next) => {
    const id = req.query.uId;
    try {
        const user = await User.findById(id);
        res.status(200).json(user.weekPlan);
    }
    catch (error) {
        return res.status(404).json({
            message: "error ", error
        });
    }
}