const Resume = require('../models/Resume');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns the newest resume (used by existing pages)
const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Returns ALL resumes belonging to the logged-in user, newest first
const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText') // keep the list response small
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume, getMyResume, getMyResumes };