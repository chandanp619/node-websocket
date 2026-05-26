const { MongoClient } = require('mongodb');
const WebSocket = require('ws');
async function watchMongodbChanges() {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db('myPrismaDb');
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

module.exports = {
    watchMongodbChanges
}
