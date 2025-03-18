import React, { useState, ChangeEvent } from 'react';
import { lifeBalanceAI } from '../services/api';

interface LifeBalanceData {
  activities: string[];
  schedule: string;
  goals: string[];
}

interface AnalysisResult {
  balance_score?: number;
  insights?: string[];
  recommendations?: string[];
  optimized_schedule?: string;
}

const LifeBalance: React.FC = () => {
  const [data, setData] = useState<LifeBalanceData>({
    activities: [],
    schedule: '',
    goals: [],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newActivity, setNewActivity] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      // Run all analysis in parallel
      const [
        balanceResult,
        insightsResult,
        recommendationsResult,
        scheduleResult,
      ] = await Promise.all([
        lifeBalanceAI.calculateScores(data.activities),
        lifeBalanceAI.generateInsights(data.activities),
        lifeBalanceAI.getRecommendations(data.activities),
        lifeBalanceAI.optimizeSchedule(data.activities, data.schedule),
      ]);

      setResult({
        balance_score: balanceResult.overall_score,
        insights: insightsResult.insights,
        recommendations: recommendationsResult.recommendations,
        optimized_schedule: scheduleResult.optimized_schedule,
      });
    } catch (err) {
      setError('Failed to analyze life balance. Please try again.');
      console.error('Analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setData(prev => ({ ...prev, schedule: e.target.value }));
  };

  const addActivity = () => {
    if (newActivity.trim()) {
      setData(prev => ({
        ...prev,
        activities: [...prev.activities, newActivity.trim()],
      }));
      setNewActivity('');
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()],
      }));
      setNewGoal('');
    }
  };

  const removeActivity = (index: number) => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const removeGoal = (index: number) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Life Balance Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Activities</h2>
          <div className="flex mb-2">
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              className="flex-grow p-2 border rounded-l"
              placeholder="Add an activity"
            />
            <button
              onClick={addActivity}
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              Add
            </button>
          </div>
          <ul className="list-disc pl-4">
            {data.activities.map((activity, index) => (
              <li key={index} className="flex justify-between items-center mb-1">
                {activity}
                <button
                  onClick={() => removeActivity(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Goals</h2>
          <div className="flex mb-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="flex-grow p-2 border rounded-l"
              placeholder="Add a goal"
            />
            <button
              onClick={addGoal}
              className="bg-blue-500 text-white px-4 py-2 rounded-r"
            >
              Add
            </button>
          </div>
          <ul className="list-disc pl-4">
            {data.goals.map((goal, index) => (
              <li key={index} className="flex justify-between items-center mb-1">
                {goal}
                <button
                  onClick={() => removeGoal(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Current Schedule</h2>
        <textarea
          value={data.schedule}
          onChange={handleScheduleChange}
          className="w-full p-2 border rounded h-32"
          placeholder="Describe your current daily/weekly schedule"
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !data.activities.length || !data.schedule || !data.goals.length}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mb-4"
      >
        {loading ? 'Analyzing...' : 'Analyze Life Balance'}
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
              <h3 className="font-bold mb-2">Balance Score</h3>
              <div className="text-4xl font-bold text-blue-500">
                {result.balance_score?.toFixed(1)}/10
              </div>
            </div>

            {result.insights && result.insights.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Insights</h3>
                <ul className="list-disc pl-4">
                  {result.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Recommendations</h3>
                <ul className="list-disc pl-4">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.optimized_schedule && (
              <div className="p-4 border rounded">
                <h3 className="font-bold mb-2">Optimized Schedule</h3>
                <pre className="whitespace-pre-wrap">{result.optimized_schedule}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LifeBalance; 