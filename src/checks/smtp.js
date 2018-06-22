const util = require('util')
const url = require('url')
const SMTPConnection = require('nodemailer/lib/smtp-connection')

const { STATUS } = require('../config')

const checkSMTPServer = config => async () => {
    try {
        return await new Promise((resolve) => {
            const smtpConfig = config
            let creds = {}
            if (util.isString(smtpConfig)) {
                const connString = url.parse(smtpConfig)
                connString.query = {}
                connString.query.connectionTimeout = 3000
                const auth = (util.isString(connString.auth)) ? connString.auth.split(':') : ['', '']
                const user = (util.isString(auth[0])) ? auth[0] : ''
                const pass = (util.isString(auth[1])) ? auth[1] : ''

                creds = Object.assign({
                    port: connString.port,
                    host: connString.hostname,
                    connectionTimeout: connString.query.connectionTimeout,
                    user,
                    pass,
                }, connString.query)
            } else {
                smtpConfig.connectionTimeout = smtpConfig.connectionTimeout || 5000
                creds = Object.assign({}, smtpConfig)
            }

            const connection = new SMTPConnection(creds)

            connection.on('error', err => resolve({
                status: STATUS.DOWN,
                message: err.message,
            }))

            connection.connect((err) => {
                if (err) {
                    return resolve({
                        status: STATUS.DOWN,
                        message: err.message,
                    })
                }
                return resolve({ status: STATUS.UP })
            })
        })
    } catch (e) {
        return {
            status: STATUS.DOWN,
            message: e.message,
        }
    }
}

module.exports = checkSMTPServer
