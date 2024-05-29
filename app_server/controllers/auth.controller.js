const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const logger = require("../../logs/winston");
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1h'; // Token geçerlilik süresi

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @param {String} expiresIn - Token expiration time
 * @returns {String} JWT token
 */
const createToken = (user, expiresIn) => {
    return jwt.sign({id: user._id, username: user.username, role: user.role}, jwtSecret, {expiresIn});
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
    const {email, username, password, gender} = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({$or: [{email}, {username}]});
        if (existingUser) {
            logger.warn("User with this email or username already exists", {email, username});
            return res.status(400).json({message: "User with this email or username already exists"});
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);

        // Create the user
        const user = await User.create({
            email,
            username,
            password: hash,
            gender,
        });

        // Create access and refresh tokens
        const accessToken = createToken(user, "7d");
        const refreshToken = createToken(user, "30d");

        // Set cookies for tokens
        res.cookie("accessToken", accessToken, {httpOnly: true, secure: true, maxAge: 60 * 60 * 1000});
        res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: true, maxAge: 7 * 24 * 3600 * 1000});

        logger.info("User registered successfully", {userId: user._id});
        res.status(201).json({accessToken, refreshToken});
    } catch (error) {
        logger.error("User registration failed", {error: error.message});
        res.status(500).json({message: "User not successfully created", error: error.message});
    }
};

/**
 * Log in a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            logger.warn("Authentication failed", {email});
            return res.status(401).json({message: "Authentication failed"});
        }

        if (user.role === "Banned") {
            logger.warn("Banned user attempted to log in", {userId: user._id});
            return res.status(403).json("BANNED!");
        }

        const accessToken = createToken(user, "7d");
        const refreshToken = createToken(user, "30d");

        res.cookie("accessToken", accessToken, {httpOnly: true, secure: true, maxAge: 60 * 60 * 1000});
        res.cookie("refreshToken", refreshToken, {httpOnly: true, secure: true, maxAge: 7 * 24 * 3600 * 1000});
        logger.info("User logged in successfully", {userId: user._id});
        res.status(200).json({accessToken, refreshToken});
    } catch (error) {
        logger.error("Internal server error during login", {error: error.message});
        res.status(500).json({message: "Internal server error", error: error.message});
    }
};

/**
 * Log out a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = (req, res) => {
    res.clearCookie("accessToken", {httpOnly: true, secure: true});
    res.clearCookie("refreshToken", {httpOnly: true, secure: true});
    logger.info("User logged out successfully");
    res.status(200).json({message: "Logged out successfully"});
};


/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

function generateRandomPassword(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.error("User not found");
      //Same message returned, dont give hints about if actual user exists on email provided
      return res.status(200).json({ message: "Temporary password sent" });
    }

    const temporaryPassword = generateRandomPassword(12);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(temporaryPassword, salt);
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recetas del Mundo - Password Reset',
      text: `You requested a password reset. Your temporary password is: ${temporaryPassword}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="text-align: center; padding: 10px; background-color: #f2f2f2;">
            <img src="https://recetasdelmundo.vercel.app/logo.png " alt="Recetas del Mundo Logo" style="max-width: 100px; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Password Reset Request</h1>
          </div>
          <div style="padding: 20px; background-color: #fff; border-radius: 10px; margin: 20px;">
            <p>Dear user,</p>
            <p>You have requested to reset your password. Your temporary password is:</p>
            <p style="font-size: 20px; font-weight: bold; color: #E74C3C;">${temporaryPassword}</p>
            <p>Please use this temporary password to log in and remember to change it to a new password after logging in for security reasons.</p>
            <a href="https://recetasdelmundo.vercel.app/auth/login" style="display: inline-block; padding: 10px 20px; margin-top: 20px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Log In</a>
          </div>
          <div style="text-align: center; padding: 10px; background-color: #f2f2f2; margin-top: 20px;">
            <p style="font-size: 12px; color: #aaa;">If you did not request a password reset, please ignore this email or contact support if you have any questions.</p>
            <p style="font-size: 12px; color: #aaa;">&copy; 2024 Recetas del Mundo. All rights reserved.</p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);

    logger.info(`Temporary password sent to ${email}`);
    res.status(200).json({ message: "Temporary password sent" });
  } catch (error) {
    logger.error(`An error occurred: ${error.message}`);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


/**
 * Refresh JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = (req, res) => {
    const {refreshToken} = req.body;
    try {
        const decoded = jwt.verify(refreshToken, jwtSecret);
        const newAccessToken = createToken(decoded, "1h");
        res.cookie("accessToken", newAccessToken, {httpOnly: true, maxAge: 3600000});
        logger.info("Token refreshed successfully", {userId: decoded.id});
        res.status(200).json({message: "Token refreshed successfully", accessToken: newAccessToken});
    } catch (error) {
        logger.error("Invalid or expired token", {error: error.message});
        res.status(403).json({message: "Invalid or expired token"});
    }
};
