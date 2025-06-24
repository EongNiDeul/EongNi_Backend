const express = require("express");
const router = express.Router();
const postSortController = require("../controllers/postSortController");

// 날짜순 정렬
router.get("/date_sort", postSortController.getDateSortedPosts);

// 가나다순 정렬
router.get("/abc_sort", postSortController.getAbcSortedPosts);

module.exports = router;
