require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection URI (Render sets MONGODB_URI in environment)
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studentsdb';

// Helper to mask credentials in log
function safeDbLabel(uri) {
  try {
    const withoutProto = uri.replace(/^.*:\/\//, '');
    if (withoutProto.includes('@')) return withoutProto.split('@')[1];
    return withoutProto;
  } catch {
    return '(unknown)';
  }
}

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected to', safeDbLabel(MONGODB_URI)))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  department: { type: String, enum: ['IT', 'CSE', 'AIDS', 'CET'], required: true },
  section: { type: Number, enum: [1, 2, 3], required: true },
  skills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Routes

// Create new student
app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: '✅ Student saved', student });
  } catch (err) {
    console.error('Error saving student:', err);
    res.status(500).json({ error: 'Save failed' });
  }
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    const list = await Student.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
