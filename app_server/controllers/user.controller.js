const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const logger = require("../../logs/winston");


exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Gets the username by its ID. Required on the forum to map each ID with its username.
exports.findUserById = async (req, res) => {
    const userId = req.query.id;
    try {
        const user = await User.findOne({_id: userId }).select('username'); 
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        logger.info("User found successfully");
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.findUserByUsername = async (req, res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne({username});
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({message: "User not found"});
        }
        logger.info("User found successfully");
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
};

exports.findAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            logger.error("No users found");
            return res.status(404).json({message: "No users found"});
        }
        logger.info("Users found successfully");
        res.json(users);
    } catch (error) {
        logger.error("Error while fetching users");
        res.status(500).json({message: "Error while fetching users", error: error.message});
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.body;
    // Ensure ID is provided and in the correct format for MongoDB
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        logger.error("Invalid or missing user ID");
        return res.status(400).json({ message: "Invalid or missing user ID" });
    }
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        await user.deleteOne();
        logger.info("User deleted successfully");
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        logger.error("Failed to delete user", error.message);
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};



exports.changePassword = async (req, res) => {
    const {id, oldPassword, newPassword} = req.body;
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({message: "User not found"});
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            logger.error("Old password is incorrect");
            return res.status(400).json({message: "Old password is incorrect"});
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        logger.info("Password changed successfully");
        res.json({message: "Password changed successfully"});
    } catch (error) {
        logger.error("Failed to change password", error.message);
        res.status(500).json({message: "An error occurred", error: error.message});
    }
};

exports.updateUserDetails = async (req, res) => {
    const {id, newEmail, newUsername} = req.body;
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            logger.error("User not found"); 
            return res.status(404).json({message: "User not found"});
        }
        if (newEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                logger.error("Invalid email format");
                return res.status(400).json({ message: "Invalid email format" });
            }
            user.email = newEmail;
        }
        if (newUsername) user.username = newUsername;
        await user.save();
        logger.info("User details updated successfully");
        res.json({message: "User details updated successfully", user});
    } catch (error) {
        logger.error("Failed to update user details", error.message);   
        res.status(500).json({message: "An error occurred", error: error.message});
    }
};

exports.makeAdmin = async (req, res) => {
    const {role, id} = req.body;
    if (role !== "Admin" || !id) {
        logger.error("Invalid role or missing user ID");
        return res.status(400).json({message: "Invalid role or missing user ID"});
    }
    try {
        const user = await User.findById({_id: id});
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({message: "User not found"});
        }
        if (user.role === "Admin") {
            logger.error("User is already an Admin");
            return res.status(400).json({message: "User is already an Admin"});
        }
        user.role = role;
        await user.save();
        logger.info("User role updated to admin successfully");
        res.json({message: "User role updated to admin successfully", user});
    } catch (error) {
        logger.error("An error occurred during updating role", error.message);
        res.status(500).json({message: "An error occurred during updating role", error: error.message});
    }
};


exports.banUser = async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        user.role = "Banned";
        await user.save();
        logger.info("User banned successfully: ",id);
        res.json({ message: "User banned successfully: ", id });
    } catch (error) {
        logger.error("An error occurred during banning procedure", error.message);
        res.status(400).json({ message: "An error occurred during banning procedure", error: error.message });
    }
};


