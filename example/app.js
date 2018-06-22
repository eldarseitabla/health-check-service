/* eslint-disable global-require */
require('dotenv').config({
    path: require('path').join(__dirname, '.env'),
})
const { checkHealth } = require('../src')
const healthConfig = require('./health.config')
const express = require('express')

const app = express()

app.get('/health', checkHealth(healthConfig.ips, healthConfig.checks))

app.listen(healthConfig.port || 3001, () => {
    console.log(`Example app 127.0.0.1 listening on port ${healthConfig.port}!`)
})
