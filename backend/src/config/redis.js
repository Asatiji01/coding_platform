
const {createClient}= require('redis');


const redisclient = createClient({
    username: 'default',
    password:process.env.REDIS_PASS,
    socket: {
        host: 'redis-19857.c8.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 19857
    }
});
module.exports = redisclient;