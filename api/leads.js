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
            return res.status(500).json({ error: "Database configuration missing" });
        }

        await client.connect();
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
        console.error("Error saving lead:", err);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        await client.close();
    }
});

module.exports = app;
