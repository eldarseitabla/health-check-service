const util = require('util')
const redis = require('redis')
const { STATUS } = require('../config')

const { promisify } = require('util')

const checkRedis = async(redisUrl) => {
  if (util.isNullOrUndefined(redisUrl)) {
    throw new Error('redisUrl is missing')
  }
  try {
    const client = redis.createClient(redisUrl, {
      retry_strategy: (options) => {
        if (options.error) {
          return {
            status: STATUS.DOWN,
            message: options.error.message,
          }
        }
        return options
      },
    })
    const setAsync = promisify(client.set).bind(client)
    const getAsync = promisify(client.get).bind(client)
    await setAsync('foo', 'test1234')
    await getAsync('foo')
    client.quit()
    return { status: STATUS.UP }
  } catch (err) {
    return {
      status: STATUS.DOWN,
      message: err.message,
    }
  }
}

module.exports = checkRedis
