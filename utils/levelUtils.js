exports.calculateLevel = (commentCount) => {
  return Math.min(10, Math.floor(commentCount / 5) + 1);
};