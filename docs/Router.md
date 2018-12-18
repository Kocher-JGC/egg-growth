---
#007bff  蓝
#28a745  绿
#17a2b8  info
#ffc107  黄
#dc3545  红 
#6c757d  灰
<font > </font>

---

# Router

>  描述请求的URL和具体承担执行动作的Controller的**对应关系**。
>
> 用处：统一路由规则、统一配置、查看全局路由

## 定义

### 参数及说明

```javascript
router.verb('path-match', app.controller.action);
router.verb('router-name', 'path-match', app.controller.action);
router.verb('path-match', middleware1, ..., middlewareN, app.controller.action);
router.verb('router-name', 'path-match', middleware1, ..., middlewareN, app.controller.action);
```


- verb - <font color=#007bff>用户触发动作</font>，支持 get，post 等所有 HTTP 方法

  - router.head - HEAD
  - router.options - OPTIONS
  - router.get - GET
  - router.put - PUT
  - router.post - POST
  - router.patch - PATCH
  - router.delete - DELETE
  - router.del - 由于 delete 是一个保留字，所以提供了一个 delete 方法的别名。
  - router.redirect - 可以对 URL 进行重定向处理，比如我们最经常使用的可以把用户访问的根目录路由到某个主页。

- router-name <font color=#007bff>给路由设定一个别名</font>，可以通过 Helper 提供的辅助函数 `pathFor` 和 `urlFor` 来生成 URL。(可选)

- path-match -<font color=#007bff> 路由 URL 路径。</font>

- middleware(1-N) - <font color=#007bff>在 Router 里面可以配置多个 Middleware。</font>(可选)

  <font color=dc3545>可以支持多个 Middleware 串联执行</font>

- controller -<font color=#007bff> 指定路由映射到的具体的 controller 上</font>，controller 可以有两种写法：

  - `app.controller.user.fetch` - 直接指定一个<font color=dc3545>具体的 controller</font>
  - `'user.fetch'` - 可以<font color=dc3545>简写为字符串形式</font>

  **注意：** 

  1. Controller 必须定义在 <font color=28a745>`app/controller` </font>目录中
  2. <font color=28a745>`${directoryName}.${fileName}.${functionName}`</font>  形如：controller.v1.comments.create  // app/controller/v1/comments.js

### 路由定义的方式

```javascript
// app/router.js
module.exports = app => {
  const { router, controller } = app;
  router.get('/home', controller.home); // home 下的路由使用home控制器
  router.get('/user/:id', controller.user.page); // user下路由使用user控制器的page方法，传参是id
  router.post('/admin', isAdmin, controller.admin); 
  router.post('/user', isLoginUser, hasAdminPermission, controller.user.create); // user 下的路由，使用了2个中间件，最后调用user控制器下的create方法
  router.post('/api/v1/comments', controller.v1.comments.create); // app/controller/v1/comments.js
};
```



### RESTful 风格的 URL 定义

> <font color=17a2b8>一枚可以简单定义的神器啊！！</font>
>
> `app.resources('routerName', 'pathMatch', controller)` 快速在一个路径上生成 [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) 路由结构。

```javascript
// app/router.js
module.exports = app => {
  const { router, controller } = app;
  router.resources('posts', '/api/posts', controller.posts);
  router.resources('users', '/api/v1/users', controller.v1.users); // app/controller/v1/users.js
};
```

上面代码就在  <font color=28a745>`/posts`</font>路径上部署了一组 CRUD 路径结构，对应的 Controller 为  <font color=28a745>`app/controller/posts.js`</font> 接下来， 你只需要在 `posts.js` 里面实现对应的函数就可以了。

> 赶紧看看这表格，想想是不是可以节省很多时间，规范很多

