const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const Job = require('../models/Job');

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

// Streams a PDF to:
//  - the student who owns it, or
//  - a recruiter, but only if that student applied to one of the recruiter's jobs with this resume.
const getResumeFile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const isOwner = String(resume.userId) === String(req.user._id);

    let isRecruiterForThisResume = false;
    if (!isOwner && req.user.role === 'admin') {
      const applications = await Application.find({ resumeId: resume._id }).select('jobId');
      const jobIds = applications.map((a) => a.jobId);
      const ownsJob = await Job.exists({ _id: { $in: jobIds }, postedBy: req.user._id });
      isRecruiterForThisResume = Boolean(ownsJob);
    }

    if (!isOwner && !isRecruiterForThisResume) {
      return res.status(403).json({ message: 'You are not allowed to view this resume' });
    }

    // path.resolve works for both old relative paths and new absolute paths.
    const absolutePath = path.resolve(resume.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Resume file is missing on the server' });
    }

    res.sendFile(absolutePath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ message: 'Could not send the file' });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume, getMyResume, getMyResumes, getResumeFile };