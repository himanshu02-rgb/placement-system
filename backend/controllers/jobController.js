const Job = require('../models/Job');
const pdfParse = require('pdf-parse');

const createJob = async (req, res) => {
  try {
    const { title, company, location, description, skills, salary } = req.body;

    const job = await Job.create({
      title,
      company,
      location,
      description,
      skills,
      salary,
      postedBy: req.user._id,
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { keyword, location, skills } = req.query;

    let filter = {};

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { company: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (skills) {
      filter.skills = { $in: skills.split(',') };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reads text out of an uploaded JD PDF and returns it. Does not save anything to the database.
const parseJobDescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a PDF under the field name "jd"' });
    }

    const data = await pdfParse(req.file.buffer);

    // Tidy the spacing from the PDF so the textarea reads cleanly.
    const text = data.text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text) {
      return res
        .status(400)
        .json({ message: 'No readable text found. The PDF may be a scanned image.' });
    }

    res.json({ text });
  } catch (error) {
    console.error('parseJobDescription error:', error);
    res.status(500).json({ message: 'Could not read this PDF' });
  }
};

module.exports = { createJob, getJobs, getJobById, parseJobDescription };