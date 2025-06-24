const express = require("express");
const router = express.Router();
const postSortController = require("../controllers/postSortController");

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

// 날짜순 정렬
router.get("/date_sort", postSortController.getDateSortedPosts);

// 가나다순 정렬
router.get("/abc_sort", postSortController.getAbcSortedPosts);

// 게시물 검색
router.get("/search", postController.searchPosts);

module.exports = router;
