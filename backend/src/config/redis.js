const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port:  Number(process.env.REDIS_PORT || 16506)
    }
});

module.exports = redisClient;