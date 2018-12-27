'use strict';

// exports.index = function* (ctx) {
//   console.log(ctx.model.Mongod.User.find({}));
//   ctx.body = yield ctx.model.Mongod.User.find({});
// };

const Controller = require('egg').Controller;

class UserController extends Controller {
  async index() {
    this.ctx.body = await this.ctx.model.Mongod.User.find({});
  }
}

module.exports = UserController;
