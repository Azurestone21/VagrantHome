// 导入用户集合构造函数
let { User } = require('../../model/user');
// 导入bcrypt
let bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // res.send(req.body);
  // 接收请求参数
  let {name, email, password, password2} = req.body;

  // 根据邮箱地址查询用户信息
  // 如果查询到用户，user变量为对象类型
  // 如果没有查询到用户，user变量为空
  let user = await User.findOne({email: email});
  // res.send(user);
  // 查询到用户
  if (user) {
    req.app.locals.registerError = '邮箱地址已注册';
    // 重定向注册列表
    res.redirect('/home/register');
  } else {
    // 邮箱不存在，注册用户，对密码进行加密
    // 生成随机字符串
    let salt = await bcrypt.genSalt(10);
    // 加密
    let pass = await bcrypt.hash(password, salt);
    // res.send(pass);

    // 将用户信息添加到数据库中
    let user = await User.create({
      username: name,
      email: email,
      password: pass,
      role: 'normal',
      state: '0'
    });

    // 将页面重定向到登录页面
    res.redirect('/admin/login');
  }
};

