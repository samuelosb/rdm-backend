const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const logger = require("../../logs/winston");

const createToken = (user, expiresIn) => {
  return jwt.sign({ id: user._id, username: user.username, role: user.role }, jwtSecret, { expiresIn });
};

exports.register = async (req, res) => {
  const { email, username, password, gender } = req.body;
  try {
    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.error("User with this email or username already exists");
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    // Hash le mot de passe
    const hash = await bcrypt.hash(password, 10);

    // Créez l'utilisateur
    const user = await User.create({
      email,
      username,
      password: hash,
      gender,
    });

    // Créez des tokens d'accès et de rafraîchissement
    const accessToken = createToken(user, "120d");
    const refreshToken = createToken(user, "7d");

    // Définissez les cookies des tokens
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 60 * 60 * 1000 });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 3600 * 1000 });

    logger.info(`User "${user._id}" registered successfully`);
    res.status(201).json({ accessToken, refreshToken });
  } catch (error) {
    logger.error(`User not successfully created: ${error.message}`);
    res.status(500).json({ message: "User not successfully created", error: error.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.error("Authentication failed");
      return res.status(401).json({ message: "Authentication failed" });
    }

    const accessToken = createToken(user, "60m");
    const refreshToken = createToken(user, "7d");
    console.log(user.role);
    if (user.role == "Banned") { 
      //Return Forbidden status code, and the string Banned.
      res.status(403).json("BANNED!") 
    }
    else { 
      res.cookie("accessToken", accessToken, { httpOnly: true, secure: true, maxAge: 60 * 60 * 1000 });
      res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 7 * 24 * 3600 * 1000 });
      logger.info(`User "${user._id}" logged in successfully`);
      res.status(200).json({ accessToken, refreshToken });
     }
    
  } catch (error) {
    logger.error(`Internal server error: ${error.message}`);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: true });
  res.clearCookie("refreshToken", { httpOnly: true, secure: true });
  logger.info("User logged out successfully");
  res.status(200).json({ message: "Logged out successfully" });
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Replace with actual email sending logic
    logger.info(`Password reset link would be sent to ${email}`);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    logger.error(`An error occurred: ${error.message}`);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    logger.info(`Password has been reset successfully for user "${user._id}"`);
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    logger.error(`An error occurred: ${error.message}`);
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, jwtSecret);
    const newAccessToken = createToken(decoded, "1h");
    res.cookie("accessToken", newAccessToken, { httpOnly: true, maxAge: 3600000 });
    logger.info(`Token refreshed successfully for user "${decoded.id}"`);
    res.status(200).json({ message: "Token refreshed successfully", accessToken: newAccessToken });
  } catch (error) {
    logger.error(`Invalid or expired token: ${error.message}`);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
