const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// 댓글 작성
router.post("/comments", commentController.createComment);

// 댓글 수정
router.put("/comments/:id", commentController.updateComment);

// 댓글 삭제
router.delete("/comments/:id", commentController.deleteComment);

module.exports = router;
