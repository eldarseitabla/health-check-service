// const postgres = require('./postgres')
// const redis = require('./redis')
// const smtp = require('./smtp')
const awsS3 = require('./awsS3')
// const mongo = require('./mongo')
// const rabbit = require('./rabbit')

/**
 * @module checksProviders
 * @type {{mongo: *, smtp: *, awsS3: *, rabbit: *, postgres: *, redis: *}}
 */
module.exports = {
  // postgres, redis, smtp,
  awsS3,
  // mongo, rabbit,
}
