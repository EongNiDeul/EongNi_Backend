const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// 댓글 작성
router.post("/comments", commentController.createComment);

// 댓글 수정
router.put("/comments/:id", commentController.updateComment);

// 댓글 삭제
router.delete("/comments/:id", commentController.deleteComment);

// 댓글 고정 API 만들기
// PUT /api/comment/comments/댓글 id/pin
router.put("/post/:postId/pin/:commentId", async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // 먼저 해당 게시물의 모든 댓글의 고정을 해제
    await db.query(
      "UPDATE comment SET is_pinned = 0 WHERE post_id = ?",
      [postId]
    );

    // 해당 댓글만 고정
    await db.query(
      "UPDATE comment SET is_pinned = 1 WHERE id = ? AND post_id = ?",
      [commentId, postId]
    );

    res.status(200).json({ message: "댓글이 고정되었습니다." });
  } catch (err) {
    console.error("댓글 고정 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 게시물 댓글 조회
// GET /api/comment/comments/게시물 id에 달린 댓글 불러오기
router.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const [comments] = await db.query(`
      SELECT comment.*, user.nickname
      FROM comment
      JOIN user ON comment.user_id = user.id
      WHERE comment.post_id = ?
      ORDER BY is_pinned DESC, created_at ASC`, [postId]);

    res.status(200).json(comments);
  } catch (err) {
    console.error("댓글 조회 에러 : ", err);
    res.status(500).json({ message: "서버 에러" })
  }
})
module.exports = router;
