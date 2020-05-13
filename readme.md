## 项目介绍

流浪动物领养网站

1. 发布领养向您西
2. 发布关于猫狗的小知识

## 项目初始化

+ 写好html页面

+ 建立项目所需文件夹

  public 静态资源

  model 数据库操作

  route 路由

  views 模板

+ 初始化项目描述文件
  npm init -y

下载项目所需第三方模块

+ 基于Node.js的Web开发框架

  cnpm install express --save

+ mongoose 数据库

  cnpm install mongoose --save

+ 模板引擎art-template

  cnpm install art-template --save

+ express-art-template主要是用在express中（为了能让art-template在express框架中更好的使用，在原来的基础上进行了进一步封装）

  cnpm install express-art-template --save

+ 监听代码文件改动，自动重启
   cnpm install -g  nodemon

+ 密码加密 

   cnpm install bcrypt

+ 接收表单post的数据

   cnpm install body-parser --save

+ 表单信息验证

  cnpm install Joi --save

+ 处理表单，get/post/文件

  cnpm install formidable --save

+ 处理时间

  cnpm install dateformat --save

+ cookie/session

  cnpm install express-session

+ 对对象规则描述语言和验证器

  cnpm install joi

+ 数据分页

  cnpm install mongoose-sex-page

### 创建网站服务器

express

### 构建模块化路由

### 构建博客管理页面模板

express-art-template

### 启动mongoose

mongo

mongod --dbpath D:\Servers\MongoDB\Server\4.2\data\db



## 后台管理系统

### 连接数据库

```js
// 引入mongoose第三方模块
let mongoose = require('mongoose');
// 连接数据库
mongoose.connect('mongodb://localhost:27017/vagrantHome',{ useUnifiedTopology: true })
  .then(() => console.log('数据库连接成功'))
  .catch(() =>  console.log('数据库连接失败'));
```

### 用户

#### 登录

+ 创建用户集合，初始化用户

  1.创建用户集合

  2.初始化用户

```js
// 引入mongoose第三方模块
let mongoose = require('mongoose');
// 导入bcrypt
let bcrypt = require('bcryptjs');
// 引入joi模块
let joi = require('joi');

// 创建用户集合规则
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 10
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  // admin 超级管理员
  // normal 普通用户
  role: {
    type: String,
    required: true,
  },
  // 0 启动
  // 1 禁用
  state: {
    type: Number,
    required: true,
  }
});

// 创建集合
let User = mongoose.model('User', userSchema);

async function createUser() {
  let salt = await bcrypt.genSalt(10);
  let pass = await bcrypt.hash('123456', salt);
  let user = await User.create({
    username: 'zhangsan',
    email: 'zhansan123@163.com',
    password: pass,
    role: 'admin',
    state: '0'
  })
}
// createUser();

// 验证用户信息
let validateUser = user => {
  // 定义对象的验证规则
  let schema = {
    username: joi.string().min(2).max(12).required().error(new Error('用户名格式不符合要求')),
    email: joi.string().email().required().error(new Error('邮箱格式不符合要求')),
    password: joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required().error(new Error('密码格式不符合要求')),
    role: joi.string().valid('normal', 'admin').required().error(new Error('角色值非法')),
    state: joi.number().valid('0', '1').required().error(new Error('状态值非法')),
  };
  // 验证
  return joi.validate(user, schema);
};

// 将用户集合作为模块成员进行导出
module.exports = {
  User,
  validateUser
};
```

+ 为登录表单项设置请求地址、请求方式以及表单项name属性
+ 当用户点击登录按钮时，客户端验证用户是否填写了登录表单
+ 如果其中一项没有输入，阻止表单提交

```js
<script>
    // 为表单添加提交事件
    $('#login-form').on('submit', function () {
      // 获取表单中用户输入信息
      let result = serializeArrayToJson($(this));
      // console.log(result);
      // 验证表单信息
      if (result.email.trim().length == 0) {
        alert('请输入邮箱地址');
        // 阻止程序向下执行
        return false;
      }
      if (result.password.trim().length == 0) {
        alert('请输入密码');
        // 阻止程序向下执行
        return false;
      }
    })
  </script>
```

