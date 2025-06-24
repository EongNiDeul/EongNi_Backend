const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); // 컨트롤러 불러오기

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/:id", userController.getUserById);

module.exports = router;
