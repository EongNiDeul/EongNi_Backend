const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('백엔드 서버가 작동 중입니다!');
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT} 에서 서버 실행 중 엉니야 엉니`);
});
