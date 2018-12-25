'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middlewares } = app;
  router.get('/', controller.router.home.index);

  // 导入user路由 // 也可以使用egg-router-plus 但是看例子好像不好用
  require('./router/router-user')(app);
  require('./router/router-mysql')(app);

  // app/controller/package.js // /package/paramKey/paramVal
  router.get(/^\/package\/([\w-.]+\/[\w-.]+)$/, controller.router.package.detail);
  // 取别名、路由监听、 使用中间件 、 对应控制器(采用了写法二)
  router.get('s', '/search', middlewares.uppercase(), 'router.package.search');

  // 重定向
  router.get('index', '/home/index', controller.router.home.index);
  router.redirect('/', '/home/index', 302);
  // 外部重定向
  router.get('/search', controller.router.home.search);

  // RESTful API
  // router.resources('users', '/users', controller.users);
};
