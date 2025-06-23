const cors = require("cors");
const express = require('express');
const dotenv = require('dotenv');
const app = express();
const userRoutes = require('./routes/user_api'); //  경로 주의
const commentRoutes = require("./routes/comment_api");
const postRouters = require("./routes/post_api");



dotenv.config(); // .env 사용 설정
app.use(express.json()); //  JSON 파싱 설정
app.use(cors()); // ← 모든 origin 허용


const PORT = process.env.PORT || 3000; //  .env에서 포트 불러오기, 없으면 기본 3000

app.get('/', (req, res) => {
  res.send('백엔드 서버가 작동 중입니다!');
});

//  실제 라우터 경로 등록
app.use('/api/user', userRoutes);
app.use('/api/post', postRouters);
app.use("/api/comment", commentRoutes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 서버 실행 중 엉니야 엉니`);
});
