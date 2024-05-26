// Load environment variables from a .env file into process.env
require("dotenv").config();

/**
 * Main entry point for the application.
 * This file sets up the Express server, configures middleware, connects to the database,
 * initializes authentication strategies, and defines routes.
 */

// Import necessary modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const session = require('express-session');
const passport = require('passport');
const cookieParser = require("cookie-parser");
const connectDB = require("./config/dbConfig"); // Import database connection module
require('./config/passport-setup');  // Load the passport configuration
const swagger = require('./swagger');

// Route imports
const userRoutes = require('./app_server/routes/users.routes');
const postRoutes = require('./app_server/routes/posts.routes');
const categoryRoutes = require('./app_server/routes/categories.routes');
const commentRoutes = require('./app_server/routes/comments.routes');
const recipeRoutes = require("./app_server/routes/recipes.routes");
const authRoutes = require("./app_server/routes/auth.routes");

const app = express();
const port = process.env.PORT || 3001;

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Secure app by setting various HTTP headers
app.use(compression()); // Compress response bodies for all requests
app.use(cookieParser()); // Parse Cookie header and populate req.cookies
app.use(express.json()); // Parse incoming request bodies in JSON format

// Connect to the database
connectDB();

// Session management
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session());

// Set up Swagger for API documentation
swagger(app);

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/recipes", recipeRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});
