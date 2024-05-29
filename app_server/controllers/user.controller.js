const User = require("../models/users");
const bcrypt = require("bcryptjs");
const logger = require("../../logs/winston");
const {Parser} = require('json2csv');
const PDFDocument = require('pdfkit');
const Rating = require('../models/rating');
const Post = require('../models/posts');
const Comment = require('../models/comments');

/**
 * @module UserController
 *
 * This module handles the user-related operations such as fetching users,
 * finding users by ID or username, updating user details, and managing user roles.
 */

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
        logger.info("Fetched all users successfully", {endpoint: 'getUsers', resultCount: users.length});
    } catch (error) {
        logger.error("Failed to fetch users", {endpoint: 'getUsers', error: error.message});
        res.status(500).json({message: "Failed to fetch users. Please try again later."});
    }
};

/**
 * Finds a user by ID.
 * Required on the forum to map each ID with its username.
 */
exports.findUserById = async (req, res) => {
    const userId = req.query.id;
    try {
        const user = await User.findOne({_id: userId}).select('username email gender role');
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        res.json(user);
        logger.info("User found by ID successfully", {endpoint: 'findUserById', userId});
    } catch (error) {
        logger.error("Error finding user by ID", {endpoint: 'findUserById', userId, error: error.message});
        res.status(500).json({message: "Server error. Unable to find user by ID."});
    }
};

/**
 * Finds a user by username.
 */
exports.findUserByUsername = async (req, res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the username and try again."});
        }
        res.json(user);
        logger.info("User found by username successfully", {endpoint: 'findUserByUsername', username});
    } catch (error) {
        logger.error("Error finding user by username", {
            endpoint: 'findUserByUsername',
            username,
            error: error.message
        });
        res.status(500).json({message: "Server error. Unable to find user by username."});
    }
};

/**
 * Retrieves all users.
 */
exports.findAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users || users.length === 0) {
            return res.status(404).json({message: "No users found."});
        }
        res.json(users);
        logger.info("All users retrieved successfully", {endpoint: 'findAllUsers', resultCount: users.length});
    } catch (error) {
        logger.error("Error retrieving all users", {endpoint: 'findAllUsers', error: error.message});
        res.status(500).json({message: "Error retrieving users. Please try again later.", error: error.message});
    }
};

/**
 * Deletes a user by ID.
 */
exports.deleteUser = async (req, res) => {
    const {id} = req.body;
    // Ensure ID is provided and in the correct format for MongoDB
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        logger.error("Invalid or missing user ID", {endpoint: 'deleteUser', id});
        return res.status(400).json({message: "Invalid or missing user ID."});
    }
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        await user.deleteOne();
        res.status(200).json({message: "User deleted successfully."});
        logger.info("User deleted successfully", {endpoint: 'deleteUser', id});
    } catch (error) {
        logger.error("Failed to delete user", {endpoint: 'deleteUser', id, error: error.message});
        res.status(500).json({message: "Failed to delete user. Please try again later.", error: error.message});
    }
};

/**
 * Changes a user's password.
 */
