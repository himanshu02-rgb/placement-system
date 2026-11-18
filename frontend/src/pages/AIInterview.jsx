import { useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const scoreTone = (score) => {
  if (score >= 7) return 'text-emerald-600';
  if (score >= 4) return 'text-amber-600';
  return 'text-rose-600';
};

const AIInterview = () => {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sample answers cached by question text for this session
  const [samples, setSamples] = useState({});
  const [openSampleFor, setOpenSampleFor] = useState(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState('');

  const currentQuestion = questions[currentIndex];
  const currentSample = samples[currentQuestion];
  const isSampleOpen = openSampleFor !== null && openSampleFor === currentQuestion;
  const progress = questions.length ? (currentIndex / questions.length) * 100 : 0;

  const generateQuestions = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/interview/generate', { role: role.trim() });
      setQuestions(res.data.questions);
      setCurrentIndex(0);
      setAnswer('');
      setFeedback(null);
      setSamples({});
      setOpenSampleFor(null);
      setSampleError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/interview/evaluate', {
        question: currentQuestion,
        answer,
      });
      setFeedback(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not evaluate your answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSample = async () => {
    if (isSampleOpen) {
      setOpenSampleFor(null);
      return;
    }
    setSampleError('');

    // Already fetched for this question: show it without another API call
    if (samples[currentQuestion]) {
      setOpenSampleFor(currentQuestion);
      return;
    }

    setSampleLoading(true);
    try {
      const res = await api.post('/ai/interview/sample', {
        question: currentQuestion,
        role: role.trim(),
      });
      setSamples((prev) => ({ ...prev, [currentQuestion]: res.data }));
      setOpenSampleFor(currentQuestion);
    } catch (err) {
      setSampleError(err.response?.data?.message || 'Could not load a sample answer. Please try again.');
    } finally {
      setSampleLoading(false);
    }
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
    setAnswer('');
    setFeedback(null);
    setOpenSampleFor(null);
    setSampleError('');
  };

  const resetSession = () => {
    setRole('');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswer('');
    setFeedback(null);
    setError('');
    setSamples({});
    setOpenSampleFor(null);
    setSampleError('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <PageHeader
        eyebrow="Practice"
        title="AI Mock Interview"
        subtitle="Practice interview questions tailored to your target role"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <label htmlFor="target-role" className="block text-sm font-medium text-slate-700 mb-2">
            Target role
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="target-role"
              type="text"
              placeholder="e.g. Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateQuestions()}
              className="border border-slate-300 p-2.5 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={generateQuestions}
              disabled={loading || !role.trim()}
              className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Generating...' : 'Start'}
            </button>
          </div>
        </div>
      ) : currentIndex < questions.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs font-medium mb-2">
              <span className="text-indigo-600">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-400">{Math.round(progress)}% done</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <p className="text-lg font-semibold text-slate-800 leading-relaxed mb-4">
            {currentQuestion}
          </p>

          {/* Sample answer */}
          <div className="mb-5">
            <button
              type="button"
              onClick={toggleSample}
              disabled={sampleLoading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
            >
              {sampleLoading
                ? 'Loading sample...'
                : isSampleOpen
                ? 'Hide sample answer'
                : 'Show sample answer'}
            </button>

            {sampleError && <p className="mt-2 text-sm text-rose-600">{sampleError}</p>}

            {isSampleOpen && currentSample && (
              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">
                  Sample answer
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {currentSample.sampleAnswer}
                </p>

                {currentSample.keyPoints?.length > 0 && (
                  <>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">
                      Key points
                    </p>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {currentSample.keyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="mt-4 text-xs text-slate-500">
                  Use this to learn the structure, then write your own answer in your own words.
                </p>
              </div>
            )}
          </div>

          {/* Answer */}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            disabled={!!feedback}
            className="border border-slate-300 p-2.5 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
            placeholder="Type your answer..."
          />

          {!feedback ? (
            <button
              onClick={submitAnswer}
              disabled={loading || !answer.trim()}
              className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Evaluating...' : 'Submit Answer'}
            </button>
          ) : (
            <div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-4">
                <p className="font-semibold text-slate-800">
                  Score:{' '}
                  <span className={scoreTone(feedback.score)}>{feedback.score}/10</span>
                </p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{feedback.feedback}</p>
              </div>
              <button
                onClick={nextQuestion}
                className="bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {currentIndex + 1 < questions.length ? 'Next Question →' : 'Finish'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
          <p className="text-xl font-semibold text-slate-800">Interview complete! 🎉</p>
          <p className="text-slate-500 text-sm mt-2">Great practice session.</p>
          <button
            onClick={resetSession}
            className="mt-6 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Practice another role
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInterview;