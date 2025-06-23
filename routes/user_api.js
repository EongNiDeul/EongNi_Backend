const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  if (!nickname || !password || !confirmPassword) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  const [existingUser] = await db.query("SELECT * FROM user WHERE nickname = ?", [nickname]);
  if (existingUser.length > 0) {
    return res.status(409).json({ message: "이미 존재하는 닉네임입니다." });
  }

  // 암호화 없이 저장
  await db.query(
    "INSERT INTO user (nickname, password, level, created_at) VALUES (?, ?, ?, NOW())",
    [nickname, password, 1]
  );

  res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 로그인
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ message: "닉네임과 비밀번호를 모두 입력해주세요." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM user WHERE nickname = ?", [nickname]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 닉네임입니다." });
    }

    const user = rows[0];

    // 그냥 문자열 비교
    if (password !== user.password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    res.status(200).json({
      message: "로그인 성공!",
      user: {
        id: user.id,
        nickname: user.nickname,
        level: user.level,
      },
    });
  } catch (err) {
    console.error("로그인 에러:", err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

//추가로 유저 정보 조회
router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query("SELECT id, nickname, level, comment_count, created_at FROM user WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("유저 조회 에러:", err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