+ 服务器端接收请求参数，验证用户是否填写了登录表单

+ 如果其中一项没有输入，为客户端做出响应，阻止程序向下执行

+ 根据邮箱地址查询用户信息

+ 如果用户不存在，为客户端做出响应，阻止程序向下执行

+ 如果用户存在，将用户名和密码进行比对

+ 比对成功，用户登录成功

+ 比对失败，用户登录失败

+ 保存登录状态

+ 密码加密处理 

```js
// 导入用户集合构造函数
let { User } = require('../../model/user');
// 导入bcrypt
let bcrypt = require('bcryptjs');

let login = async  (req, res) => {
  // res.send(req.body);
  // 接收请求参数
  let {email, password} = req.body;
  // 如果用户没有输入邮箱
  if (email.trim().length == 0 || password.trim().length == 0) {
    // return res.status(400).send('<h4>邮箱地址或者密码错误</h4>');
    return res.status(400).render('admin/error', {msg: '邮箱地址或者密码错误'});
  }

  // 根据邮箱地址查询用户信息
  // 如果查询到用户，user变量为对象类型
  // 如果没有查询到用户，user变量为空
  let user = await User.findOne({email: email});
  // 查询到用户
  if (user) {
    // 将客户端传递过来的密码和用户信息中的密码进行比对
    // true 成功  false 失败
    let isValid = await bcrypt.compare(password, user.password);
    // 密码一致
    if (isValid) {
      // 将用户名存储在请求对象中
      // session自动生成sessionId，保存到cookie
      req.session.username = user.username;
      req.session.role = user.role;
      // res.send('登录成功');
      // app.locals全局可用
      req.app.locals.userInfo = user;
      // 对用户的角色进行判断
      if (user.role === 'admin') {
        // 重定向用户列表
        res.redirect('/admin/user');
      } else {
        // 重定向首页
        res.redirect('/home/');
      }
    } else {
      res.status(400).render('admin/error', {msg: '邮箱地址或者密码错误'});
    }
  } else {
    // 没有查询到用户
    res.status(400).render('admin/error', {msg: '邮箱地址或者密码错误'});
  }
};

module.exports = login;
```



#### **新增用户**

1. 为用户列表页面的新增用户按钮添加链接

2. 添加一个连接对应的路由，在路由处理函数中渲染新增用户模板
3. 为新增用户表单指定请求地址、请求方式、为表单项添加name属性

4. 增加实现添加用户的功能路由

5. 接收到客户端传递过来的请求参数

6. 对请求参数的格式进行验证

7. 验证当前要注册的邮箱地址是否已经注册过

8. 对密码进行加密处理

##### **密码加密** **bcrypt**（我是用的是bcryptjs）

```shell
bcrypt依赖的其他环境
1. python 2.x
2. node-gyp
    npm install -g node-gyp
3. windows-build-tools
    npm install --global --production windows-build-tools
```

使用

```js
// 导入bcryptjs模块
const bcryptjs = require('bcrypt');
// 生成随机字符串 gen => generate 生成 salt 盐
// genSalt里面的值越大，得出的随机字符串越复杂
let salt = await bcryptjs.genSalt(10);
// 使用随机字符串对密码进行加密
let pass = await bcryptjs.hash('明文密码', salt);

// 修改用户信息时需要验证
// 密码比对
let isEqual = await bcrypt.compare('明文密码', '加密密码');
```



9. 将用户信息添加到数据库中

10. 重定向页面到用户列表页面

#### **数据分页**

普通方法

```js
// 引用用户集合构造函数
let { User } = require('../../../model/user');

module.exports = async (req, res) => {
  // 标识 当前访问的是用户管理页面 用于左侧菜单栏切换
  req.app.locals.currentLink = 'user';

  // 接收客户端传递的当前页参数
  let page = req.query.page || 1;
  // 每页显示的数据条数
  let pageSize = 10;
  // 查询用户数据的总数
  let count = await User.countDocuments({});
  // 总页数
  let total = Math.ceil(count / pageSize);

  // 页码对应的数据查询开始位置
  let start = (page - 1) * pageSize;

  // 将用户信息从数据库中查询出来
  let users = await User.find({}).limit(pageSize).skip(start);
  // res.send(users);
  // 渲染用户列表
  res.render('admin/user', {
    users: users,
    page: page,
    total: total
  })
};
```

