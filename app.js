const cors = require("cors");
const express = require('express');
const dotenv = require('dotenv');
const app = express();

const userRoutes = require('./routes/user_api'); // 사용자 관련 라우터
const commentRoutes = require("./routes/comment_api"); // 댓글 관련 라우터
const postRouters = require("./routes/post_api"); // 게시글 관련 라우터

// .env 파일을 사용할 수 있도록 설정
dotenv.config();

// 요청의 바디를 json 형태로 파싱할 수 있게 해줌
app.use(express.json());

dotenv.config(); // .env 사용 설정
app.use(express.json()); //  JSON 파싱 설정
app.use(cors()); // ← 모든 origin 허용


// app.use(cors());
app.use(cors({                    //요청 차단 x
  origin: "http://localhost:5173", // 허용할 프론트 주소만
  credentials: true        
}));
// 회원 가입, 로그인만 함

// 포트 번호는 env에서 불러오고, 없으면 3000번
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('백엔드 서버가 작동 중입니다!');
});

//  실제 라우터 경로 등록
app.use('/api/user', userRoutes);
// app.use('/api/post', postRouters);
app.use('/api/post', require('./routes/post_api'));
app.use("/api/comment", require("./routes/comment_api"));

// api 라우터들 등록
app.use('/api/user', userRoutes); // /api/user로 시작하는 요청은 userRoutes에서 처리
app.use('/api/post', postRouters); 
app.use("/api/comment", commentRoutes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 서버 실행 중 엉니야 엉니`);
});
