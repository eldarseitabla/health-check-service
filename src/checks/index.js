const postgres = require('./postgres')
const redis = require('./redis')
const smtp = require('./smtp')
const aws = require('./aws')
const mongo = require('./mongo')
const rabbit = require('./rabbit')

module.exports = {
    postgres, redis, smtp, aws, mongo, rabbit,
}
