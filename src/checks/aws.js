const S3FS = require('s3fs')
const uuid = require('uuid').v4

const { STATUS } = require('../config')

const checkAWS = s3Options => async () => {
    try {
        const fs = new S3FS(s3Options.bucketName, s3Options)
        const filename = `${uuid()}.txt`
        await fs.writeFile(filename, 'hello, world!')
        await fs.unlink(filename)
    } catch (err) {
        return {
            status: STATUS.DOWN,
            message: err.message,
        }
    }
    return { status: STATUS.UP }
}

module.exports = checkAWS
