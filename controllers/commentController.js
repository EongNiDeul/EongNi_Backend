const db = require("../config/db");

// 댓글 달기
exports.createComment = async (req, res) => {
  const { post_id, user_id, content } = req.body;
  //어떤 게시글에 달건지, 누가 달건지, 내용

  // 전부 입력하기
  if (!post_id || !user_id || !content) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    // 게시글 존재 여부 확인
    const [postRows] = await db.query("SELECT id FROM post WHERE id = ?", [post_id]);
    if (postRows.length === 0) {
      return res.status(404).json({ message: "없는 게시글입니다." });
    }

    // 디비에 넣기, 시간은 현재
    await db.query(
      "INSERT INTO comment (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())",
      [post_id, user_id, content]
    );

    // 해당 유저의 댓글 수를 1 증가
    await db.query(
      "UPDATE user SET comment_count = comment_count + 1 WHERE id = ?",
      [user_id]
    );

    // 업데이트된 댓글 수를 다시 조회
    //댓글 수로 레벨을 계산하니까 정확한 값으로 다시 조회하고
    const [userRows] = await db.query(
      "SELECT comment_count FROM user WHERE id = ?",
      [user_id]
    );
    const commentCount = userRows[0].comment_count;

    // 댓글 수에 따라 레벨 계산 (5개당 1레벨 증가, 최소 1레벨)
    const newLevel = Math.floor(commentCount / 5) + 1;

    // 새 레벨을 디비에 업데이트
    await db.query("UPDATE user SET level = ? WHERE id = ?", [
      newLevel,
      user_id,
    ]);

    // 성공
    res.status(201).json({ message: "댓글이 등록되었습니다." });
  } catch (err) {
    console.error("댓글 등록 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
  const { content } = req.body;   //뭐로 바꿀건지랑
  const commentId = req.params.id;  //어떤거 바꿀지

  // 수정 내용이 없으면 에러
  if (!content) {
    return res.status(400).json({ message: "내용을 입력해주세요." });
  }

  try {
    // 해당 댓글 내용을 새로 받은 내용으로 수정
    await db.query("UPDATE comment SET content = ? WHERE id = ?", [
      content,
      commentId,
    ]);
    res.status(200).json({ message: "댓글이 수정되었습니다." });
  } catch (err) {
    console.error("댓글 수정 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  const commentId = req.params.id;

  try {
    // 삭제 전 해당 댓글의 작성자 아이디 조회
    const [rows] = await db.query(
      "SELECT user_id FROM comment WHERE id = ?",
      [commentId]
    );
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
    const [userRows] = await db.query(
      "SELECT comment_count FROM user WHERE id = ?",
      [userId]
    );
    const commentCount = userRows[0].comment_count;

    // 레벨 재계산
    const newLevel = Math.floor(commentCount / 5) + 1;
    await db.query("UPDATE user SET level = ? WHERE id = ?", [newLevel, userId]);

    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (err) {
    console.error("댓글 삭제 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 댓글 고정
exports.pinComment = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // 먼저 해당 게시물의 모든 댓글의 고정을 해제
    await db.query("UPDATE comment SET is_pinned = 0 WHERE post_id = ?", [postId]);

    // 해당 댓글만 고정
    await db.query("UPDATE comment SET is_pinned = 1 WHERE id = ? AND post_id = ?", [
      commentId,
      postId,
    ]);

    res.status(200).json({ message: "댓글이 고정되었습니다." });
  } catch (err) {
    console.error("댓글 고정 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 게시물 댓글 조회
exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const [comments] = await db.query(
      `SELECT comment.*, user.nickname
       FROM comment
       JOIN user ON comment.user_id = user.id
       WHERE comment.post_id = ?
       ORDER BY is_pinned DESC, created_at ASC`,
      [postId]
    );

    res.status(200).json(comments);
  } catch (err) {
    console.error("댓글 조회 에러 : ", err);
    res.status(500).json({ message: "서버 에러" });
  }
};
