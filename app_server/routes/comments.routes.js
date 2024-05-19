const express = require("express")
const router = express.Router()
const { requireRole } = require("../../middleware/authMiddleware")

const { createComment , getAllCommsByPostRecent , deleteComment, getAllComments } = require("../controllers/comments.controller")

router.route("/create").post(requireRole(["Admin" , "Basic"]),createComment);

router.route("/delete").delete(requireRole(["Admin"]), deleteComment);

// Get and  route must be accesible for public users, without auth required
router.route("/getAllCommsByPostRecent").get(getAllCommsByPostRecent);

router.route("/getAll").get(requireRole(["Admin" , "Basic"]),getAllComments)


module.exports = router
