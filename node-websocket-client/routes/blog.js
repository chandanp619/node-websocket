const express = require('express');
const {MongoClient} = require('mongodb');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db('myPrismaDb');
        const collection = db.collection('blogs');
        const blogs = await collection.find().toArray();
        res.json(blogs);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
    finally {
        await client.close();
    }
});

module.exports = router;