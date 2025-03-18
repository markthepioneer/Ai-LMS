import React, { useState, ChangeEvent } from 'react';
import { memoryAI } from '../services/api';

interface StudySession {
  content: string;
  duration: number;
  method: string;
  performance: number;
}

interface AnalysisResult {
  learning_style?: string;
  performance_metrics?: {
    retention_rate: number;
    comprehension_score: number;
    efficiency_score: number;
  };
  recommendations?: string[];
  key_concepts?: string[];
  review_questions?: string[];
  knowledge_gaps?: string[];
}

const Memory: React.FC = () => {
  const [session, setSession] = useState<StudySession>({
    content: '',
    duration: 30,
    method: 'reading',
    performance: 7,
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
        styleResult,
        metricsResult,
        recommendationsResult,
        conceptsResult,
        questionsResult,
        gapsResult,
      ] = await Promise.all([
        memoryAI.identifyLearningStyle([session]),
        memoryAI.calculatePerformanceMetrics([session]),
        memoryAI.getStudyRecommendations([session]),
        memoryAI.extractKeyConceptsFromContent(session.content, session.method),
        memoryAI.generateReviewQuestions(session.content, session.method, 5),
        memoryAI.analyzeKnowledgeGaps([session]),
      ]);

      setResult({
        learning_style: styleResult.learning_style,
        performance_metrics: metricsResult.metrics,
        recommendations: recommendationsResult.recommendations,
        key_concepts: conceptsResult.concepts,
        review_questions: questionsResult.questions,
        knowledge_gaps: gapsResult.gaps,
      });
    } catch (err) {
      setError('Failed to analyze memory and learning. Please try again.');
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSession(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'performance' ? Number(value) : value,
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Memory & Learning Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Study Content</h2>
          <textarea
            name="content"
            value={session.content}
            onChange={handleInputChange}
            className="w-full p-2 border rounded h-32"
            placeholder="Enter the content you studied"
          />
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Study Details</h2>
          
          <div className="mb-4">
            <label className="block mb-2">
              Study Method:
              <select
                name="method"
                value={session.method}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="reading">Reading</option>
                <option value="note-taking">Note Taking</option>
                <option value="practice">Practice Exercises</option>
                <option value="discussion">Discussion</option>
                <option value="teaching">Teaching Others</option>
              </select>
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Duration (minutes):
              <input
                type="number"
                name="duration"
                value={session.duration}
                onChange={handleInputChange}
                min="1"
                max="480"
                className="w-full p-2 border rounded"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Self-Rated Performance (1-10):
              <input
                type="number"
                name="performance"
                value={session.performance}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full p-2 border rounded"
              />
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !session.content}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mb-4"
      >
        {loading ? 'Analyzing...' : 'Analyze Learning'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h3 className="font-bold mb-2">Learning Style</h3>
              <p className="text-lg">{result.learning_style}</p>
            </div>

            {result.performance_metrics && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Performance Metrics</h3>
                <div className="space-y-2">
                  <p>
                    Retention Rate:{' '}
                    <span className="font-bold">
                      {(result.performance_metrics.retention_rate * 100).toFixed(1)}%
                    </span>
                  </p>
                  <p>
                    Comprehension:{' '}
                    <span className="font-bold">
                      {(result.performance_metrics.comprehension_score * 10).toFixed(1)}/10
                    </span>
                  </p>
                  <p>
                    Efficiency:{' '}
                    <span className="font-bold">
                      {(result.performance_metrics.efficiency_score * 10).toFixed(1)}/10
                    </span>
                  </p>
                </div>
              </div>
            )}

            {result.key_concepts && result.key_concepts.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Key Concepts</h3>
                <ul className="list-disc pl-4">
                  {result.key_concepts.map((concept, index) => (
                    <li key={index}>{concept}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Study Recommendations</h3>
                <ul className="list-disc pl-4">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.review_questions && result.review_questions.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Review Questions</h3>
                <ul className="list-decimal pl-4">
                  {result.review_questions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.knowledge_gaps && result.knowledge_gaps.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Knowledge Gaps</h3>
                <ul className="list-disc pl-4">
                  {result.knowledge_gaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Memory; 