---
#007bff  蓝
#28a745  绿
#17a2b8  info
#ffc107  黄
#dc3545  红 
#6c757d  灰

---

# Controller

 Controller 负责**解析用户的输入，处理后返回相应的结果**,例如：

- 在 RESTful 接口中，Controller 接受用户的参数，从数据库中查找内容返回给用户或者将用户的请求更新到数据库中。
- 在 HTML 页面请求中，Controller 根据用户访问不同的 URL，渲染不同的模板得到 HTML 返回给用户。
- 在代理服务器中，Controller 将用户的请求转发到其他服务器上，并将其他服务器的处理结果返回给用户。

**框架推荐 Controller 层主要对用户的请求参数进行处理（校验、转换），然后调用对应的 service方法处理业务，得到业务结果后封装并返回：**

1. 获取用户通过 HTTP 传递过来的请求参数。
2. 校验、组装参数。
3. 调用 Service 进行业务处理，必要时处理转换 Service 的返回结果，让它适应用户的需求。
4. 通过 HTTP 将结果响应给用户。

## 编写

**约定：**所有的 Controller 文件都必须放在<font color=28a745> `app/controller` </font>目录下，可以支持多级目录，访问的时候可以通过目录名级联访问。Controller 支持多种形式进行编写，可以根据不同的项目场景和开发习惯来选择。

### 推荐

```javascript
// app/controller/post.js
const Controller = require('egg').Controller;
class PostController extends Controller {
  async create() {
    const { ctx, service } = this;
    const createRule = {
      title: { type: 'string' },
      content: { type: 'string' },
    };
    // 校验参数
    ctx.validate(createRule);
    // 组装参数
    const author = ctx.session.userId;
    const req = Object.assign(ctx.request.body, { author });
    // 调用 Service 进行业务处理
    const res = await service.post.create(req);
    // 设置响应内容和响应状态码
    ctx.body = { id: res.id };
    ctx.status = 201;
  }
}
module.exports = PostController;



/** 使用 **/
// app/router.js
module.exports = app => {
  const { router, controller } = app;
  router.post('createPost', '/api/posts', controller.post.create); // 普通  
  router.post('createPost', '/api/posts', controller.sub.post.create); // 多级文件夹
}
```

### 自定义Controller基类

> 按照类的方式编写 Controller，不仅可以让我们更好的对 Controller 层代码进行抽象（例如将一些统一的处理抽象成一些私有方法），还可以通过自定义 Controller 基类的方式封装应用中常用的方法。

```javascript
// app/core/base_controller.js
const { Controller } = require('egg');
class BaseController extends Controller {
  get user() {
    return this.ctx.session.user;
  }

  success(data) {
    this.ctx.body = {
      success: true,
      data,
    };
  }

  notFound(msg) {
    msg = msg || 'not found';
    this.ctx.throw(404, msg);
  }
}
module.exports = BaseController;


/** 继承上面的基类 **/
//app/controller/post.js
const Controller = require('../core/base_controller');
class PostController extends Controller {
  async list() {
    const posts = await this.service.listByUser(this.user);
    this.success(posts);
  }
}
```

### 兼容方法（不推荐）

```javascript
// app/controller/post.js
exports.create = async ctx => {
  const createRule = {
    title: { type: 'string' },
    content: { type: 'string' },
  };
  // 校验参数
  ctx.validate(createRule);
  // 组装参数
  const author = ctx.session.userId;
  const req = Object.assign(ctx.request.body, { author });
  // 调用 service 进行业务处理
  const res = await ctx.service.post.create(req);
  // 设置响应内容和响应状态码
  ctx.body = { id: res.id };
  ctx.status = 201;
};
```

## 获取Http请求参数

### query

在 URL 中 `?` 后面的部分是一个 Query String，这一部分经常用于 GET 类型的请求中传递参数。例如 <font color=28a745>`GET /posts?category=egg&language=node` </font>中 <font color=28a745>`category=egg&language=node`</font> 就是用户传递过来的参数。我们可以通过 <font color=28a745>`ctx.query`</font> 拿到解析过后的这个参数体

