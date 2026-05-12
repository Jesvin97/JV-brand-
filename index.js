const express = require('express');
const path = require('path');
const app = require('./api/leads');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle the home page explicitly if needed, 
// though express.static usually handles index.html automatically
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
