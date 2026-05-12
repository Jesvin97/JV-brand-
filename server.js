const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection URI
const uri = "mongodb+srv://dajproductionsh_db_user:3xOYVr5sqo0hq3fE@cluster0.dsczudj.mongodb.net/?appName=Cluster0"; 
// Example: "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}
connectDB();

// API Endpoint to save leads
app.post('/api/leads', async (req, res) => {
    try {
        const { name, mobile, timestamp } = req.body;
        
        if (!name || !mobile) {
            return res.status(400).json({ error: "Name and Mobile are required" });
        }

        const database = client.db("jv_brand");
        const leads = database.collection("leads");

        const result = await leads.insertOne({
            name,
            mobile,
            timestamp: timestamp || new Date().toISOString(),
            source: "Beginning Gate"
        });

        console.log(`New lead saved: ${name} (${mobile})`);
        res.status(201).json({ message: "Lead saved successfully", id: result.insertedId });
    } catch (err) {
        console.error("Error saving lead:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
