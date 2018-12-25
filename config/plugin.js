'use strict';

// had enabled by egg
// exports.static = true;
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
// 开启mysql
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

exports.io = {
  enable: true,
  package: 'egg-socket.io',
};
