const amqp = require('amqplib')
const { STATUS } = require('../config')


const rabbit = (rabbitOptions) => {
    return async () => {
        try {
            const amqpConnection = await amqp.connect(rabbitOptions.url)
            const amqpChannel = await amqpConnection.createChannel()
            await amqpChannel.assertExchange(rabbitOptions.exchange, 'topic', { durable: true })
            return { status: STATUS.UP }
        } catch (e) {
            return { status: STATUS.DOWN, message: e.message }
        }
    }
}

module.exports = rabbit
