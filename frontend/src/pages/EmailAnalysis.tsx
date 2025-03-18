import React, { useState, ChangeEvent } from 'react';
import { emailAI } from '../services/api';

interface AnalysisResult {
  summary?: string;
  sentiment?: string;
  priority?: string;
  action_items?: string[];
  reply_suggestions?: string[];
}

interface EmailState {
  subject: string;
  content: string;
}

const EmailAnalysis: React.FC = () => {
  const [email, setEmail] = useState<EmailState>({
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      // Run all analysis in parallel
      const [
        summaryResult,
        sentimentResult,
        priorityResult,
        actionItemsResult,
        replySuggestionsResult,
      ] = await Promise.all([
        emailAI.summarize(email.content, email.subject),
        emailAI.analyzeSentiment(email.content, email.subject),
        emailAI.classifyPriority(email.content, email.subject),
        emailAI.extractActions(email.content, email.subject),
        emailAI.generateReplies(email.content, email.subject),
      ]);

      setResult({
        summary: summaryResult.summary,
        sentiment: sentimentResult.sentiment,
        priority: priorityResult.priority,
        action_items: actionItemsResult.action_items,
        reply_suggestions: replySuggestionsResult.reply_suggestions,
      });
    } catch (err) {
      setError('Failed to analyze email. Please try again.');
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmail((prev: EmailState) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Email Analysis</h1>

      <div className="mb-4">
        <label className="block mb-2">
          Subject:
          <input
            type="text"
            name="subject"
            value={email.subject}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Enter email subject"
          />
        </label>
      </div>

      <div className="mb-4">
        <label className="block mb-2">
          Content:
          <textarea
            name="content"
            value={email.content}
            onChange={handleInputChange}
            className="w-full p-2 border rounded h-32"
            placeholder="Enter email content"
          />
        </label>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !email.content}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? 'Analyzing...' : 'Analyze Email'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div 
          className="mt-4 p-4 bg-white shadow rounded"
          role="region"
          aria-label="Analysis Results"
        >
          <div className="mb-4">{result.summary}</div>
          <div className="mb-2">
            <strong>Sentiment: </strong>
            {result.sentiment}
          </div>
          <div className="mb-2">
            <strong>Priority: </strong>
            {result.priority}
          </div>
          {result.action_items && result.action_items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-bold mb-2">Action Items:</h3>
              <ul className="list-disc pl-5">
                {result.action_items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {result.reply_suggestions && result.reply_suggestions.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Reply Suggestions:</h3>
              <ul className="list-disc pl-5">
                {result.reply_suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailAnalysis; 