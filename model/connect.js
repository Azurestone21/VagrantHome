// 引入mongoose第三方模块
let mongoose = require('mongoose');
// 连接数据库
mongoose.connect('mongodb://localhost:27017/vagrantHome',{ useUnifiedTopology: true })
  .then(() => console.log('数据库连接成功'))
  .catch(() =>  console.log('数据库连接失败'));