| Method | Path            | Route Name | Controller.Action             |
| ------ | --------------- | ---------- | ----------------------------- |
| GET    | /posts          | posts      | app.controllers.posts.index   |
| GET    | /posts/new      | new_post   | app.controllers.posts.new     |
| GET    | /posts/:id      | post       | app.controllers.posts.show    |
| GET    | /posts/:id/edit | edit_post  | app.controllers.posts.edit    |
| POST   | /posts          | posts      | app.controllers.posts.create  |
| PUT    | /posts/:id      | post       | app.controllers.posts.update  |
| DELETE | /posts/:id      | post       | app.controllers.posts.destroy |

```javascript
// 与上述表格对应理解，当不需要某几个方法的时候，不写在posts.js，即可对应路由也不会注册。
// app/controller/posts.js  
exports.index = async () => {};
exports.new = async () => {};
exports.create = async () => {};
exports.show = async () => {};
exports.edit = async () => {};
exports.update = async () => {};
exports.destroy = async () => {};
```



### 例子

#### 1、简单定义URL规则（获取get参数）

```javascript
// app/router.js
module.exports = app => {
  // 在app中获取router 和 controller  
  const { router, controller } = app;
  // git请求 /user 获取get请求参数id
  router.get('/user/:id/:name', controller.user.info);
};
```

##### controller

```javascript
// app/controller/user.js
class UserController extends Controller {
  async info() {
    // 拿到context
    const { ctx } = this;
    ctx.body = { // 获取‘请求参数 ，然后输出到body
      name: `hello ${ctx.params.id} you name is ${ctx.params.name}`,
    };
  }
}
```

#### 2、对比不同的参数的获取

```javascript
// app/router.js
module.exports = app => {
  const { router, controller } = app;
  // url 写法 /user/123/name
  router.get('/user/:id/:name', controller.user.info);
  // url 写法 /user/search?name=searchName
  router.get('/user/search',controller.user.search);
  // 获取POST
  router.post('/user/form',controller.user.form);
};
```

##### controller

```javascript
// app/controller/user.js
class UserController extends Controller {
  async info() {
    const { ctx } = this;
    ctx.body = { 
      // 在params中获取参数
      name: `hello ${ctx.params.id} you name is ${ctx.params.name}`,
    };
  }
  async search() {
    const { ctx } = this;
    ctx.body = `search: ${ctx.query.name}`; // 在query中获取参数
  }
  async form() {
    const { ctx } = this;
    // 在request.body中获取所有post  // 以及注意csrf攻击
    ctx.body = `body: ${JSON.stringify(ctx.request.body)}`;
  }
}
```

#### 3、不同使用的整合（引入路由、正则、别名、第二种控制器写法、重定向）

```javascript
/** 主要解析路由的定义和作用、不写控制器。 如需查看可以查看，/app/controller/router/* **/
module.exports = app => {
  const { router, controller, middlewares } = app;
  // 引入router下面的router-user路由规则
  require('./router/router-user')(app);
  // 对比下面两条1、两种控制器的写法2、如何路由取别名3、使用中间件
  router.get('/', controller.router.home.index);
  router.get('s', '/search', middlewares.uppercase(), 'router.package.search');

  // 正则使用 --> 形如：/package/paramKey/paramVal
  router.get(/^\/package\/([\w-.]+\/[\w-.]+)$/, controller.router.package.detail);

  // 重定向
  router.get('index', '/home/index', controller.router.home.index);
  router.redirect('/', '/home/index', 302);
  // 外部重定向 主要利用ctx.redirect进行重定向
};
```

#### 4、RESTful 风格

> 主要理解RESTful风格支持哪些请求、以及接受请求后对应的controller如何处理
>
> 规定的有哪几种请求，如何使用。对应的fn是哪个。

> 没有写页面的同学可以使用Postman或Altair GraphQL或curl等工具请求

```javascript
// app/router.js // 就这么简单，重在理解
module.exports = app => {
  const { router, controller } = app;
  router.resources('posts', '/api/posts', controller.posts);
};
```

#### 5、egg-router-plus插件

官方也提供了一个[egg-router-plus](https://github.com/eggjs/egg-router-plus)插件来进行，路由管理。看了看教程感觉不好用就没写了。

感觉直接引入文件，更直观好用。