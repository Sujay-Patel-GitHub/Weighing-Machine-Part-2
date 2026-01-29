const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Using a placeholder URI - User will need to replace this or I can provide a .env template
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data_bridge';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema
const DataSchema = new mongoose.Schema({
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const DataModel = mongoose.model('Data', DataSchema);

// Routes
// Get all data
app.get('/api/data', async (req, res) => {
    try {
        const data = await DataModel.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save new data
app.post('/api/data', async (req, res) => {
    const newData = new DataModel({
        content: req.body.content
    });

    try {
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete data (bonus for better viewer)
app.delete('/api/data/:id', async (req, res) => {
    try {
        await DataModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Data deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
