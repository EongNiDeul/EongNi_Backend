const db = require("../config/db");
const bcrypt = require("bcrypt");

// 회원가입
exports.register = async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;
  //넥네임, 비밀번호, 비번 확인 받아오고

  //다 입력해야 하고
  if (!nickname || !password || !confirmPassword) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  //비번 일치 확인하기
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // 닉네임으로 유저를 봤을 때 0보다 크다는 것은 이미 있다는 것이니까 엘
  const [existingUser] = await db.query("SELECT * FROM user WHERE nickname = ?", [nickname]);
  if (existingUser.length > 0) {
    return res.status(409).json({ message: "이미 존재하는 닉네임입니다." });
  }

  //저장할 떄 해시로
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화, 암호화에 걸리는 복잡도 일반적이게 10으로
    await db.query(
      "INSERT INTO user (nickname, password, level, created_at) VALUES (?, ?, ?, NOW())",
      [nickname, hashedPassword, 1]     // 해시패스워드로 저장
    );
    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

// 로그인
exports.login = async (req, res) => {
  const { nickname, password } = req.body;
  //똑같이 받아오고, 다 입력해야 하고
  if (!nickname || !password) {
    return res.status(400).json({ message: "닉네임과 비밀번호를 모두 입력해주세요." });
  }

  //닉네임으로 유저를 봤을 때 0이면 없는거니까
  try {
    const [rows] = await db.query("SELECT * FROM user WHERE nickname = ?", [nickname]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "존재하지 않는 닉네임입니다." });
    }

    const user = rows[0];

    // 암호화된 비밀번호와 비교
    //bcrypt.compare()가 알아서 비교해줌, 입력값을 다시 암호화해서 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
};

// 유저 정보 조회
exports.getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    // 유저 테이블과 레벨 설명 테이블을 연결해서 정보를 가져옴
    // 레벨 번호에 맞는 레벨 문구를 함께 보여주기 위해 JOIN 사용
    // LEFT JOIN    유저 정보는 항상 출력되도록 하기 위함
    const [rows] = await db.query(
      `
      SELECT 
        u.id, u.nickname, u.level, u.comment_count, u.created_at,
        li.title AS level_title
      FROM 
        user u
      LEFT JOIN 
        level_info li
      ON 
        u.level = li.level
      WHERE 
        u.id = ?
       
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("유저 조회 에러:", err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
