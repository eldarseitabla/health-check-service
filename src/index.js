const util = require('util')
const uuid = require('uuid').v4
const whitelist = require('whitelist-ips')
const auth = require('basic-auth')
const checksProviders = require('./checks')

const { STATUS, whitelistIps } = require('./config')

const username = process.env.HEALTH_CHECK_USERNAME
const password = process.env.HEALTH_CHECK_PASSWORD

const checkIp = ips => (req, res) => {
    whitelist(ips)(req, res, (err) => {
        if (err && !req.user) {
            return res.status(req.health.httpCode()).json({
                status: req.health.status,
            })
        }
        return res.status(req.health.httpCode()).json(req.health)
    })
}

const executeHealthCheack = checks => ((req, res, next) => {
    res.removeHeader('X-Powered-By')
    res.removeHeader('set-cookie')
    res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: 0,
        'Surrogate-Control': 'no-store',
        'X-Request-ID': req.reqId || req.reqID || uuid(),
    })

    const promises = () => Object.keys(checks).map(name => checks[name]().then(resolve => ({ [name]: resolve })))

    return Promise.all(promises())
        .then((results) => {
            const services = results.reduce((prevValue, currValue) => {
                if (util.isNullOrUndefined(currValue)) {
                    return prevValue
                }
                return Object.assign(prevValue, currValue)
            }, {})

            const failures = Object.keys(services).reduce((fails, name) => {
                if (services[name].status === 'failure') {
                    fails += 1 // eslint-disable-line
                }
                return fails
            }, 0)

            req.health = {
                status: failures === 0 ? 'success' : 'failure',
                httpCode: () => (failures === 0 ? 200 : 503),
                services,
            }
            next()
        })
        .catch((err) => {
            console.log(err)
            req.health = {
                status: 'failure',
                httpCode: () => 503,
            }
            next()
        })
})

const basicAuth = () => (req, res, next) => {
    const user = auth(req) || {}
    if (user.name && user.pass && username && password) {
        if (user.name === username && user.pass === password) {
            req.user = user
            return next()
        }
        res.set('WWW-Authenticate', 'Basic realm="health-check"')
        return res.status(401).json('Access denied')
    }
    return next()
}

const checkHealth = (ipAdreses, checksProvids) => {
    const ips = ipAdreses || whitelistIps.local
    const checks = (checksProvids || {})
    return [basicAuth(), executeHealthCheack(checks), checkIp(ips)]
}

module.exports = {
    checks: checksProviders, checkHealth, whitelistIps, STATUS,
}
