'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/user/:id/:name', controller.router.user.info);
  // get query String 数据 url?name=name
  router.get('/user/index', controller.router.user.index);
  // post
  router.post('/user/form', controller.router.user.form);
  // 表单post请求+验证插件
  router.post('/user/form-post', controller.router.user.formPost);
};
