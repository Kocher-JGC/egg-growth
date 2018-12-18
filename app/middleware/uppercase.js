'use strict';

module.exports = () => {
  return async function uppercase(ctx, next) {
    // console.log(ctx.query);
    ctx.query.name = ctx.query.name && ctx.query.name.toUpperCase();
    await next();
  };
};
