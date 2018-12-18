'use strict';

const Controller = require('egg').Controller;

class PackageController extends Controller {
  async detail() {
    this.ctx.body = `package:${this.ctx.params[0]}`;
  }
  async search() {
    this.ctx.body = `search: ${this.ctx.query.name}`;
  }
}

module.exports = PackageController;
