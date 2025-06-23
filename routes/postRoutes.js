const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController.js');

router.post("/", postController.createPost);    // 게시글 작성
router.get("/", postController.getPosts);       // 게시글 전체 조회
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);


module.exports = router;
