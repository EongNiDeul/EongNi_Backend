const db = require("../config/db");

exports.createPost = async (req, res) => {
    const { user_id, title, writing } = req.body;

    try {
        // 1. 게시글 저장
        await db.execute(
            "INSERT INTO posts (user_id, title, writing, date) VALUES (?, ?, ?, NOW())",
            [user_id, title, writing]
        );

        // 2. comment_count 증가
        await db.execute(
            "UPDATE users SET comment_count = comment_count + 1 WHERE id = ?",
            [user_id]
        );

        // 3. 새 comment_count 가져오기
        const [[user]] = await db.execute(
            "SELECT comment_count FROM users WHERE id = ?",
            [user_id]
        );

        const commentCount = user.comment_count;
        const newLevel = Math.min(10, Math.floor(commentCount / 5) + 1);

        // 4. 레벨 업데이트
        await db.execute(
            "UPDATE users SET level = ? WHERE id = ?",
            [newLevel, user_id]
        );

        res.status(201).json({ message: "게시글 업로드 및 레벨 반영 완료" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "서버 오류" });
    }
};

exports.getPosts = async (req, res) => {
    const [posts] = await db.execute(`
    SELECT posts.id, users.nickname, title, writing, date
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY date DESC
  `);
    res.json(posts);
};

// 게시글 수정
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, writing } = req.body;

    try {
        await db.execute(
            "UPDATE INTO posts (user_id, title, writing,  date) VALUES (?, ?, ?, NOW())",
            [user_id, title, writing]
        );
        res.json({ message: "게시글이 수정되었습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "수정 중 서버 오류" });
    }
};

// 게시글 삭제
exports.deletePost = async (req, res) => {
    const { id } = req.params;

    try {
        await db.execute("DELETE FROM posts WHERE id = ?", [id]);
        res.json({ message: "게시글이 삭제되었습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "삭제 중 서버 오류" });
    }
};
