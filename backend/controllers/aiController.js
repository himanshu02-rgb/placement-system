const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { generateContent, parseAIJson } = require('../services/aiService');

// Reads the saved PDF and returns its text.
// Throws a clear error if the file is missing from the uploads folder.
const extractResumeText = async (resume) => {
  const absolutePath = path.resolve(resume.filePath);

  if (!fs.existsSync(absolutePath)) {
    const err = new Error('Your resume file is missing on the server. Please upload it again.');
    err.status = 409;
    throw err;
  }

  const dataBuffer = fs.readFileSync(absolutePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text || '';
};

// Sends the right status and message back to the page.
// Errors from the AI service carry a status and a friendly message, so they are passed through.
// Anything else gets the fallback message.
const sendError = (res, error, fallbackMessage, label) => {
  console.error(`${label} error:`, error.message);

  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: fallbackMessage });
};

const resumeAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
    }

    // Reuse saved text when it exists, so the PDF is not parsed again.
    let resumeText = resume.extractedText;
    if (!resumeText) {
      resumeText = await extractResumeText(resume);
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ message: 'Could not extract readable text from this PDF.' });
    }

    const prompt = `You are an expert technical recruiter. Analyze the resume text below and respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this structure:
{
  "skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "missingSkills": ["skill1", "skill2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Rules:
- "skills": technical/professional skills found in the resume.
- "strengths": 2-4 genuine strong points of this resume.
- "missingSkills": important skills commonly expected for similar roles but missing here.
- "suggestions": 3-5 concrete, actionable improvements.

Resume text:
"""
${resumeText.slice(0, 4000)}
"""`;

    const rawResponse = await generateContent(prompt);
    const analysis = parseAIJson(rawResponse);

    const isValid =
      analysis &&
      Array.isArray(analysis.skills) &&
      Array.isArray(analysis.strengths) &&
      Array.isArray(analysis.missingSkills) &&
      Array.isArray(analysis.suggestions);

    if (!isValid) {
      return res.status(502).json({ message: 'AI returned an unexpected format. Please try again.' });
    }

    resume.extractedText = resumeText;
    resume.aiAnalysis = analysis;
    await resume.save();

    res.status(200).json(analysis);
  } catch (error) {
    sendError(res, error, 'Failed to analyze resume', 'Resume analysis');
  }
};

const jobMatch = async (req, res) => {
  try {
    const { resumeId, jobId, jobDescription } = req.body;

    if (!resumeId || !mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: 'A valid resumeId is required' });
    }

    const hasPostedJob = Boolean(jobId);
    const hasPastedJd = typeof jobDescription === 'string' && jobDescription.trim().length > 0;

    if (!hasPostedJob && !hasPastedJd) {
      return res.status(400).json({ message: 'Provide either a jobId or a jobDescription' });
    }

    // Ownership check: the resume must belong to the logged-in user.
    // Returns 404 (not 403) so the response doesn't reveal whether the resume exists.
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Build the job context from either a posted job or pasted text
    let jobContext;
    if (hasPostedJob) {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(404).json({ message: 'Job not found' });
      }
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
      jobContext = `Job Title: ${job.title}
Job Description: ${job.description.slice(0, 4000)}
Required Skills: ${(job.skills || []).join(', ')}`;
    } else {
      jobContext = `Job Description: ${jobDescription.trim().slice(0, 4000)}`;
    }

    // Use saved text if we have it; otherwise parse the PDF and save the text for next time
    let resumeText = resume.extractedText;
    if (!resumeText) {
      resumeText = await extractResumeText(resume);

      if (!resumeText || resumeText.trim().length < 20) {
        return res.status(400).json({ message: 'Could not extract readable text from this resume' });
      }

      resume.extractedText = resumeText;
      await resume.save();
    }

    const prompt = `You are an expert technical recruiter. Compare the candidate's resume with the job description below and respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this structure:
{
  "matchScore": 75,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Rules:
- "matchScore": integer 0-100 representing overall fit for this specific job.
- "matchingSkills": skills the candidate has that match job requirements.
- "missingSkills": skills required by the job but not found in the resume.
- "recommendations": 3-5 concrete suggestions to improve fit for this role.

${jobContext}

Resume text:
"""
${resumeText.slice(0, 4000)}
"""`;

    const rawResponse = await generateContent(prompt);
    const matchResult = parseAIJson(rawResponse);

    const isValid =
      matchResult &&
      typeof matchResult.matchScore === 'number' &&
      Array.isArray(matchResult.matchingSkills) &&
      Array.isArray(matchResult.missingSkills) &&
      Array.isArray(matchResult.recommendations);

    if (!isValid) {
      return res.status(502).json({ message: 'AI returned an unexpected format. Please try again.' });
    }

    res.status(200).json(matchResult);
  } catch (error) {
    sendError(res, error, 'Failed to match job', 'Job match');
  }
};

