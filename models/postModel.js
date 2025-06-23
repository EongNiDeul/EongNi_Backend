const db = require('../config/db');

exports.insertPost = async (userId, title, content) => {
  const query = `INSERT INTO posts (user_id, title, content, writing_date) VALUES (?, ?, ?, NOW())`;
  await db.execute(query, [userId, title, content]);
};