```javascript
class PostController extends Controller {
  async listPosts() {
    const query = this.ctx.query;
    // {
    //   category: 'egg',
    //   language: 'node',
    // }
  }
}

// 对于重复的key 使用queries获取
// GET /posts?category=egg&id=1&id=2&id=3
class PostController extends Controller {
  async listPosts() {
    console.log(this.ctx.queries);
    // {
    //   category: [ 'egg' ],
    //   id: [ '1', '2', '3' ],
    // }
  }
}
```

### Router params

> 在Router里面也有学习

```javascript
// app.get('/projects/:projectId/app/:appId', 'app.listApp');
// GET /projects/1/app/2
class AppController extends Controller {
  async listApp() {
    assert.equal(this.ctx.params.projectId, '1');
    assert.equal(this.ctx.params.appId, '2');
  }
}
```

### body

> URL传参的限制
>
> - 浏览器中会对 URL 的长度有所限制，如果需要传递的参数过多就会无法传递。
> - 服务端经常会将访问的完整 URL 记录到日志文件中，有一些敏感数据通过 URL 传递会不安全。

​         **框架内置了 bodyParser 中间件来对这两类格式的请求 body 解析成 object 挂载到 ctx.request.body 上。HTTP 协议中并不建议在通过 GET、HEAD 方法访问时传递 body，所以我们无法在 GET、HEAD 方法中按照此方法获取到内容。**

```javascript
// POST /api/posts HTTP/1.1
// Host: localhost:3000
// Content-Type: application/json; charset=UTF-8
//
// {"title": "controller", "content": "what is controller"}
class PostController extends Controller {
  async listPosts() {
    assert.equal(this.ctx.request.body.title, 'controller');
    assert.equal(this.ctx.request.body.content, 'what is controller');
  }
}
```

框架对 bodyParser 设置了一些默认参数，配置好之后拥有以下特性：

- 当请求的 Content-Type 为<font color=28a745> `application/json`，`application/json-patch+json`，`application/vnd.api+json` </font>和 <font color=28a745>`application/csp-report` </font>时，会按照 json 格式对请求 body 进行解析，并限制 body 最大长度为 `100kb`。
- 当请求的 Content-Type 为 <font color=28a745>`application/x-www-form-urlencoded`</font> 时，会按照 form 格式对请求 body 进行解析，并限制 body 最大长度为 `100kb`。
- 如果解析成功，body 一定会是一个 Object（可能是一个数组）。

一般来说我们最经常调整的配置项就是变更解析时允许的最大长度，可以在 <font color=28a745>`config/config.default.js` </font>中覆盖框架的默认值。

```javascript
module.exports = {
  bodyParser: {
    jsonLimit: '1mb',
    formLimit: '1mb',
  },
};
```

如果用户的请求 body 超过了我们配置的解析最大长度，会抛出一个状态码为 `413` 的异常，如果用户请求的 body 解析失败（错误的 JSON），会抛出一个状态码为 `400` 的异常。

**注意：在调整 bodyParser 支持的 body 长度时，如果我们应用前面还有一层反向代理（Nginx），可能也需要调整它的配置，确保反向代理也支持同样长度的请求 body。**

### 获取上传文件

> 请求 body 除了可以带参数之外，还可以发送文件，一般来说，浏览器上都是通过 <font color=28a745>`Multipart/form-data`</font> 格式发送文件的，框架通过内置 Multipart 插件来支持获取用户上传的文件

#### File模式

