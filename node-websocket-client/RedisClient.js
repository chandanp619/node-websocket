const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();
const redisClient = redis.createClient({
        // socket: {
        //     host: process.env.REDIS_HOST,
        //     port: process.env.REDIS_PORT
        // },
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`  
    });

try{

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });
    redisClient.on('error', (err) => {
        console.error('Redis error:', err);
    });

    redisClient.connect();
}catch(err){
    console.log("Redis Connection Error:",err);
}

module.exports = redisClient;