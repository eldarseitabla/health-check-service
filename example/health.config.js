const {
  checks: {
    postgres: checkPostgres,
    aws: checkAWSServer,
    redis: checkRedis,
    smtp: checkSMTP,
    mongo: checkMongo,
    rabbit: checkRabbit,
  },
} = require('../src')

const config = {
  postgresUrl: process.env.POSTGRES_URL,
  s3: {
    endpoint: process.env.AWS_S3_ENDPOINT,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    s3BucketEndpoint: true,
    signatureVersion: 'v4',
    bucketName: process.env.AWS_S3_BUCKET,
  },
  redisUrl: process.env.REDIS_URL,
  smtpUrl: process.env.SMTP_URL,
  mongoUrl: process.env.MONGODB_URI,
  rabbit: {
    url: process.env.AMQP_URL,
    exchange: process.env.AMQP_EXCHANGE_NAME,
  },
}

module.exports = {
  /**
     for the following ips list server responds with full info about health checks
     which contain info about service and message with shout info about error
     otherwise server respond with short info about service status (UP or DOWN) generally
     */
  ips: ['127.0.0.1'],
  checks: {
    pg123: checkPostgres(config.postgresUrl),
    aws1234: checkAWSServer(config.s3),
    redis12345: checkRedis(config.redisUrl),
    smtp123: checkSMTP(config.smtpUrl),
    mongo1234: checkMongo(config.mongoUrl),
    rabbit5323: checkRabbit(config.rabbit),
  },
  port: process.env.PORT,
}