模块

```js
// 导入文章集合
let { Article } = require('../../../model/article');
// 导入 mongoose 模块
let mongooseSexPage = require('mongoose-sex-page');

module.exports = async (req, res) => {
  // 接收客户端传递的页码
  let page = req.query.page;
  // 标识 当前访问的是用户管理页面 用于左侧菜单栏切换
  req.app.locals.currentLink = 'article';
  // 查询所有文章
  // page 指定当前页
  // size 指定每页显示的数据条数
  // display 指定客户端要显示的页码数量
  // exec 向数据库中发送查询请求
  let article = await mongooseSexPage(Article).find().page(page).size(4).display(3).populate('author').exec();

  // res.send(article);
  res.render('admin/article', {
    articles: article
  });
};
```

#### **用户信息修改**

1. 将要修改的用户ID传递到服务器端

2. 建立用户信息修改功能对应的路由

3. 接收客户端表单传递过来的请求参数 

4. 根据id查询用户信息，并将客户端传递过来的密码和数据库中的密码进行比对

5. 如果比对失败，对客户端做出响应

6. 如果密码对比成功，将用户信息更新到数据库中

#### **用户信息删除**

1. 在确认删除框中添加隐藏域用以存储要删除用户的ID值

2. 为删除按钮添自定义属性用以存储要删除用户的ID值

3. 为删除按钮添加点击事件，在点击事件处理函数中获取自定义属性中存储的ID值并将ID值存储在表单的隐藏域中

4. 为删除表单添加提交地址以及提交方式

5. 在服务器端建立删除功能路由

6. 接收客户端传递过来的id参数

7. 根据id删除用户

### 文章

### 文件读取 FileReader

页面

```js
// 处理预览上传图片文件
var file = document.querySelector("#file");
var preview = document.querySelector("#preview");
// 当用户选择完文件以后
file.onchange = function() {
    // 创建文件读取对象
    var reader = new FileReader();
    // 用户选择的文件列表
    // console.log(this.files[0]);
    // 读取文件
    reader.readAsDataURL(this.files[0]);
    // 监听onload事件
    reader.onload = function() {
        console.log(reader.result);
        // 将读取的结果显示在页面中
        preview.src = reader.result;
    }
}
```

### formidable

后台

解析表单，支持get请求参数，post请求参数、文件上传。

```js
// 引入 formidable 模块 处理上传文件信息
let formidable = require('formidable');
let path = require('path');
// 导入文章集合
let { Article } = require('../../../model/article');

module.exports = (req, res) => {
  // 创建表单解析对象
  let form = new formidable.IncomingForm();
  // 配置上传文件额存放路径
  form.uploadDir = path.join(__dirname, '../','../','../','public','uploads');
  // 保留上传文件后缀
  form.keepExtensions = true;
  // 解析表单
  form.parse(req, async (err, fields, files) => {
    // err 错误对象 表单解析失败，存储错误信息， 成功 为空
    // fields 对象类型 保存普通表单数据
    // files 对象类型 保存上传文件相关数据
    // res.send(files.cover.path.split('public')[1])
    // 创建对象，保存到数据库
    await Article.create({
      title: fields.title,
      author: fields.author,
      publishDate: fields.publishDate,
      cover: files.cover.path.split('public')[1],
      content: fields.content
    });
    // 重定向到文章列表
    res.redirect('/admin/article')
  });
};
```



### 评论

1. 创建评论集合

2. 判断用户是否登录，如果用户登录，再允许用户提交评论表单

3. 在服务器端创建文章评论功能对应的路由

4. 在路由请求处理函数中接收客户端传递过来的评论信息

5. 将评论信息存储在评论集合中

6. 将页面重定向回文章详情页面

7. 在文章详情页面路由中获取文章评论信息并展示在页面中



### cookie/session

app.js

```js
const session = require('express-session');
app.use(session({secret: 'secret key', saveUninitialized: false}));
```

login.js

```js
// 登录的用户名
// session自动生成sessionId，保存到cookie
req.session.username = user.username;
```



