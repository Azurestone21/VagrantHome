// 引用express框架
let express = require('express');
// 创建博客展示页面路由
let home = express.Router();

// 渲染 注册 页面
home.get('/register', require('./home/registerPage'));

// 前台 注册 路由
home.post('/register', require('./home/register'));

// 实现退出功能
home.get('/logout', require('./admin/logout'));

// 前台 首页 路由
home.get('/', require('./home/index'));

// 前台 关于 ta 们 路由
home.get('/adopt', require('./home/adopt'));

// 前台 须知 路由
home.get('/knowledge', require('./home/knowledge'));

// 前台 文章 路由
home.get('/article', require('./home/article'));

// 前台 文章评论 路由
home.post('/comment', require('./home/comment'));

module.exports = home;