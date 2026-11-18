const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');

// Student applies to a job with one of their own resumes.
const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { resumeId } = req.body;

    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'Please choose a resume to apply with' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // The resume must belong to the logged-in student.
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const alreadyApplied = await Application.findOne({
      userId: req.user._id,
      jobId: jobId,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    const application = await Application.create({
      userId: req.user._id,
      jobId: jobId,
      resumeId: resume._id,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student sees their own applications, with the job and the resume they sent.
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title company location salary')
      .populate('resumeId', 'fileName')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recruiter changes the stage of an application. Only the recruiter who posted the job can do this.
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!Application.STAGES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${Application.STAGES.join(', ')}`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // String() handles jobs with no postedBy, which will never match.
    if (String(job.postedBy) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'You can only update applications for your own jobs' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id });

    const stats = {
      total: applications.length,
      applied: applications.filter((a) => a.status === 'Applied').length,
      shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      interview: applications.filter((a) => a.status === 'Interview').length,
      selected: applications.filter((a) => a.status === 'Selected').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyToJob, getMyApplications, updateApplicationStatus, getDashboardStats };