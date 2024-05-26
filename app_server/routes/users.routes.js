const express = require("express");
const router = express.Router();
const { requireRole } = require("../../middleware/authMiddleware");
const userController = require("../controllers/user.controller");

// Needed for forum functionality
router.route('/getUserById').get(userController.findUserById);

// Accessible to all logged-in users
router.get("/findbyusername/:username", requireRole(['Admin', 'Basic']), userController.findUserByUsername);
router.get("/findallusers", requireRole(['Admin']), userController.findAllUsers);
router.post('/change-password', requireRole(['Admin', 'Basic']), userController.changePassword);

// Admin-only routes
router.put('/makeAdmin', requireRole(['Admin']), userController.makeAdmin);
router.put('/banUser', requireRole(['Admin']), userController.banUser);
router.delete('/deleteUser', requireRole(['Admin']), userController.deleteUser);
router.put('/update-details', requireRole(['Admin']), userController.updateUserDetails);

router.get('/getAll', requireRole(['Admin']), userController.getUsers);

module.exports = router;
