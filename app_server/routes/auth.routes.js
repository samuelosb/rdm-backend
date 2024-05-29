const express = require("express");
const router = express.Router();
const {requireRole} = require("../../middleware/authMiddleware");
const passport = require('passport');
const authController = require("../controllers/auth.controller");

// Register a new user
router.post("/register", authController.register);
/**
 * Example request:
 * POST http://localhost:3001/api/auth/register
 * {
 *   "email": "sam2@gmail.com",
 *   "username": "sa",
 *   "password": "asd123"
 * }
 */

// Login existing user
router.post("/login", authController.login);
/**
 * Example request:
 * POST http://localhost:3001/api/auth/login
 * {
 *   "email": "sam2@gmail.com",
 *   "password": "asd123"
 * }
 */

// Logout current user
router.post('/logout', requireRole(['Admin', 'Basic']), authController.logout);

// Request password reset
router.post('/request-password-reset', authController.requestPasswordReset);

// Refresh JWT token
router.post('/refresh-token',requireRole(['Admin', 'Basic']), authController.refreshToken);

// Google Auth
router.get('/auth/google',
    passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

// GitHub Auth
router.get('/auth/github',
    passport.authenticate('github', {scope: ['user:email']}));

router.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: '/login'}),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });


module.exports = router;
