const S3 = require('aws-sdk/clients/s3')
require('dotenv').config({
  path: require('path').join(__dirname, '.env'),
})
const { HealthConfig, checkHealthService, checksProviders } = require('../index')
// const healthConfig = require('./health.config')

const express = require('express')

const app = express()

// postgresUrl: process.env.POSTGRES_URL,
const s3 = new S3({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  }
})

checksProviders.awsS3.init(s3, { bucketName: process.env.AWS_S3_BUCKET })

// redisUrl: process.env.REDIS_URL,
// smtpUrl: process.env.SMTP_URL,
// mongoUrl: process.env.MONGODB_URI,
// rabbit: {
//   url: process.env.AMQP_URL,
//   exchange: process.env.AMQP_EXCHANGE_NAME,
// },

const healthConfig = new HealthConfig(
  /**
   for the following ips list server responds with full info about health checks
   which contain info about service and message with shout info about error
   otherwise server respond with short info about service status (UP or DOWN) generally
   */
  ['127.0.0.1'],
  {
    // pg123: checkPostgres(config.postgresUrl),
    awsS3some1: checksProviders.awsS3,
    // redis12345: checkRedis(config.redisUrl),
    // smtp123: checkSMTP(config.smtpUrl),
    // mongo1234: checkMongo(config.mongoUrl),
    // rabbit5323: checkRabbit(config.rabbit),
  },
  process.env.PORT
)

app.get('/health', checkHealthService(healthConfig.ips, healthConfig.checks))

app.listen(healthConfig.port || 3001, () => {
  console.log(`Example app listening on port ${healthConfig.port}!`)
})
