// Load environment variables from a .env file into process.env
require("dotenv").config();

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

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json()); // Parse incoming request bodies in JSON format

// Connexion à la base de données
connectDB();

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

swagger(app);

// Middleware and routes
app.use("/api/auth", require("./app_server/routes/auth.routes"));
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/recipes", require("./app_server/routes/recipes.routes"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`An error occurred: ${err.message}`);
    server.close(() => process.exit(1));
});
