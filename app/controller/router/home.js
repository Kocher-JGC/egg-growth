'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }
  async search() {
    const { ctx } = this;
    const type = ctx.query.type;
    const q = ctx.query.q || 'nodejs';

    if (type === 'bing') {
      ctx.redirect(`http://cn.bing.com/search?q=${q}`);
    } else {
      ctx.redirect(`https://www.google.co.kr/search?q=${q}`);
    }
  }
}

module.exports = HomeController;
