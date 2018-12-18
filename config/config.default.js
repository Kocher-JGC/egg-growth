'use strict';

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1545112590963_9152';

  // add your config here
  config.middleware = [];

  config.security = {
    csrf: false, // csrf的防范
  };

  return config;
};
