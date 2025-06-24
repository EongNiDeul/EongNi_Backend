const db = require("../config/db");

// 날짜순 정렬 오름차순
exports.getDateSortedPosts = async (req, res) => {
  try {
    const [date_sort] = await db.query("SELECT * FROM post ORDER BY date ASC");
    res.status(200).json(date_sort);
  } catch (err) {
    console.error("날짜순 정렬 에러:", err);
    res.status(500).json({ message: "서버 에러 발생" });
  }
};

// 가나다순 정렬 
exports.getAbcSortedPosts = async (req, res) => {
  try {
    // COLLATE utf8mb4_unicode_ci를 붙여야 한글도 가나다순으로 정확히 정렬됨
    const [abc_sort] = await db.query(
      "SELECT * FROM post ORDER BY writing COLLATE utf8mb4_unicode_ci ASC"
    );
    res.status(200).json(abc_sort);
  } catch (err) {
    console.error("가나다순 정렬 에러:", err);
    res.status(500).json({ message: "서버 에러 발생" });
  }
};