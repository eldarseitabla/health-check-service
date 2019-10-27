process.env.HEALTH_PORT = process.env.HEALTH_PORT || (+(process.env.PORT || 3000) + 1)
process.env.HEALTH_PORT = +process.env.HEALTH_PORT
process.env.HEALTH_CONFIG = process.env.HEALTH_CONFIG || './health.config.js'

const path = require('path')
const debug = require('debug')('express-health')
const express = require('express')

const {
  checkHealth,
} = require('../src')

const app = express()

const configFile = path.resolve(process.cwd(), process.env.HEALTH_CONFIG)
debug('trying to load config...', { configFile })

const { ips, checks } = require(configFile) // eslint-disable-line

app.get('/', checkHealth(ips || ['127.0.0.1'], checks))

if (module.parent.id === 'internal/preload') {
  const port = process.env.HEALTH_PORT
  debug('health app was loaded as a preloaded module, starting server...')
  app.listen(port, () => {
    debug(`health app has started at ${port}, to retrieve health info use:\n$ http -v :${port}/health\n`)
  })
}

module.exports = app
