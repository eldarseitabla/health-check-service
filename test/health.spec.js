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
        it('should respond with 200 http status', async () => {
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
                    expect(body).to.have.property('status').and.equals('success')
                    expect(body).to.have.property('services').and.to.be.an('object')

                    const { services } = body
                    expect(services).to.have.property('pg')
                    expect(services.pg).to.have.property('status').and.eql('success')

                    expect(services).to.have.property('minio')
                    expect(services.minio).to.have.property('status').and.eql('success')
                })
        })
    })

    describe('start server with the wrong postgres connection credentials', () => {
        it('should respond with 503 http status', async () => {
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
                    expect(body).to.have.property('status').and.equals('failure')
                    expect(body).to.have.property('services').and.to.be.an('object')

                    const { services } = body
                    expect(services).to.have.property('pg')
                    expect(services.pg).to.have.property('message')
                    expect(services.pg).to.have.property('status').and.eql('failure')

                    expect(services).to.have.property('minio')
                    expect(services.minio).to.have.property('status').and.eql('success')
                })
        })
    })
})
