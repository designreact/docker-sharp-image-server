/* eslint global-require: "off" */
let serverConfig
if (process.env.NODE_ENV !== 'production') {
  serverConfig = require('./server.config.dev').config
} else {
  serverConfig = require('./server.config.prod').config
}

export default serverConfig
