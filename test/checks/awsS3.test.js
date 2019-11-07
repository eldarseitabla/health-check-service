const assert = require('assert')
const S3 = require('aws-sdk/clients/s3')
const sinon = require('sinon')
const { awsS3 } = require('../../checksProviders')

const AwsS3 = awsS3.AwsS3

const sandbox = sinon.createSandbox()

describe('awsS3 test', () => {
  const config = {
    region: 'some_region',
    bucketName: 'some_bucket',
    accessKeyId: 'some_key',
    secretAccessKey: 'some_secret',
  }

  afterEach('restore sandbox', () => {
    sandbox.restore()
  })

  it('should be successfully', async() => {
    const bufferData = 'some_buffer_data'
    const data = 'some_data'
    const keyName = 'some_key_name'

    const s3 = new S3({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      }
    })

    const s3Mock = sandbox.mock(s3)
    s3Mock.expects('putObject')
      .once()
      .withExactArgs({
        Bucket: config.bucketName,
        Key: keyName,
        Body: bufferData
      })
      .returns({ promise: () => data })

    const awsS3some = new AwsS3(s3, { bucketName: config.bucketName })

    awsS3some._keyName = keyName // eslint-disable-line

    s3Mock.expects('deleteObject')
      .once()
      .withExactArgs({
        Bucket: config.bucketName,
        Key: keyName, // eslint-disable-line
      }).returns({ promise: () => {} })

    const awsS3someMock = sandbox.mock(awsS3some)

    awsS3someMock.expects('_writeFile')
      .once()

    awsS3someMock.expects('_getBufferData')
      .once().returns(bufferData)

    awsS3someMock.expects('_unlinkFile')
      .once()

    const result = await awsS3some.execute()

    assert.deepStrictEqual(result, { status: 'success' })
  })
})
