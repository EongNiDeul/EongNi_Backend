const express = require("express");
const db = require("../config/db");

const router = express.Router();

// 날짜순 정렬 (기존)
router.get("/date_sort", async (req, res) => {
  const [date_sort] = await db.query("SELECT * FROM post ORDER BY date ASC");
  res.status(200).json(date_sort);
});

// 가나다순 정렬 (한글 닉네임 기준)
router.get("/abc_sort", async (req, res) => {
  try {
    const [abc_sort] = await db.query("SELECT * FROM post ORDER BY writing COLLATE utf8mb4_unicode_ci ASC");
    res.status(200).json(abc_sort);
  } catch (err) {
    console.error("가나다순 정렬 에러:", err);
    res.status(500).json({ message: "서버 에러 발생" });
  }
});

module.exports = router;
