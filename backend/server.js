const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Create storage directories
const STORAGE_DIR = path.join(__dirname, 'Weighing Project', 'IDs');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data_bridge';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const DataSchema = new mongoose.Schema({
    content: { type: String, required: true },
    operator: { type: String, default: 'unknown' },
    username: { type: String, required: true },
    rfid: { type: String, default: 'N/A' }, // Added RFID field
    timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rfid: { type: String, default: '' }, // Added RFID field
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const DataModel = mongoose.model('Data', DataSchema);
const UserModel = mongoose.model('User', UserSchema);

// Routes

// Root route
app.get('/', (req, res) => {
    res.send('<h1>Smart Weigh API Server</h1>');
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin') {
        return res.json({ success: true, user: { name: 'System Admin', username: 'admin', role: 'admin', rfid: 'MASTER' } });
    }

    try {
        const user = await UserModel.findOne({ username, password });
        if (user) {
            res.json({ success: true, user: { name: user.name, username: user.username, role: user.role, rfid: user.rfid } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get User List (Admin only)
app.get('/api/users', async (req, res) => {
    try {
        const users = await UserModel.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create User Route (Admin only)
app.post('/api/users', async (req, res) => {
    const { name, username, password, rfid } = req.body;

    try {
        const newUser = new UserModel({ name, username, password, rfid });
        const savedUser = await newUser.save();

        const userData = { name, username, password, rfid, createdAt: new Date() };
        const filePath = path.join(STORAGE_DIR, `${username}.json`);
        fs.writeFileSync(filePath, JSON.stringify(userData, null, 4));

        res.status(201).json({ success: true, user: savedUser });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update User Route (Admin only)
app.put('/api/users/:username', async (req, res) => {
    const { password, rfid } = req.body;
    const { username } = req.params;

    try {
        const user = await UserModel.findOneAndUpdate(
            { username },
            { password, rfid },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Update local file
        const filePath = path.join(STORAGE_DIR, `${username}.json`);
        if (fs.existsSync(filePath)) {
            const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            fileData.password = password;
            fileData.rfid = rfid;
            fs.writeFileSync(filePath, JSON.stringify(fileData, null, 4));
        }

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get all weighing data
app.get('/api/data', async (req, res) => {
    try {
        const data = await DataModel.find().sort({ timestamp: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get weighing data for a specific user
app.get('/api/data/:username', async (req, res) => {
    try {
        const data = await DataModel.find({ username: req.params.username }).sort({ timestamp: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save weighing data with RFID verification
app.post('/api/data', async (req, res) => {
    const { content, operator, username, rfid } = req.body;

    try {
        // Find the user to verify RFID
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User security profile not found." });
        }

        // Verify that the provided RFID matches the system-assigned RFID
        if (user.rfid !== rfid) {
            console.log(`Security Breach: Unauthorized RFID attempt for ${username}. Provided: ${rfid}, Expected: ${user.rfid}`);
            return res.status(403).json({ success: false, message: "Security Clearance Denied: RFID Mismatch." });
        }

        const newData = new DataModel({
            content,
            operator,
            username,
            rfid
        });

        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete data
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
