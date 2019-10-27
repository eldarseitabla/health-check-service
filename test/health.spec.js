const assert = require('assert')
const express = require('express')
const request = require('supertest')
const {
  expect,
} = require('chai')

const {
  minioClient,
  minioOptions,
  createBucket,
  s3Options,
  runServer,
} = require('./helper')

const {
  checkHealth,
  whitelist,
} = require('../src')

const {
  checks: {
    postgres: checkPostgres,
    redis: checkRedis,
    aws: checkAWSS3Server,
  },
} = require('../src')

describe('GET /health', () => {
  describe('start server with correct configuration', () => {
    it('should respond with 200 http status', async() => {
      const config = {
        postgresUrl: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
        s3: s3Options,
      }
      const app = await runServer(checkHealth(['127.0.0.1'], {
        pg: checkPostgres(config.postgresUrl),
        minio: checkAWSS3Server(config.s3),
      }))
      await createBucket()
      await request(app)
        .get('/health')
        .then(({ body }) => {
          assert.strictEqual(body.status, 'success')
          assert.strictEqual(Object.prototype.isPrototypeOf.call(body, 'services'), true)
          assert.strictEqual((body.services instanceof Object), true)

          const { services } = body
          assert.strictEqual(Object.prototype.isPrototypeOf.call(services, 'pg'), true)
          assert.strictEqual(Object.prototype.isPrototypeOf.call(services.pg, 'status'), true)
          assert.strictEqual(services.pg.status, 'success')

          assert.strictEqual(Object.prototype.isPrototypeOf.call(services.pg, 'minio'), true)
          assert.strictEqual(Object.prototype.isPrototypeOf.call(services.minio, 'status'), true)
          assert.strictEqual(services.minio.status, 'success')
        })
    })
  })

  describe('start server with the wrong postgres connection credentials', () => {
    it('should respond with 503 http status', async() => {
      const config = {
        postgresUrl: 'postgres://postgres@pg:5432/fakedb',
        s3: s3Options,
      }
      const app = await runServer(checkHealth(['127.0.0.1'], {
        pg: checkPostgres(config.postgresUrl),
        minio: checkAWSS3Server(config.s3),
      }))
      await createBucket()
      await request(app)
        .get('/health')
        .then(({ body }) => {
          assert.strictEqual(Object.prototype.isPrototypeOf.call(body, 'status'), true)
          assert.strictEqual(body.status, 'failure')
          assert.strictEqual(Object.prototype.isPrototypeOf.call(body, 'services'), true)
          assert.strictEqual((body.services instanceof Object), true)

          const { services } = body
          assert.strictEqual(Object.prototype.isPrototypeOf.call(services, 'pg'), true)
          assert.strictEqual(Object.prototype.isPrototypeOf.call(services.pg, 'message'), true)

          assert.strictEqual(Object.prototype.isPrototypeOf.call(services.pg, 'status'), true)
          assert.strictEqual(services.pg.status, 'failure')

          assert.strictEqual(Object.prototype.isPrototypeOf.call(services, 'minio'), true)
          assert.strictEqual(Object.prototype.isPrototypeOf.call(services.minio, 'status'), true)
          assert.strictEqual(services.minio.status, 'success')
        })
    })
  })
})
