const Categories = require("../models/categories");
const Posts = require("../models/posts");
const PostsController = require("../controllers/posts.controller");
const logger = require("../../logs/winston");

exports.createCategory = async (req, res, _next) => {
    const { categoryTitle, categorySubtitle } = req.body;
    try {
        // Récupération du dernier postId
        const lastCategory = await Categories.findOne({}, {}, { sort: { 'categoryId': -1 } });
        let categoryId = 1; // Valeur par défaut si aucun post n'existe encore

        if (lastCategory) {
            categoryId = lastCategory.categoryId + 1;
        }

        const newCategory = await Categories.create({
            categoryId: categoryId,
            categoryTitle: categoryTitle,
            categorySubtitle: categorySubtitle
        });
        logger.info('Category successfully created');
        return res.status(201).json({
            message: "Category successfully created",
            category: newCategory.categoryId,
        });
    } catch (error) {
        logger.error(`Category not successfully created: ${error.message}`);
        return res.status(400).json({ message: "Error", error: error.message });
    }
};

exports.deleteCategory = async (req, res, _next) => {
    const categoryId = req.query.categoryId; 
    try {
        const deletedCategory = await Categories.findOneAndDelete({ categoryId: categoryId });
        if (!deletedCategory) {
            logger.error('Category not exist.');
            return res.status(404).json({ message: "Category not exist." });
        }
        const posts = await Posts.find({ categoryId: categoryId });
        for (const post of posts) {
            await PostsController.deletePost_(post.postId); 
        }
        logger.info('Category successfully deleted');
        return res.status(200).json({
            message: "Category successfully deleted",
            category: deletedCategory._id,
            deletedPosts: posts
        });
    } catch (error) {
        logger.error(`Category not successfully deleted: ${error.message}`);
        return res.status(500).json({ message: "Error", error: error.message });
    }
};

exports.getAllCategories = async (_req, res, _next) => {
    try {
        const categ = await Categories.find({});
        logger.info('Categories found successfully.');
        return res.status(200).json({ categ });
    } catch (error) {
        logger.error(`Error finding categories: ${error.message}`);
        return res.status(400).json({ message: "Error", error: error.message });
    }
};

