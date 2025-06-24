const db = require("../config/db");

exports.createPost = async (req, res) => {
    const { user_id, title, writing } = req.body;

    try {
        // 1. 게시글 저장
        await db.execute(
            "INSERT INTO post (user_id, title, writing, date) VALUES (?, ?, ?, NOW())",
            [user_id, title, writing]
        );

        // 2. comment_count 증가
        await db.execute(
            "UPDATE user SET comment_count = comment_count + 1 WHERE id = ?",
            [user_id]
        );

        // 3. 새 comment_count 가져오기
        const [[user]] = await db.execute(
            "SELECT comment_count FROM user WHERE id = ?",
            [user_id]
        );

        const commentCount = user.comment_count;
        const newLevel = Math.min(10, Math.floor(commentCount / 5) + 1);

        // 4. 레벨 업데이트
        await db.execute(
            "UPDATE user SET level = ? WHERE id = ?",
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
    SELECT post.id, user.nickname, title, writing, date
    FROM post
    JOIN user ON post.user_id = user.id
    ORDER BY date DESC
  `);
    res.json(posts);
};

// 게시글 수정
exports.updatePost = async (req, res) => {
    const { id } = req.params; // 게시글 id
    const { title, writing, user_id } = req.body; // 로그인한 사용자 ID를 포함한다.

    try {
        // 1. 해당 게시글 작성자 확인
        const [[post]] = await db.execute("SELECT user_id FROM post WHERE id = ?", [id]);

        if (!post) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({ message: "수정 권한이 없습니다." });
        }

        // 2. 본인 글이면 수정 허용
        await db.execute(
            "UPDATE post SET title = ?, writing = ?, date = NOW() WHERE id = ?",
            [title, writing, id]
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
    const { user_id } = req.body;
    try {
        // 1. 게시글 작성자 확인
        const [[post]] = await db.execute("SELECT user_id FROM post WHERE id = ?", [id]);

        if (!post) {
            return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
        }

        // 2. 요청자와 작성자가 다르면 거절
        if (post.user_id !== user_id) {
            return res.status(403).json({ message: "삭제 권한이 없습니다." });
        }

        // 3. 삭제 진행
        await db.execute("DELETE FROM post WHERE id = ?", [id]);
        res.json({ message: "게시글이 삭제되었습니다." });

    } catch (err) {
        console.error("삭제 에러:", err);
        res.status(500).json({ message: "삭제 중 서버 오류" });
    }
};

// 게시물 검색
exports.searchPosts = async (req, res) => {
    const { keyword } = req.query;
    console.log("검색 키워드:", keyword);

    // ✅ 검색어 없으면 에러 응답
    if (!keyword || keyword.trim() === "") {
        return res.status(400).json({ message: "검색어를 입력해주세요." });
    }

    try {
        const [posts] = await db.execute(
            `SELECT DISTINCT post.id, user.nickname, post.title, post.writing, post.date
            FROM post
            JOIN user ON post.user_id = user.id
            WHERE post.title LIKE ? OR post.writing LIKE ?
            ORDER BY post.date DESC`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        if (posts.length === 0) {
            return res.status(404).json({ message: "검색 결과가 없습니다." });
        }

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "검색 중 서버 오류" })
    }
};
