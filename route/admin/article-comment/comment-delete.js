// 导入评论集合
let { Comment } = require('../../../model/comment');

module.exports = async (req, res) => {
  // 获取要删除的评论id
  // res.send(req.query.id)
  // 根据id删除评论
  await Comment.findOneAndDelete({_id: req.query.id});
  // 将页面重定向到评论列表页面
  res.redirect('/admin/comment');
};