```javascript
// config/config.default.js
exports.multipart = {
  mode: 'file', // 配置文件模式
};

/** 处理文件代码 (多文件）**/
// app/controller/upload.js
const Controller = require('egg').Controller;
const fs = require('mz/fs');

module.exports = class extends Controller {
  async upload() {
    const { ctx } = this;
    console.log(ctx.request.body);
    console.log('got %d files', ctx.request.files.length);
    for (const file of ctx.request.files) {
      console.log('field: ' + file.fieldname);
      console.log('filename: ' + file.filename);
      console.log('encoding: ' + file.encoding);
      console.log('mime: ' + file.mime);
      console.log('tmp filepath: ' + file.filepath);
      let result;
      try {
        // 处理文件，比如上传到云端
        result = await ctx.oss.put('egg-multipart-test/' + file.filename, file.filepath);
      } finally {
        // 需要删除临时文件
        await fs.unlink(file.filepath);
      }
      console.log(result);
    }
  }
};
```

#### Stream模式（Node中的Stream模式）

##### ctx.getFileStream()获取单个文件

```javascript
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;

class UploaderController extends Controller {
  async upload() {
    const ctx = this.ctx;
    const stream = await ctx.getFileStream();
    const name = 'egg-multipart-test/' + path.basename(stream.filename);
    // 文件处理，上传到云存储等等
    let result;
    try {
      result = await ctx.oss.put(name, stream);
    } catch (err) {
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      await sendToWormhole(stream);
      throw err;
    }

    ctx.body = {
      url: result.url,
      // 所有表单字段都能通过 `stream.fields` 获取到
      fields: stream.fields,
    };
  }
}

module.exports = UploaderController;
```

要通过 <font color=28a745>`ctx.getFileStream` </font>便捷的获取到用户上传的文件，需要满足两个条件：

- 只支持上传一个文件。
- 上传文件必须在所有其他的 fields 后面，否则在拿到文件流时可能还获取不到 fields。

##### ctx.multipart();获取多个文件

```javascript
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;

class UploaderController extends Controller {
  async upload() {
    const ctx = this.ctx;
    const parts = ctx.multipart();
    let part;
    // parts() 返回 promise 对象
    while ((part = await parts()) != null) {
      if (part.length) {
        // 这是 busboy 的字段
        console.log('field: ' + part[0]);
        console.log('value: ' + part[1]);
        console.log('valueTruncated: ' + part[2]);
        console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return;
        }
        // part 是上传的文件流
        console.log('field: ' + part.fieldname);
        console.log('filename: ' + part.filename);
        console.log('encoding: ' + part.encoding);
        console.log('mime: ' + part.mime);
        // 文件处理，上传到云存储等等
        let result;
        try {
          result = await ctx.oss.put('egg-multipart-test/' + part.filename, part);
        } catch (err) {
          // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
          await sendToWormhole(part);
          throw err;
        }
        console.log(result);
      }
    }
    console.log('and we are done parsing the form!');
  }
}

module.exports = UploaderController;
```

#### 上传文件支持格式

```javascript
/** 默认的白名单 **/
// images
'.jpg', '.jpeg', // image/jpeg
'.png', // image/png, image/x-png
'.gif', // image/gif
'.bmp', // image/bmp
'.wbmp', // image/vnd.wap.wbmp
'.webp',
'.tif',
'.psd',
// text
'.svg',
'.js', '.jsx',
'.json',
'.css', '.less',
'.html', '.htm',
'.xml',
// tar
'.zip',
'.gz', '.tgz', '.gzip',
// video
'.mp3',
'.mp4',
'.avi',
```

```javascript
/** 在config配置 **/
module.exports = {
  multipart: {
    fileExtensions: [ '.apk' ] // 增加对 apk 扩展名的文件支持
    whitelist: [ '.png' ], // 覆盖整个白名单，只允许上传 '.png' 格式
  },
};
```

### header

除了从 URL 和请求 body 上获取参数之外，还有许多参数是通过请求 header 传递的。框架提供了一些辅助属性和方法来获取。

- <font color=28a745>`ctx.headers`，`ctx.header`，`ctx.request.headers`，`ctx.request.header`</font>：这几个方法是等价的，都是获取整个 header 对象。
- <font color=28a745>`ctx.get(name)`，`ctx.request.get(name)`</font>：获取请求 header 中的一个字段的值，如果这个字段不存在，会返回空字符串。
- 我们建议用<font color=28a745> `ctx.get(name)`</font> 而不是<font color=28a745> `ctx.headers['name']`</font>，因为前者会自动处理大小写。

