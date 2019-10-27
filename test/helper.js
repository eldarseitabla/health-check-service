process.env.NODE_ENV = 'test'

process.env.MINIO_HOST = process.env.MINIO_HOST || '0.0.0.0'
process.env.MINIO_PORT = process.env.MINIO_PORT || 9000

process.env.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'vtng.app'
process.env.AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT || 'http://127.0.0.1:9001'
process.env.AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID || 'admin'
process.env.AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY || 'password'

const util = require('util')

const express = require('express')
const Minio = require('minio')
const Docker = require('dockerode')

const docker = new Docker({
  socketPath: '/var/run/docker.sock',
  Promise,
})

const s3Options = Object.freeze({
  endpoint: process.env.AWS_S3_ENDPOINT,
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  s3BucketEndpoint: true,
  signatureVersion: 'v4',
  bucketName: process.env.AWS_S3_BUCKET,
  region: 'eu-central-1',
})

const minioOptions = {
  endPoint: process.env.MINIO_HOST,
  port: +process.env.MINIO_PORT,
  secure: false,
  accessKey: s3Options.accessKeyId,
  secretKey: s3Options.secretAccessKey,
}

const minioClient = new Minio.Client(minioOptions)
minioClient.makeBucket = util.promisify(minioClient.makeBucket)
minioClient._bucketExists = minioClient.bucketExists
minioClient.bucketExists = async(bucketName) => {
  try {
    await minioClient._bucketExists(bucketName)
  } catch (err) {
    if (err && err.code === 'NoSuchBucket') {
      return false
    } else if (err) {
      return err
    }
  }
  return true
}

const createBucket = async() => {
  let exists
  try {
    exists = await minioClient.bucketExists(s3Options.bucketName)
    if (!exists) {
      return minioClient.makeBucket(s3Options.bucketName, s3Options.region)
    }
  } catch (e) {
    throw new Error(e.message)
  }
  return exists
}

const runServer = async(checkHealthMW) => {
  const app = express()
  app.get('/health', checkHealthMW)
  return app
}

module.exports = {
  runServer,
  minioClient,
  minioOptions,
  createBucket,
  s3Options,
  docker,
}
