'use strict';

// app.js
module.exports = app => {
  /** Middleware -- Start **/
  console.log('user app');
  // 在中间件最前面统计请求时间
  app.config.coreMiddleware.unshift('report');
  /** Middleware -- End **/
};
