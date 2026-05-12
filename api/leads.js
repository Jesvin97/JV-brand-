const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI; 

if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables!");
}

const client = uri ? new MongoClient(uri) : null;

app.post('/api/leads', async (req, res) => {
    try {
        const { name, mobile, timestamp } = req.body;
        
        if (!name || !mobile) {
            return res.status(400).json({ error: "Name and Mobile are required" });
        }

        if (!client) {
            console.error("CRITICAL: MongoClient not initialized. Check MONGODB_URI.");
            return res.status(500).json({ error: "Database configuration missing on server" });
        }

        try {
            await client.connect();
        } catch (connErr) {
            console.error("CRITICAL: Failed to connect to MongoDB:", connErr.message);
            return res.status(500).json({ error: "Failed to connect to database" });
        }

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
