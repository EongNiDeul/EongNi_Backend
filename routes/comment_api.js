const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

router.post("/comments", commentController.createComment);
router.put("/comments/:id", commentController.updateComment);
router.delete("/comments/:id", commentController.deleteComment);
router.put("/post/:postId/pin/:commentId", commentController.pinComment);
router.get("/comments/:postId", commentController.getCommentsByPost);

module.exports = router;
