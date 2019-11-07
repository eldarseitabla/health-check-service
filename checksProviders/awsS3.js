const fs = require('fs')
const { promisify } = require('util')
const uuid = require('uuid').v4

const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)
const unlinkAsync = promisify(fs.unlink)
const { STATUS } = require('../config')

/*
const awsS3 = (s3, options) => async() => {
  const keyName = `tmp/health_check${uuid()}.txt`
  // Create local file
  await writeFileAsync(`/${keyName}`, 'Health check!')
  // Read local file
  const bufferData = await readFileAsync(`/${keyName}`)
  const params = {
    Bucket: options.bucketName,
    Key: keyName,
    Body: bufferData
  }
  try {
    const data = await s3.putObject(params).promise()
    // Delete object from S3
    await s3.deleteObject({
      Bucket: options.bucketName,
      Key: keyName,
    }).promise()
    console.log(`Successfully uploaded data to ${options.bucketName}/${keyName}`, data)
  } catch (err) {
    return {
      status: STATUS.DOWN,
      message: err.message,
    }
  }

  await unlinkAsync(`/${keyName}`)
  return { status: STATUS.UP }
}
*/

/**
 * Check AWS S3
 *
 * @param {Object} s3 instance of AWS S3
 * @param {Object} options Options for connect AWS S3
 * @returns {Function} Check AWS S3
 */
class AwsS3 {
  constructor(s3 = null, options = {}) {
    this._s3 = s3
    this._options = options
    this._keyName = `tmp/health_check${uuid()}.txt`
  }

  init(s3, options) {
    this._s3 = s3
    this._options = options
  }

  async execute() {
    await this._writeFile()

    const bufferData = await this._getBufferData()

    const params = {
      Bucket: this._options.bucketName,
      Key: this._keyName,
      Body: bufferData
    }

    try {
      const data = await this._s3.putObject(params).promise()

      await this._s3.deleteObject({
        Bucket: this._options.bucketName,
        Key: this._keyName,
      }).promise()
      console.log(`Successfully uploaded data to ${this._options.bucketName}/${this._keyName}`, data)
    } catch (err) {
      return {
        status: STATUS.DOWN,
        message: err.message,
      }
    }

    await this._unlinkFile()

    return { status: STATUS.UP }
  }

  async _writeFile() {
    await writeFileAsync(`/${this._keyName}`, 'Health check!')
  }

  async _getBufferData() {
    const bufferData = await readFileAsync(`/${this._keyName}`)
    return bufferData
  }

  async _unlinkFile() {
    await unlinkAsync(`/${this._keyName}`)
  }
}

AwsS3.prototype.AwsS3 = AwsS3

exports = module.exports = new AwsS3()
