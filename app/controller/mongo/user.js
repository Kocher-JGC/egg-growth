'use strict';

exports.index = function* (ctx) {
  console.log(ctx.model.Mongod.User.find({}));
  ctx.body = yield ctx.model.Mongod.User.find({});
};
