const express = require("express");
const db = require("../config/db");

const router = express.Router();

//  댓글 등록
router.post("/comments", async (req, res) => {
  const { post_id, user_id, content } = req.body;

  if (!post_id || !user_id || !content) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    // 댓글 삽입
    await db.query(
      "INSERT INTO comment (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [post_id, user_id, content]
    );

    // 댓글 수 증가
    await db.query(
      "UPDATE user SET comment_count = comment_count + 1 WHERE id = ?",
      [user_id]
    );

    // 새로운 comment_count 조회
    const [userRows] = await db.query("SELECT comment_count FROM user WHERE id = ?", [user_id]);
    const commentCount = userRows[0].comment_count;

    // 레벨 계산 및 업데이트 (5개마다 1레벨 증가, 최소 1레벨)
    const newLevel = Math.floor(commentCount / 5) + 1;
    await db.query("UPDATE user SET level = ? WHERE id = ?", [newLevel, user_id]);

    res.status(201).json({ message: "댓글이 등록되었습니다." });
  } catch (err) {
    console.error("댓글 등록 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

//  댓글 수정
router.put("/comments/:id", async (req, res) => {
  const { content } = req.body;
  const commentId = req.params.id;

  if (!content) {
    return res.status(400).json({ message: "내용을 입력해주세요." });
  }

  try {
    await db.query("UPDATE comment SET content = ? WHERE id = ?", [content, commentId]);
    res.status(200).json({ message: "댓글이 수정되었습니다." });
  } catch (err) {
    console.error("댓글 수정 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

//  댓글 삭제
router.delete("/comments/:id", async (req, res) => {
  const commentId = req.params.id;

  try {
    // 삭제 전 user_id 조회
    const [rows] = await db.query("SELECT user_id FROM comment WHERE id = ?", [commentId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    }
    const userId = rows[0].user_id;

    // 댓글 삭제
    await db.query("DELETE FROM comment WHERE id = ?", [commentId]);

    // 댓글 수 감소 (최소 0)
    await db.query(
      "UPDATE user SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = ?",
      [userId]
    );

    // 최신 comment_count 다시 조회
    const [userRows] = await db.query("SELECT comment_count FROM user WHERE id = ?", [userId]);
    const commentCount = userRows[0].comment_count;

    // 레벨 재계산
    const newLevel = Math.floor(commentCount / 5) + 1;
    await db.query("UPDATE user SET level = ? WHERE id = ?", [newLevel, userId]);

    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (err) {
    console.error("댓글 삭제 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

module.exports = router;
