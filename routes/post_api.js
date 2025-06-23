const express = require("express");
const db = require("../config/db");

const router = express.Router();

const postController = require('../controllers/postController.js');

// 게시글 작성
router.post("/", postController.createPost);

// 게시글 전체 조회
router.get("/", postController.getPosts);

// 게시글 수정
router.put('/:id', postController.updatePost);

// 게시글 삭제
router.delete('/:id', postController.deletePost);

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

// 게시물 검색
router.get("/search", postController.searchPosts);

module.exports = router;