exports.changePassword = async (req, res) => {
    const {id, oldPassword, newPassword} = req.body;
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Old password is incorrect."});
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({message: "Password changed successfully."});
        logger.info("Password changed successfully", {endpoint: 'changePassword', id});
    } catch (error) {
        logger.error("Failed to change password", {endpoint: 'changePassword', id, error: error.message});
        res.status(500).json({
            message: "An error occurred while changing the password. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Updates a user's details.
 */
exports.updateUserDetails = async (req, res) => {
    const {id, newEmail, newUsername} = req.body;
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        if (newEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return res.status(400).json({message: "Invalid email format."});
            }
            user.email = newEmail;
        }
        if (newUsername) user.username = newUsername;
        await user.save();
        res.json({message: "User details updated successfully.", user});
        logger.info("User details updated successfully", {endpoint: 'updateUserDetails', id, newEmail, newUsername});
    } catch (error) {
        logger.error("Failed to update user details", {endpoint: 'updateUserDetails', id, error: error.message});
        res.status(500).json({
            message: "An error occurred while updating user details. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Promotes a user to admin.
 */
exports.makeAdmin = async (req, res) => {
    const {userId} = req.body;
    if (!userId) {
        logger.error("Missing user ID", {endpoint: 'makeAdmin'});
        return res.status(400).json({message: "Missing user ID."});
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        if (user.role === "Admin") {
            return res.status(400).json({message: "User is already an Admin."});
        }
        user.role = "Admin";
        await user.save();
        res.json({message: "User role updated to admin successfully.", user});
        logger.info("User role updated to admin successfully", {endpoint: 'makeAdmin', userId});
    } catch (error) {
        logger.error("An error occurred during updating role to admin", {
            endpoint: 'makeAdmin',
            userId,
            error: error.message
        });
        res.status(500).json({
            message: "An error occurred during updating role to admin. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Withdraws admin rights from a user.
 */
exports.withdrawAdmin = async (req, res) => {
    const {userId} = req.body;
    if (!userId) {
        logger.error("Missing user ID", {endpoint: 'withdrawAdmin'});
        return res.status(400).json({message: "Missing user ID."});
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        if (user.role !== "Admin") {
            return res.status(400).json({message: "User is not an Admin."});
        }
        user.role = "Basic";
        await user.save();
        res.json({message: "Admin rights withdrawn successfully.", user});
        logger.info("Admin rights withdrawn successfully", {endpoint: 'withdrawAdmin', userId});
    } catch (error) {
        logger.error("An error occurred during withdrawing admin rights", {
            endpoint: 'withdrawAdmin',
            userId,
            error: error.message
        });
        res.status(500).json({
            message: "An error occurred during withdrawing admin rights. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Bans a user.
 */
exports.banUser = async (req, res) => {
    const {userId} = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        user.role = "Banned";
        await user.save();
        res.json({message: `User banned successfully: ${userId}`});
        logger.info("User banned successfully", {endpoint: 'banUser', userId});
    } catch (error) {
        logger.error("An error occurred during banning procedure", {endpoint: 'banUser', userId, error: error.message});
        res.status(400).json({
            message: "An error occurred during banning procedure. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Unbans a user.
 */
exports.unbanUser = async (req, res) => {
    const {userId} = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found. Please check the ID and try again."});
        }
        user.role = "Basic";
        await user.save();
        res.json({message: `User unbanned successfully: ${userId}`});
        logger.info("User unbanned successfully", {endpoint: 'unbanUser', userId});
    } catch (error) {
        logger.error("An error occurred during unbanning procedure", {
            endpoint: 'unbanUser',
            userId,
            error: error.message
        });
        res.status(400).json({
            message: "An error occurred during unbanning procedure. Please try again later.",
            error: error.message
        });
    }
};

/**
 * Export all users data as json, csv or pdf
 */
exports.exportAllUsersData = async (req, res) => {
    const {format} = req.query;

    try {
        const users = await User.find()
            .select('username email gender role numberOfPosts numberOfComments creationAccountDate favList __v weekPlan isOAuthUser provider providerId')
            .lean(); // exclude password hash

        let data;
        let contentType;
        let extension;

        switch (format) {
            case 'json':
                data = JSON.stringify(users, null, 2);
                contentType = 'application/json';
                extension = 'json';
                break;
            case 'csv':
                const json2csvParser = new Parser();
                data = json2csvParser.parse(users);
                contentType = 'text/csv';
                extension = 'csv';
                break;
            case 'pdf':
                const doc = new PDFDocument();
                data = [];
                doc.on('data', chunk => data.push(chunk));
                doc.on('end', () => {
                    data = Buffer.concat(data);
                    res.setHeader('Content-Disposition', `attachment; filename=all_users_data.pdf`);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.send(data);
                });

                // Add content to PDF
                const path = require('path');
                const logoPath = path.join(__dirname, '../../public/images/logo.png');
                const logoWidth = 75; // Half the original size
                const logoHeight = 75; // Half the original size
                doc.image(logoPath, doc.page.width - logoWidth - 10, 10, {width: logoWidth, height: logoHeight});
                doc.moveDown(6);

                doc.fontSize(20).text('All Users Data', {align: 'center'});
                doc.moveDown();

                users.forEach(user => {
                    doc.fontSize(12).text(`Username: ${user.username}`);
                    doc.text(`Email: ${user.email}`);
                    doc.text(`Gender: ${user.gender}`);
                    doc.text(`Role: ${user.role}`);
                    doc.text(`Account Created: ${new Date(user.creationAccountDate).toLocaleString()}`);
                    doc.text(`Number of Posts: ${user.numberOfPosts}`);
                    doc.text(`Number of Comments: ${user.numberOfComments}`);
                    doc.text(`Favorite List: ${JSON.stringify(user.favList)}`);
                    doc.text(`Week Plan: ${JSON.stringify(user.weekPlan)}`);
                    doc.text(`isOAuthUser: ${user.isOAuthUser}`);
                    doc.text(`Provider: ${user.provider}`);
                    doc.text(`Provider ID: ${user.providerId}`);
                    doc.moveDown();
                });

                doc.end();
                return;
            default:
                return res.status(400).json({message: 'Invalid format'});
        }

        res.setHeader('Content-Disposition', `attachment; filename=all_users_data.${extension}`);
        res.setHeader('Content-Type', contentType);
        res.send(data);
    } catch (error) {
        logger.error('Error exporting all users data', {format, error: error.message});
        res.status(500).json({
            message: 'Error exporting all users data. Please try again later.',
            error: error.message
        });
    }
};


/**
 * Export all the data for a single user as json, csv or pdf
 */
exports.exportUserData = async (req, res) => {
    const {userId, format} = req.query;

    try {
        const user = await User.findById(userId)
            .select('username email gender role creationAccountDate numberOfPosts numberOfComments favList weekPlan isOAuthUser provider providerId')
            .lean(); // exclude password
        const posts = await Post.find({authorId: userId}).lean();
        const comments = await Comment.find({authorId: userId}).lean();
        const ratings = await Rating.find({userId: userId}).lean();

        const userData = {
            user,
            posts,
            comments,
            ratings,
            favList: user.favList,
            weekPlan: user.weekPlan
        };

        let data;
        let contentType;
        let extension;

        switch (format) {
            case 'json':
                data = JSON.stringify(userData, null, 2);
                contentType = 'application/json';
                extension = 'json';
                break;
            case 'csv':
                const json2csvParser = new Parser();
                data = json2csvParser.parse(userData);
                contentType = 'text/csv';
                extension = 'csv';
                break;
            case 'pdf':
                const doc = new PDFDocument();
                data = [];
                doc.on('data', chunk => data.push(chunk));
                doc.on('end', () => {
                    data = Buffer.concat(data);
                    res.setHeader('Content-Disposition', `attachment; filename=user_data.pdf`);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.send(data);
                });

                // Add content to PDF
                const path = require('path');
                const logoPath = path.join(__dirname, '../../public/images/logo.png');
                const logoWidth = 75; // Half the original size
                const logoHeight = 75; // Half the original size
                doc.image(logoPath, doc.page.width - logoWidth - 10, 10, {width: logoWidth, height: logoHeight});
                doc.moveDown(6);

                doc.fontSize(20).text('User Data', {align: 'center'});
                doc.moveDown();

                doc.fontSize(16).text('Personal Information', {underline: true});
                doc.fontSize(12).text(`Username: ${user.username}`);
                doc.text(`Email: ${user.email}`);
                doc.text(`Gender: ${user.gender}`);
                doc.text(`Role: ${user.role}`);
                doc.text(`Account Created: ${new Date(user.creationAccountDate).toLocaleString()}`);
                doc.text(`Number of Posts: ${user.numberOfPosts}`);
                doc.text(`Number of Comments: ${user.numberOfComments}`);
                doc.text(`Favorite List: ${JSON.stringify(user.favList)}`);
                doc.text(`Week Plan: ${JSON.stringify(user.weekPlan)}`);
                doc.text(`isOAuthUser: ${user.isOAuthUser}`);
                doc.text(`Provider: ${user.provider}`);
                doc.text(`Provider ID: ${user.providerId}`);
                doc.moveDown();

                if (posts.length > 0) {
                    doc.fontSize(16).text('Posts', {underline: true});
                    posts.forEach(post => {
                        doc.fontSize(12).text(`Title: ${post.postTitle}`);
                        doc.text(`Content: ${post.content}`);
                        doc.text(`Publication Date: ${new Date(post.timePublication).toLocaleString()}`);
                        doc.moveDown();
                    });
                }

                if (comments.length > 0) {
                    doc.fontSize(16).text('Comments', {underline: true});
                    comments.forEach(comment => {
                        doc.fontSize(12).text(`Post ID: ${comment.postId}`);
                        doc.text(`Content: ${comment.content}`);
                        doc.text(`Publication Date: ${new Date(comment.timePublication).toLocaleString()}`);
                        doc.moveDown();
                    });
                }

                if (ratings.length > 0) {
                    doc.fontSize(16).text('Ratings', {underline: true});
                    ratings.forEach(rating => {
                        doc.fontSize(12).text(`Recipe ID: ${rating.recipeId}`);
                        doc.text(`Rating: ${rating.rating}`);
                        doc.text(`Date: ${new Date(rating.createdAt).toLocaleString()}`);
                        doc.moveDown();
                    });
                }

                doc.end();
                return;
            default:
                return res.status(400).json({message: 'Invalid format'});
        }

        res.setHeader('Content-Disposition', `attachment; filename=user_data.${extension}`);
        res.setHeader('Content-Type', contentType);
        res.send(data);
    } catch (error) {
        logger.error('Error exporting user data', {userId, format, error: error.message});
        res.status(500).json({message: 'Error exporting user data. Please try again later.', error: error.message});
    }
};
