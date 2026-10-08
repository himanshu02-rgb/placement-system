import { useState } from 'react';
import api from '../services/api';

const AIInterview = () => {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQuestions = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/interview/generate', { role });
      setQuestions(res.data.questions);
      setCurrentIndex(0);
      setFeedback(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/interview/evaluate', {
        question: questions[currentIndex],
        answer,
      });
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
    setAnswer('');
    setFeedback(null);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">AI Mock Interview</h2>
      <p className="text-slate-500 text-sm mb-6">Practice interview questions tailored to your target role</p>

      {questions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex gap-3">
          <input
            type="text"
            placeholder="Enter target role e.g. Frontend Developer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-slate-300 p-2.5 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="bg-indigo-600 text-white font-medium px-5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Start'}
          </button>
        </div>
      ) : currentIndex < questions.length ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <p className="text-xs font-medium text-indigo-600 mb-2">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-slate-800 font-medium mb-4">{questions[currentIndex]}</p>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            className="border border-slate-300 p-2.5 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your answer..."
          />

          {!feedback ? (
            <button
              onClick={submitAnswer}
              disabled={loading || !answer}
              className="bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Evaluating...' : 'Submit Answer'}
            </button>
          ) : (
            <div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-slate-800">
                  Score: <span className="text-indigo-600">{feedback.score}/10</span>
                </p>
                <p className="text-sm text-slate-600 mt-2">{feedback.feedback}</p>
              </div>
              <button
                onClick={nextQuestion}
                className="bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                Next Question →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
          <p className="text-xl font-semibold text-slate-800">Interview complete! 🎉</p>
          <p className="text-slate-500 text-sm mt-2">Great practice session. Try another role anytime.</p>
        </div>
      )}
    </div>
  );
};

export default AIInterview;