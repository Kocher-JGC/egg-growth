'use strict';

const Controller = require('egg').Controller;

class IndexController extends Controller {
  async home() {
    // const result = { a: 1 };
    const result = await this.app.mysql.insert('title', {
      title: this.ctx.params.title || this.ctx.query.title || 'xxx',
    });
    // const result = await this.app.mysql.get('title', { id: 11 });
    // const result = await this.app.mysql.update('title', {
    //   title: 'I have Name',
    // }, {
    //   where: {
    //     id: 1,
    //   },
    // });
    // const result = await this.app.mysql.delete('title', {
    //   id: 11,
    // });
    console.log(result); // 如果不存在则为null
    // 判断插入成功
    const insertSuccess = result && result.affectedRows === 1;
    console.log(insertSuccess);
    this.ctx.body = { result };
  }
}

module.exports = IndexController;
