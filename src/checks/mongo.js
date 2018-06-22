const { MongoClient } = require('mongodb')
const util = require('util')
const { STATUS } = require('../config')

const mongo = (mongoUrl) => {
    if (util.isNullOrUndefined(mongoUrl)) {
        throw new Error('pgUrl is missing')
    }
    return async () => {
        try {
            const db = await MongoClient.connect(mongoUrl)
            await db.close(true)
        } catch (err) {
            return {
                status: STATUS.DOWN,
                message: err.message,
            }
        }
        return { status: STATUS.UP }
    }
}

module.exports = mongo
