# Plugin

## 插件和中间件

### 为什么要插件

我们在使用 Koa 中间件过程中发现了下面一些问题：

1. 中间件加载其实是有先后顺序的，但是中间件自身却无法管理这种顺序，只能交给使用者。这样其实非常不友好，一旦顺序不对，结果可能有天壤之别。
2. 中间件的定位是拦截用户请求，并在它前后做一些事情，例如：鉴权、安全检查、访问日志等等。但实际情况是，有些功能是和请求无关的，例如：定时任务、消息订阅、后台逻辑等等。
3. 有些功能包含非常复杂的初始化逻辑，需要在应用启动的时候完成。这显然也不适合放到中间件中去实现。

综上所述，我们需要一套更加强大的机制，来管理、编排那些相对独立的业务逻辑。（使用插件）

### 一个插件

> 插件是一个迷你的APP

1. 包含Service、中间件、配置、框架扩展等
2. 没有独立的Router和Controller
3. 与其他插件最多只存在依赖关系

### 中间件、插件、应用的关系

- 应用可以直接引入 Koa 的中间件。
- 当遇到上一节提到的场景时，则应用需引入插件。
- 插件本身可以包含中间件。
- 多个插件可以包装为一个上层框架。

## 使用

```javascript
// 先通过npm安装
{
  "dependencies": {
    // 我们建议通过 ^ 的方式引入依赖，并且强烈不建议锁定版本
    "egg-mysql": "^3.0.0" 
  }
}

// 应用或框架的 config/plugin.js 使用 mysql 插件
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

// 然后直接使用
app.mysql.query(sql, values);
```

### 参数介绍

`plugin.js` 中的每个配置项支持：

- `{Boolean} enable` - 是否开启此插件，默认为 true
- `{String} package` - `npm` 模块名称，通过 `npm` 模块形式引入插件
- `{String} path` - 插件绝对路径，跟 package 配置互斥
- `{Array} env` - 只有在指定运行环境才能开启，会覆盖插件自身 `package.json` 中的配置

#### 配置

```javascript
/** 关闭 内置插件 **/
// 对于内置插件，可以用下面的简洁方式开启或关闭
exports.onerror = false;

/** 根据环境配置 **/
// config/plugin.local.js
exports.dev = {
  enable: true,
  package: 'egg-dev',
};
// 在loacl环境下配置了egg-dev在生产环境下npm i --production 不需要下载 egg-dev 的包了。

/** 引入方式 package 和 path **/
// package 是 npm 方式引入，也是最常见的引入方式
// path 是绝对路径引入，如应用内部抽了一个插件，但还没达到开源发布独立 npm 的阶段，或者是应用自己覆盖了框架的一些插件
// config/plugin.js
const path = require('path');
exports.mysql = {
  enable: true,
  package: 'egg-mysql', 
  path: path.join(__dirname, '../lib/plugin/egg-mysql'),
};


/** 插件的配置 **/
// config/config.default.js
exports.mysql = {
  client: {
    host: 'mysql.com',
    port: '3306',
    user: 'test_user',
    password: 'test_password',
    database: 'test',
  },
};
```

### 插件列表

框架默认内置了企业级应用常用的插件：

- onerror 统一异常处理
- Session Session 实现
- i18n 多语言
- watcher 文件和文件夹监控
- multipart 文件流式上传
- security 安全
- development 开发环境配置
- logrotator 日志切分
- schedule 定时任务
- static 静态服务器
- jsonp jsonp 支持
- view 模板引擎

更多社区的插件可以 GitHub 搜索 [egg-plugin](https://github.com/topics/egg-plugin)。