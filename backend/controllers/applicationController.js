const Application = require('../models/Application');
const Job = require('../models/Job');

const applyToJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
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
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title company location salary')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
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
      selected: applications.filter((a) => a.status === 'Selected').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyToJob, getMyApplications, updateApplicationStatus, getDashboardStats };
