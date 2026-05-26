const express = require('express');
const path = require('path');
const redisClient = require('../RedisClient');

const router = express.Router();



router.get('/', async (req, res) => {
    try{
        console.log('chart route');
        let data = await redisClient.zRange('product_data', 0, -1);
        let d = [];
        for(var i=0;i<data.length;i++){
            let raw = JSON.parse(data[i]);
            d.push(raw);
        }
        res.json({ chartData:JSON.stringify(d)});
        //res.render('chart', { chartData:JSON.stringify(d)});

    }catch(err){
        console.log(err);
    }
    
});

module.exports = router;