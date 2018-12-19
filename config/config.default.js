'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1545112590963_9152';

  /** Middleware -- Start **/
  // 修改框架中自带的中间件配置
  // config.bodyParser = {
  //   jsonLimit: '10mb',
  // };
  // 注意：框架和插件加载的中间件会在应用层配置的中间件之前，
  // 框架默认中间件不能被应用层中间件覆盖，
  // 如果应用层有自定义同名中间件，在启动时会报错。

  // 配置需要的中间件，数组顺序即为中间件的加载顺序
  config.middleware = [
    'gzip',
    // 'compress',
  ]; // 配置应用级别中间件。每次每个请求都会用
  // 配置 gzip 中间件的配置
  config.gzip = {
    threshold: 1024, // 小于 1k 的响应体不压缩
  };

  // 使用 Koa 的中间件 （此处是配置）
  // config.compress = {
  //   threshold: 2048,
  // };
  // config.webpack = {
  //   compiler: {},
  //   others: {},
  // };

  /** 中间件的通用配置 **/
  // enable：控制中间件是否开启。
  // match：设置只有符合某些规则的请求才会经过这个中间件。
  // ignore：设置符合某些规则的请求不经过这个中间件。
  // config.gzip = {
  //   // match: '/static', // ParamType == string | RegExp | FN
  //   match(ctx) {
  //     // 只有 ios 设备才开启
  //     const reg = /iphone|ipad|ipod/i;
  //     return reg.test(ctx.get('user-agent'));
  //   },
  // };

  /** Middleware -- End **/

  config.security = {
    csrf: false, // csrf的防范
  };

  return config;
};