由于 header 比较特殊，有一些是 `HTTP` 协议规定了具体含义的（例如<font color=28a745> `Content-Type`，`Accept`</font>），有些是反向代理设置的，已经约定俗成（X-Forwarded-For），框架也会对他们增加一些便捷的 getter，详细的 getter 可以查看 [API](https://eggjs.org/api/) 文档。

特别是如果我们通过 <font color=28a745>`config.proxy = true`</font> 设置了应用部署在反向代理（Nginx）之后，有一些 Getter 的内部处理会发生改变。

<font color=28a745>`ctx.host`</font>

优先读通过<font color=28a745> `config.hostHeaders`</font> 中配置的 header 的值，读不到时再尝试获取 host 这个 header 的值，如果都获取不到，返回空字符串。

<font color=28a745>`config.hostHeaders` </font>默认配置为<font color=28a745> `x-forwarded-host`。</font>

<font color=28a745>`ctx.protocol`</font>

通过这个 Getter 获取 protocol 时，首先会判断当前连接是否是加密连接，如果是加密连接，返回 https。

如果处于非加密连接时，优先读通过<font color=28a745> `config.protocolHeaders` </font>中配置的 header 的值来判断是 HTTP 还是 https，如果读取不到，我们可以在配置中通过 <font color=28a745>`config.protocol` </font>来设置兜底值，默认为 HTTP。

<font color=28a745>`config.protocolHeaders` </font>默认配置为 <font color=28a745>`x-forwarded-proto`。</font>

<font color=28a745>`ctx.ips`</font>

通过 <font color=28a745>`ctx.ips` </font>获取请求经过所有的中间设备 IP 地址列表，只有在 <font color=28a745>`config.proxy = true`</font> 时，才会通过读取<font color=28a745> `config.ipHeaders` </font>中配置的 header 的值来获取，获取不到时为空数组。

<font color=28a745>`config.ipHeaders` </font>默认配置为<font color=28a745> `x-forwarded-for`。</font>

<font color=28a745>`ctx.ip`</font>


通过 `ctx.ip` 获取请求发起方的 IP 地址，优先从 `ctx.ips` 中获取，`ctx.ips` 为空时使用连接上发起方的 IP 地址。

**注意：ip 和 ips 不同，ip 当 config.proxy = false 时会返回当前连接发起者的 ip 地址，ips 此时会为空数组。**

### Cookie和Session

```javascript
class CookieController extends Controller {
  async add() {
    const ctx = this.ctx;
    const count = ctx.cookies.get('count');
    count = count ? Number(count) : 0;
    ctx.cookies.set('count', ++count);
    ctx.body = count;
  }

  async remove() {
    const ctx = this.ctx;
    const count = ctx.cookies.set('count', null);
    ctx.status = 204;
  }
  async fetchPosts() {
    const ctx = this.ctx;
    // 获取 Session 上的内容
    const userId = ctx.session.userId;
    const posts = await ctx.service.post.fetch(userId);
    // 修改 Session 的值
    ctx.session.visited = ctx.session.visited ? ++ctx.session.visited : 1;
    ctx.body = {
      success: true,
      posts,
    };
  }
  async deleteSession() {
    this.ctx.session = null;
  }
}

// config.defaule.js 配置
module.exports = {
  key: 'EGG_SESS', // 承载 Session 的 Cookie 键值对名字
  maxAge: 86400000, // Session 的最大有效时间
};
```

## 参数校验

```javascript
// config/plugin.js  // 使用校验插件
exports.validate = {
  enable: true,
  package: 'egg-validate',
};

// app/controller/post.js
class PostController extends Controller {
  async create() {
    const ctx = this.ctx;
    try {
      ctx.validate(createRule); // 使用校验传入规则
    } catch (err) { // 校验失败处理
      ctx.logger.warn(err.errors);
      ctx.body = { success: false };
      return;
    }
  }
};


// app.js  // 在app里面定义新的规则、
app.validator.addRule('json', (rule, value) => {
  try {
    JSON.parse(value);
  } catch (err) {
    return 'must be json string';
  }
});

class PostController extends Controller {
  async handler() {
    const ctx = this.ctx;
    // query.test 字段必须是 json 字符串
    const rule = { test: 'json' };
    ctx.validate(rule, ctx.query); // 使用定义的规则
  }
};
```

##  调用 Service

> 我们并不想在 Controller 中实现太多业务逻辑，所以提供了一个 [Service](https://eggjs.org/zh-cn/basics/service.html) 层进行业务逻辑的封装，这不仅能提高代码的复用性，同时可以让我们的业务逻辑更好测试。
>
> 在 Controller 中可以调用任何一个 Service 上的任何方法，同时 Service 是懒加载的，只有当访问到它的时候框架才会去实例化它。

```javascript
// 详细看Service
class PostController extends Controller {
  async create() {
    const ctx = this.ctx;
    const author = ctx.session.userId;
    const req = Object.assign(ctx.request.body, { author });
    // 调用 service 进行业务处理
    const res = await ctx.service.post.create(req);
    ctx.body = { id: res.id };
    ctx.status = 201;
  }
}
```

## 发生HTTP响应 （response）

### 设置status

```javascript
class PostController extends Controller {
  async create() {
    // 设置状态码为 201
    this.ctx.status = 201;
  }
};
```

### 设置 Header

我们通过状态码标识请求成功与否、状态如何，在 body 中设置响应的内容。而通过响应的 Header，还可以设置一些扩展信息。

通过 <font color=28a745>`ctx.set(key, value)` </font>方法可以设置一个响应头，<font color=28a745>`ctx.set(headers)` </font>设置多个 Header。

```javascript
// app/controller/api.js
class ProxyController extends Controller {
  async show() {
    const ctx = this.ctx;
    const start = Date.now();
    ctx.body = await ctx.service.post.get();
    const used = Date.now() - start;
    // 设置一个响应头
    ctx.set('show-response-time', used.toString());
  }
};
```

### 重定向

框架通过 security 插件覆盖了 koa 原生的<font color=28a745> `ctx.redirect` </font>实现，以提供更加安全的重定向。

- <font color=28a745>`ctx.redirect(url)`</font> 如果不在配置的白名单域名内，则禁止跳转。
- <font color=28a745>`ctx.unsafeRedirect(url)` </font>不判断域名，直接跳转，一般不建议使用，明确了解可能带来的风险后使用。

用户如果使用<font color=28a745>`ctx.redirect`</font>方法，需要在应用的配置文件中做如下配置：

```javascript
// config/config.default.js
exports.security = {
  domainWhiteList:['.domain.com'],  // 安全白名单，以 . 开头
};
```

若用户没有配置 <font color=28a745>`domainWhiteList` </font>或者 <font color=28a745>`domainWhiteList`</font>数组内为空，则默认会对所有跳转请求放行，即等同于<font color=28a745>`ctx.unsafeRedirect(url)`</font>

### !*设置Body**

绝大多数的数据都是通过 body 发送给请求方的，和请求中的 body 一样，在响应中发送的 body，也需要有配套的 Content-Type 告知客户端如何对数据进行解析。

- 作为一个 RESTful 的 API 接口 controller，我们通常会返回 Content-Type 为 <font color=28a745>`application/json`</font> 格式的 body，内容是一个 JSON 字符串。
- 作为一个 html 页面的 controller，我们通常会返回 Content-Type 为 `text/html` 格式的 body，内容是 html 代码段。

**注意：ctx.body 是 ctx.response.body 的简写，不要和 ctx.request.body 混淆了。**

```javascript
class ViewController extends Controller {
  async show() {
    this.ctx.body = {
      name: 'egg',
      category: 'framework',
      language: 'Node.js',
    };
  }

  async page() {
    this.ctx.body = '<html><h1>Hello</h1></html>';
  }
}
```

由于 Node.js 的流式特性，我们还有很多场景需要通过 Stream 返回响应，例如返回一个大文件，代理服务器直接返回上游的内容，框架也支持直接将 body 设置成一个 Stream，并会同时处理好这个 Stream 上的错误事件。

```javascript
class ProxyController extends Controller {
  async proxy() {
    const ctx = this.ctx;
    const result = await ctx.curl(url, {
      streaming: true,
    });
    ctx.set(result.header);
    // result.res 是一个 stream
    ctx.body = result.res;
  }
};
```

#### 渲染模板

通常来说，我们不会手写 HTML 页面，而是会通过模板引擎进行生成。 框架自身没有集成任何一个模板引擎，但是约定了 [View 插件的规范](https://eggjs.org/zh-cn/advanced/view-plugin.html)，通过接入的模板引擎，可以直接使用 <font color=28a745>`ctx.render(template)` </font>来渲染模板生成 html。

```javascript
class HomeController extends Controller {
  async index() {
    const ctx = this.ctx;
    await ctx.render('home.tpl', { name: 'egg' });
    // ctx.body = await ctx.renderString('hi, {{ name }}', { name: 'egg' });
  }
};
```

具体示例可以查看[模板渲染](https://eggjs.org/zh-cn/core/view.html)。

#### JSONP

有时我们需要给非本域的页面提供接口服务，又由于一些历史原因无法通过 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) 实现，可以通过 [JSONP](https://en.wikipedia.org/wiki/JSONP) 来进行响应。

由于 JSONP 如果使用不当会导致非常多的安全问题，所以框架中提供了便捷的响应 JSONP 格式数据的方法，封装了 [JSONP XSS 相关的安全防范](https://eggjs.org/zh-cn/core/security.html#jsonp-xss)，并支持进行 CSRF 校验和 referrer 校验。

- 通过 `app.jsonp()` 提供的中间件来让一个 controller 支持响应 JSONP 格式的数据。在路由中，我们给需要支持 jsonp 的路由加上这个中间件：

```javascript
// app/router.js
module.exports = app => {
  const jsonp = app.jsonp();
  app.router.get('/api/posts/:id', jsonp, app.controller.posts.show);
  app.router.get('/api/posts', jsonp, app.controller.posts.list);
};
```

- 在 Controller 中，只需要正常编写即可：

```javascript
// app/controller/posts.js
class PostController extends Controller {
  async show() {
    this.ctx.body = {
      name: 'egg',
      category: 'framework',
      language: 'Node.js',
    };
  }
}
```

用户请求对应的 URL 访问到这个 controller 的时候，如果 query 中有 `_callback=fn` 参数，将会返回 JSONP 格式的数据，否则返回 JSON 格式的数据。

##### JSONP 配置

框架默认通过 query 中的 `_callback` 参数作为识别是否返回 JSONP 格式数据的依据，并且 `_callback` 中设置的方法名长度最多只允许 50 个字符。应用可以在 <font color=28a745>`config/config.default.js` </font>全局覆盖默认的配置：

```javascript
// config/config.default.js
exports.jsonp = {
  callback: 'callback', // 识别 query 中的 `callback` 参数
  limit: 100, // 函数名最长为 100 个字符
};
```

通过上面的方式配置之后，如果用户请求<font color=28a745> `/api/posts/1?callback=fn`</font>，响应为 JSONP 格式，如果用户请求<font color=28a745> `/api/posts/1`</font>，响应格式为 JSON。

我们同样可以在 <font color=28a745>`app.jsonp()` </font>创建中间件时覆盖默认的配置，以达到不同路由使用不同配置的目的：

```javascript
// app/router.js
module.exports = app => {
  const { router, controller, jsonp } = app;
  router.get('/api/posts/:id', jsonp({ callback: 'callback' }), controller.posts.show);
  router.get('/api/posts', jsonp({ callback: 'cb' }), controller.posts.list);
};
```

##### 跨站防御配置

默认配置下，响应 JSONP 时不会进行任何跨站攻击的防范，在某些情况下，这是很危险的。我们初略将 JSONP 接口分为三种类型：

1. 查询非敏感数据，例如获取一个论坛的公开文章列表。
2. 查询敏感数据，例如获取一个用户的交易记录。
3. 提交数据并修改数据库，例如给某一个用户创建一笔订单。

如果我们的 JSONP 接口提供下面两类服务，在不做任何跨站防御的情况下，可能泄露用户敏感数据甚至导致用户被钓鱼。因此框架给 JSONP 默认提供了 CSRF 校验支持和 referrer 校验支持。

###### CSRF

在 JSONP 配置中，我们只需要打开 `csrf: true`，即可对 JSONP 接口开启 CSRF 校验。

```javascript
// config/config.default.js
module.exports = {
  jsonp: {
    csrf: true,
  },
};
```

**注意，CSRF 校验依赖于 security 插件提供的基于 Cookie 的 CSRF 校验。**

在开启 CSRF 校验时，客户端在发起 JSONP 请求时，也要带上 CSRF token，如果发起 JSONP 的请求方所在的页面和我们的服务在同一个主域名之下的话，可以读取到 Cookie 中的 CSRF token（在 CSRF token 缺失时也可以自行设置 CSRF token 到 Cookie 中），并在请求时带上该 token。

##### referrer 校验

如果在同一个主域之下，可以通过开启 CSRF 的方式来校验 JSONP 请求的来源，而如果想对其他域名的网页提供 JSONP 服务，我们可以通过配置 referrer 白名单的方式来限制 JSONP 的请求方在可控范围之内。

```javascript
//config/config.default.js
exports.jsonp = {
  whiteList: /^https?:\/\/test.com\//,
  // whiteList: '.test.com',
  // whiteList: 'sub.test.com',
  // whiteList: [ 'sub.test.com', 'sub2.test.com' ],
};
```

`whiteList` 可以配置为正则表达式、字符串或者数组：

- 正则表达式：此时只有请求的 Referrer 匹配该正则时才允许访问 JSONP 接口。在设置正则表达式的时候，注意开头的 `^` 以及结尾的 `\/`，保证匹配到完整的域名。

```javascript
exports.jsonp = {
  whiteList: /^https?:\/\/test.com\//,
};
// matches referrer:
// https://test.com/hello
// http://test.com/
```

- 字符串：设置字符串形式的白名单时分为两种，当字符串以 `.` 开头，例如 `.test.com` 时，代表 referrer 白名单为 `test.com` 的所有子域名，包括 `test.com` 自身。当字符串不以 `.` 开头，例如 `sub.test.com`，代表 referrer 白名单为 `sub.test.com` 这一个域名。（同时支持 HTTP 和 HTTPS）。

```javascript
exports.jsonp = {
  whiteList: '.test.com',
};
// matches domain test.com:
// https://test.com/hello
// http://test.com/

// matches subdomain
// https://sub.test.com/hello
// http://sub.sub.test.com/

exports.jsonp = {
  whiteList: 'sub.test.com',
};
// only matches domain sub.test.com:
// https://sub.test.com/hello
// http://sub.test.com/
```

- 数组：当设置的白名单为数组时，代表只要满足数组中任意一个元素的条件即可通过 referrer 校验。

```javascript
exports.jsonp = {
  whiteList: [ 'sub.test.com', 'sub2.test.com' ],
};
// matches domain sub.test.com and sub2.test.com:
// https://sub.test.com/hello
// http://sub2.test.com/
```

**当 CSRF 和 referrer 校验同时开启时，请求发起方只需要满足任意一个条件即可通过 JSONP 的安全校验。**

### 