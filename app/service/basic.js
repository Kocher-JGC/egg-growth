'use strict';

const Service = require('egg').Service;

class BasicService extends Service {
  async echo() {
    return 1;
  }
}

module.exports = BasicService;
