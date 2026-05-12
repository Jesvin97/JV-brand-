const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI; 

let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables!");
    }

    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    return client;
}

app.post('/api/leads', async (req, res) => {
    try {
        const { name, mobile, timestamp } = req.body;
        
        if (!name || !mobile) {
            return res.status(400).json({ error: "Name and Mobile are required" });
        }

        const client = await connectToDatabase();
        const database = client.db("jv_brand");
        const leads = database.collection("leads");

        const result = await leads.insertOne({
            name,
            mobile,
            timestamp: timestamp || new Date().toISOString(),
            source: "Beginning Gate"
        });

        res.status(201).json({ message: "Lead saved successfully", id: result.insertedId });
    } catch (err) {
        console.error("General Error in /api/leads:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    } finally {
        // Optional: on Vercel, closing connection immediately can be slower for subsequent calls,
        // but it's safer for preventing connection leaks if not using a singleton.
        // await client.close(); 
    }
});

module.exports = app;
