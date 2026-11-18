const Job = require('../models/Job');
const Application = require('../models/Application');
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

// Recruiter's own jobs, each with an applicant count.
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 }).lean();

    const jobIds = jobs.map((job) => job._id);
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);

    const countByJob = new Map(counts.map((c) => [c._id.toString(), c.count]));

    const result = jobs.map((job) => ({
      ...job,
      applicantCount: countByJob.get(job._id.toString()) || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Applicants for one job. Only the recruiter who posted it can see them.
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (String(job.postedBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only view applicants for your own jobs' });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('userId', 'name email')
      .populate('resumeId', 'fileName createdAt')
      .sort({ createdAt: -1 });

    res.json({
      job: { _id: job._id, title: job.title, company: job.company },
      applications,
    });
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

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  getJobApplicants,
  parseJobDescription,
};