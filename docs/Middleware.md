# Middleware(中间件)

## 书写

> 约定：： 中间件写在 /app/middleware目录下

```javascript
// 写一个 gzip 中间件 /app/middleware/gzip.js
const isJSON = require('koa-is-json');
const zlib = require('zlib');

module.exports = options => {
  return async function gzip(ctx, next) {
    await next();
    // 返回的时候写gzip中间件内容所以在 await next(); 后
	...  // 该怎么写怎么写
  };
};
// 和写一个module没啥区别
```



## 使用

​	<font color=#dc3545>**注意：框架和插件加载的中间件会在应用层配置的中间件之前，框架默认中间件不能被应用层中间件覆盖，如果应用层有自定义同名中间件，在启动时会报错。**</font>

### 应用级别的使用

#### 1、在config.default.js中

> config中的配置最终会合并到 <font color=#dc3545>`app.config.appMiddleware` </font>中

```js
module.exports = {
  // 配置需要的应用级中间件，数组顺序即为中间件的加载顺序
  middleware: [ 'gzip' ],
  // 配置 gzip 中间件的配置
  gzip: {
    threshold: 1024, // 小于 1k 的响应体不压缩
  },
};
```

#### 2、在框架和插件中使用中间件（拿app.js为例子）

> 应用层定义的中间件（ <font color=#dc3545>`app.config.appMiddleware`</font>）和框架默认中间件（ <font color=#dc3545>`app.config.coreMiddleware`</font>）都会被加载器加载，并挂载到  <font color=#dc3545>`app.middleware`</font> 上。

```javascript
module.exports = app => {
  app.config.coreMiddleware.unshift('report');  // 在中间件最前面统计请求时间
};
```

### router 中使用中间件(路由中单独使用)

```javascript
module.exports = app => {
  const gzip = app.middleware.gzip({ threshold: 1024 }); // 传入配置
  app.router.get('/needgzip', gzip, app.controller.handler);
};
```

### 使用Koa的中间件

```javascript
// 方式一  // app/middleware/compress.js
// koa-compress 暴露的接口(`(options) => middleware`)和框架对中间件要求一致
module.exports = require('koa-compress');

// 方式二  // app/middleware/webpack.js
const webpackMiddleware = require('some-koa-middleware');
module.exports = (options, app) => {
  return webpackMiddleware(options.compiler, options.others);
}
```

## 配置

> 插件（注意options的来源）

```javascript
// 在/app/middleware/gzip.js中使用
module.exports = options => {
  return async gzip(ctx, next) => {
    await next();
	...
    // 支持 options.threshold 
    // options：如果是config全局使用则，是config的配置
    // options：如果是router调用传入则是调用传入的config
    if (options.threshold && ctx.length < options.threshold) return;
	...
    ctx.set('Content-Encoding', 'gzip');
  };
};
```

### 在config.default.js中

```javascript
module.exports = {
   /** 反正有的配置在这里配置就行 **/
  // 配置 gzip 中间件的配置
  gzip: {
    threshold: 1024, // 小于 1k 的响应体不压缩
  },
  // 配置 框架中默认的中间件  
  bodyParser: {
    jsonLimit: '10mb',
  },
};
```

### 在router中使用

```javascript
module.exports = app => {
  const gzip = app.middleware.gzip({ threshold: 1024 }); // 传入和使用配置
  app.router.get('/needgzip', gzip, app.controller.handler);
};
```

### 通用的配置

- enable：控制中间件是否开启。
- match：设置只有符合某些规则的请求才会经过这个中间件。
- ignore：设置符合某些规则的请求不经过这个中间件。

```javascript
module.exports = {
  gzip: {
    enable: false,
    match(ctx) { // 支持 string、RegExp、fn
      // 只有 ios 设备才开启
      const reg = /iphone|ipad|ipod/i;
      return reg.test(ctx.get('user-agent'));
    },
  },
};
```

match 和 ignore 支持多种类型的配置方式

1. 字符串：当参数为字符串类型时，配置的是一个 url 的路径前缀，所有以配置的字符串作为前缀的 url 都会匹配上。 当然，你也可以直接使用字符串数组。
2. 正则：当参数为正则时，直接匹配满足正则验证的 url 的路径。
3. 函数：当参数为一个函数时，会将请求上下文传递给这个函数，最终取函数返回的结果（true/false）来判断是否匹配。