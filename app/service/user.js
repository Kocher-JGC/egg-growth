'use strict';

// app/service/user.js
const Service = require('egg').Service;

class UserService extends Service {
  async find(uid) {
    // const user = await this.ctx.db.query('select * from user where uid = ?', uid);
    return uid;
  }
}

module.exports = UserService;
