const STATUS = {
    UP: 'success',
    DOWN: 'failure',
}

const whitelistIps = {
    local: ['127.0.0.1', '::1'],
}

module.exports = {
    STATUS,
    whitelistIps,
}
