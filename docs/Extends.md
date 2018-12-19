# 框架扩展

## Application

> **app**对象指的是Koa的全局应用对象，全局只有一个，在应用启动时被创建

**访问：**

1. ctx.app
2. Controller，Middleware，Helper，Service 中都可以通过<font color=28a745> `this.app` </font>访问到 Application 对象，例如 <font color=28a745>`this.app.config` </font>访问配置对象。
3. 在 `app.js` 中 `app` 对象会作为第一个参数注入到入口函数中

**扩展：**

```javascript
// app/extend/application.js  // 在此文件定义的对象与Koa Application的prototype对象进行合并
const BAR = Symbol('Application#bar');
module.exports = {
  foo(param) { // 扩展foo方法
    // this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性
  },
  get bar() {
    if (!this[BAR]) {
      this[BAR] = this.config.xx + this.config.yy;
    }
    return this[BAR];
  },
};
```

## Context

> Context指的是Koa的请求上下文，请求级别的对象。（每次请求都会实例一个context实例）

**访问：**

- middleware 中 <font color=28a745>`this`</font> 就是 ctx，例如<font color=28a745> `this.cookies.get('foo')`</font>。
- controller 有两种写法，类的写法通过<font color=28a745> `this.ctx`</font>，方法的写法直接通过<font color=28a745> `ctx` </font>入参。
- helper，service 中的 this 指向 helper，service 对象本身，使用 <font color=28a745>`this.ctx` </font>访问 context 对象，例如 <font color=28a745>`this.ctx.cookies.get('foo')`。</font>

**扩展：**  <font color=28a745>/app/extend/context.js  </font> 理解和方式同上，对象合并于Koa Context的prototype

## Request

> Request 对象和 Koa 的 Request 对象相同，是 **请求级别** 的对象，它提供了大量请求相关的属性和方法供使用。

**访问：** ctx.request

​	ctx 上的很多属性和方法都被代理到 `request` 对象上，对于这些属性和方法使用 `ctx` 和使用 `request` 去访问它们是等价的，例如<font color=28a745> `ctx.url === ctx.request.url`。</font>

**扩展：**<font color=28a745> /app/extend/request.js </font>理解和方式同上，对象合并于内置的 request的prototype

## Response

> Response 对象和 Koa 的 Response 对象相同，是 **请求级别** 的对象，它提供了大量响应相关的属性和方法供使用。

**访问：** ctx.response

​	ctx 上的很多属性和方法都被代理到 `response` 对象上，对于这些属性和方法使用 `ctx` 和使用 `response` 去访问它们是等价的，例如 <font color=28a745>`ctx.status = 404`</font> 和 <font color=28a745>`ctx.response.status = 404` </font>是等价的。

**扩展：** <font color=28a745>/app/extend/response.js </font>理解和方式同上，对象合并于 内置的response的prototype

## Helper

> Helper 函数用来提供一些实用的 utility 函数。
>
> 它的作用在于我们可以将一些常用的动作抽离在 helper.js 里面成为一个独立的函数，这样可以用 JavaScript 来写复杂的逻辑，避免逻辑分散各处。另外还有一个好处是 Helper 这样一个简单的函数，可以让我们更容易编写测试用例。
>
> 框架内置了一些常用的 Helper 函数。我们也可以编写自定义的 Helper 函数。

**访问：**

```javascript
/** 通过ctx.helper 访问到helper对象 **/
// 假设在 app/router.js 中定义了 home router
app.get('home', '/', 'home.index');

// 使用 helper 计算指定 url path
ctx.helper.pathFor('home', { by: 'recent', limit: 20 })
// => /?by=recent&limit=20
```

**扩展：**

> 框架会把 <font color=28a745>`app/extend/helper.js` </font>中定义的对象与内置 `helper` 的 prototype 对象进行合并，在处理请求时会基于扩展后的 prototype 生成 `helper` 对象。

```javascript
// app/extend/helper.js
module.exports = {
  foo(param) {
    // this 是 helper 对象，在其中可以调用其他 helper 方法
    // this.ctx => context 对象
    // this.app => application 对象
  },
};
```

## 按照环境进行扩展

另外，还可以根据环境进行有选择的扩展，例如，只在 unittest 环境中提供 `mockXX()` 方法以便进行 mock 方便测试。

```javascript
// app/extend/application.unittest.js
module.exports = {
  mockXX(k, v) {
  }
};
```

这个文件只会在 unittest 环境加载。

同理，对于 Application，Context，Request，Response，Helper 都可以使用这种方式针对某个环境进行扩展