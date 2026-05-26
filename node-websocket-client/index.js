const express = require('express');
const cors = require('cors');
const path = require('path');
const ejs = require('ejs');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const redisClient = require('./RedisClient');

const PORT = 5000;
const app = express();
dotenv.config();
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
// set views directory
app.set('views', path.join(__dirname, 'views'));

// set view engine
app.set('view engine', 'ejs');

app.use(express.json());    


const ChartRoute = require('./routes/chart');
app.use('/chart', ChartRoute);

const BlogRoute = require('./routes/blog');
app.use('/blog', BlogRoute);


const wsc = new WebSocket(process.env.WEBSOCKET_URL);
wsc.on('open', () => {
    console.log('Connected to WebSocket server');
})

wsc.on('message', async (message) => {
    let data = JSON.parse(message.toString());
    console.log(data);
    if(data.type === 'product_data'){

        await redisClient.zAdd('product_data', {
            score: parseInt(data.time),
            value: JSON.stringify(data)
        });
    } 
    // if(data.type==='order_book') {}
});


app.use('/', async function(req,res){
        let data = await fetch('http://localhost:5000/chart')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            res.render('index', { chartData: data.chartData });
        });
});



app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});