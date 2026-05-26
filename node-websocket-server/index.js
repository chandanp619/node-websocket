const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const cron = require('node-cron');
const { MongoClient } = require('mongodb');
const { loremIpsum } = require('lorem-ipsum');
const slugify = require('slugify');


dotenv.config();

const app = express();

app.use(cors());

const server = http.createServer(app);
const mongoClient = new MongoClient(process.env.MONGO_URI);
const wss = new WebSocket.Server({server});

let clients = [];

wss.on('connection', (ws) =>{
    clients.push(ws);
});

wss.on('close', (ws) =>{
    clients = clients.filter(client=> client != ws);
});


// MONGODB CHANGE STREAM
async function watchMongodbChanges() {
    try {
        
        await mongoClient.connect();
        console.log("Connected to MongoDB");

        const db = mongoClient.db('myPrismaDb');
        //const collection = db.collection('blogs');
        const changeStream = db.watch();

        changeStream.on('change', async (change) => {
            console.log(change);
            clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(change));
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
}
watchMongodbChanges();

// CRONJOB INTERACTION
cron.schedule('*/5 * * * * *', async function(){
        const data = {
                type: 'product_data',
                time: new Date().getTime(),
                price: (Math.random() * 10).toFixed(0) + Math.random().toFixed(2)   
        };
        console.log(data);
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });

        try{
            // insert into mongodb
           
            await mongoClient.connect();
            const db = mongoClient.db('myPrismaDb');
            const collection = db.collection('blogs');
            const title = loremIpsum({ count: 10, units: 'words' });
            const slug = slugify(title, { lower: true });
            const blogData = {
                title: title,
                content: loremIpsum({ count: 10, units: 'paragraphs' }),
                author: 'Test Author',
                slug: slug,
                dateCreated: new Date()
            };
            console.log(blogData);
            await collection.insertOne(blogData);
            await mongoClient.close();
        }catch(error){
            console.error(error);
        }
        
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

const PORT = 4000;

server.listen(PORT, function(){
    console.log(`Server is Running on http://localhost:${PORT}`);
})