const interviewGenerate = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'role is required' });
    }

    const prompt = `You are an expert technical interviewer. Generate exactly 5 interview questions for a candidate applying for the role of "${role}". Respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this structure:
{
  "questions": ["question1", "question2", "question3", "question4", "question5"]
}

Rules:
- Mix of technical and behavioral questions relevant to "${role}".
- Questions should be clear, concise, and realistic for an actual interview.`;

    const rawResponse = await generateContent(prompt);
    const result = parseAIJson(rawResponse);

    const isValid = result && Array.isArray(result.questions) && result.questions.length > 0;

    if (!isValid) {
      return res.status(502).json({ message: 'AI returned an unexpected format. Please try again.' });
    }

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error, 'Failed to generate interview questions', 'Interview generate');
  }
};

const interviewEvaluate = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'question and answer are required' });
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer. Respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this structure:
{
  "score": 7,
  "feedback": "Specific, constructive feedback on the answer."
}

Rules:
- "score": integer 0-10 rating the quality, clarity, and correctness of the answer.
- "feedback": 2-3 sentences of specific, constructive feedback — mention what was good and what could improve.

Question: ${question}
Candidate's Answer: ${answer}`;

    const rawResponse = await generateContent(prompt);
    const result = parseAIJson(rawResponse);

    const isValid = result && typeof result.score === 'number' && typeof result.feedback === 'string';

    if (!isValid) {
      return res.status(502).json({ message: 'AI returned an unexpected format. Please try again.' });
    }

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error, 'Failed to evaluate answer', 'Interview evaluate');
  }
};

// Writes a model answer for one interview question, so a student who is stuck can learn the structure.
const interviewSampleAnswer = async (req, res) => {
  try {
    const { question, role } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ message: 'question is required' });
    }

    const roleText =
      typeof role === 'string' && role.trim()
        ? ` for the role of "${role.trim().slice(0, 100)}"`
        : '';

    const prompt = `You are an expert technical interviewer. Write a strong sample answer to the interview question below${roleText}, written the way a good candidate would say it out loud. Respond with ONLY valid JSON (no markdown, no code fences, no extra text) in exactly this structure:
{
  "sampleAnswer": "A clear answer in first person.",
  "keyPoints": ["point1", "point2", "point3"]
}

Rules:
- "sampleAnswer": 80-150 words, simple English, first person, easy to say out loud.
- "keyPoints": 3-4 short points the answer covers, so the student can learn the structure.

Question: ${question.trim().slice(0, 500)}`;

    const rawResponse = await generateContent(prompt);
    const result = parseAIJson(rawResponse);

    const isValid =
      result &&
      typeof result.sampleAnswer === 'string' &&
      result.sampleAnswer.trim().length > 0 &&
      Array.isArray(result.keyPoints);

    if (!isValid) {
      return res.status(502).json({ message: 'AI returned an unexpected format. Please try again.' });
    }

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error, 'Failed to create a sample answer', 'Interview sample');
  }
};

module.exports = {
  resumeAnalysis,
  jobMatch,
  interviewGenerate,
  interviewEvaluate,
  interviewSampleAnswer,
};