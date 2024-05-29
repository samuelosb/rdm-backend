const express = require("express");
const router = express.Router();
const {requireRole} = require("../../middleware/authMiddleware");
const userController = require("../controllers/user.controller");

// Needed for forum functionality
router.route('/getUserById').get(userController.findUserById);

// Accessible to all logged-in users
router.get("/findbyusername/:username", requireRole(['Admin', 'Basic']), userController.findUserByUsername);
router.get("/findallusers", requireRole(['Admin']), userController.findAllUsers);
router.post('/change-password', requireRole(['Admin', 'Basic']), userController.changePassword);

// Admin-only routes
router.put('/makeAdmin', requireRole(['Admin']), userController.makeAdmin);
router.put('/withdrawAdmin', requireRole(['Admin']), userController.withdrawAdmin);
router.put('/banUser', requireRole(['Admin']), userController.banUser);
router.put('/unbanUser', requireRole(['Admin']), userController.unbanUser); // New endpoint
router.delete('/deleteUser', requireRole(['Admin']), userController.deleteUser);
router.put('/update-details', requireRole(['Admin' , "Basic"]), userController.updateUserDetails);
router.get('/exportUserData', requireRole(['Admin', 'Basic']), userController.exportUserData);
router.get('/exportAllUsers', requireRole(['Admin']), userController.exportAllUsersData);

router.get('/getAll', requireRole(['Admin']), userController.getUsers);

module.exports = router;
