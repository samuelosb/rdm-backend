const path = require('path');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

/**
 * @module SwaggerSetup
 *
 * This module sets up Swagger documentation for the Express API.
 * It uses swagger-jsdoc to generate the Swagger specification based on JSDoc comments
 * and YAML configuration files, and swagger-ui-express to serve the documentation UI.
 */

// Swagger options configuration
const options = {
    swaggerDefinition: {
        openapi: "3.0.0", // Specify the OpenAPI version
        info: {
            title: "Recetas del mundo API", // API title
            version: "1.0.0", // API version
            description: "This is the API documentation for the Recetas del mundo API. This API allows users to search for recipes, create posts, comments, and categories, and manage users. The API is secured using JWT tokens and refresh tokens.The API also allows users to search for recipes using the Edamam API. The API is built using Node.js, Express, and MongoDB. The API is documented using Swagger.openapi: 3.0.0", // API description
            license: {
                name: "MIT", // License name
                url: "https://opensource.org/licenses/MIT", // License URL
            },
        },
        servers: [
            {
                url: "https://rdm-backend.onrender.com/api/", // Server URL
                description: "Development server", // Server description
            },
        ],
        basePath: "/", // Base path for the API
    },
    apis: [
        path.join(__dirname, './app_server/routes/*.js'), // Path to the route files for JSDoc comments
        path.join(__dirname, './docs/*.yaml') // Path to the YAML configuration files
    ]
};

// Generate the Swagger specification using swagger-jsdoc
const specs = swaggerJsdoc(options);

// Export a function to setup the Swagger middleware
module.exports = (app) => {
    // Serve the Swagger UI at the /api-docs endpoint
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
