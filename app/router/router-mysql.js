'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/mysql/', controller.mysql.index.home);
  router.get('/mysql/index/:title', controller.mysql.index.home);

};
