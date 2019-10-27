const { Client } = require('pg')
const util = require('util')

const { STATUS } = require('../config')

const checkPostgres = (pgUrl) => {
  if (util.isNullOrUndefined(pgUrl)) {
    throw new Error('pgUrl is missing')
  }
  return async() => {
    try {
      const client = new Client({
        connectionString: pgUrl,
      })
      await client.connect()
      await client.query('SELECT NOW()')
      await client.end()
    } catch (e) {
      return {
        status: STATUS.DOWN,
        message: e.message,
      }
    }
    return { status: STATUS.UP }
  }
}

module.exports = checkPostgres
