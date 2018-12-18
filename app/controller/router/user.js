'use strict';

const Controller = require('egg').Controller;
const createRule = {
  username: {
    type: 'email',
  },
  password: {
    type: 'password',
    compare: 're-password',
  },
};

class UserController extends Controller {
  async info() {
    const { ctx } = this; // 拿到context
    console.log(typeof ctx.params.name === 'string'); // null === string
    ctx.body = { // 获取/url/请求参数 ，然后输出到body
      name: `hello ${ctx.params.id} you name is ${ctx.params.name}`,
    };
  }
  async index() {
    const { ctx } = this;
    ctx.body = `search: ${ctx.query.name}`; // 获取get请求参数 ?name=name
  }
  async form() {
    const { ctx } = this;
    console.log(ctx);
    // 可以获取类型为 application/json || x-www-form-urlencoded
    // 框架内部对内容的截取和获取有不同注意哈  // 以及注意csrf攻击
    ctx.body = `body: ${JSON.stringify(ctx.request.body)}`; // 获取表单内容
  }
  async formPost() {
    const { ctx } = this;
    // console.log(ctx.validate);
    ctx.validate(createRule);
    // 需要安装egg-validate 上面是验证规则
    ctx.body = ctx.request.body;
  }
}

module.exports = UserController;
