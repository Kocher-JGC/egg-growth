'use strict';

module.exports = () => {
  return async (ctx, next) => {
    const startTime = Date.now();
    await next();
    // 上报请求时间
    console.log('timeEng', Date.now() - startTime);
    // reportTime(Date.now() - startTime);
  };
};
