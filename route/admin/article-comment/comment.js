// 导入文章评论集合
let { Comment } = require('../../../model/comment');
// 导入 mongoose 模块
let mongooseSexPage = require('mongoose-sex-page');

module.exports = async (req, res) => {
  // 接收客户端传递的页码
  let page = req.query.page;
  // 标识 当前访问的是用户管理页面 用于左侧菜单栏切换
  req.app.locals.currentLink = 'comment';
  // 查询所有文章
  // page 指定当前页
  // size 指定每页显示的数据条数
  // display 指定客户端要显示的页码数量
  // exec 向数据库中发送查询请求
  let comment = await mongooseSexPage(Comment).find().page(page).size(4).display(3).populate('uid').exec();

  // res.send(comment);
  res.render('admin/comment', {
    comments: comment
  });
};