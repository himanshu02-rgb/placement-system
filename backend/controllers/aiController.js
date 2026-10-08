const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { generateContent, parseAIJson } = require('../services/aiService');

const resumeAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
    }

    const dataBuffer = fs.readFileSync(resume.filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

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
    console.error('Resume analysis error:', error.message);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
};

const jobMatch = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const resume = await Resume.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload a resume first.' });
    }

    let resumeText = resume.extractedText;
    if (!resumeText) {
      const dataBuffer = fs.readFileSync(resume.filePath);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
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

Job Title: ${job.title}
Job Description: ${job.description}
Required Skills: ${job.skills.join(', ')}

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
    console.error('Job match error:', error.message);
    res.status(500).json({ message: 'Failed to match job' });
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
    console.error('Interview generate error:', error.message);
    res.status(500).json({ message: 'Failed to generate interview questions' });
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
    console.error('Interview evaluate error:', error.message);
    res.status(500).json({ message: 'Failed to evaluate answer' });
  }
};

module.exports = { resumeAnalysis, jobMatch, interviewGenerate, interviewEvaluate };