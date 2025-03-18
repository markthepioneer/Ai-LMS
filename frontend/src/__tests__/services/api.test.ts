import axios, { AxiosInstance } from 'axios';
import { auth, emailAI, lifeBalanceAI, memoryAI } from '../../services/api';

jest.mock('axios', () => {
  const mockAxios: any = {
    create: jest.fn(() => mockAxios),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
    defaults: {
      headers: {
        common: { Accept: 'application/json' },
        get: {},
        post: { 'Content-Type': 'application/json' },
        put: { 'Content-Type': 'application/json' },
        patch: { 'Content-Type': 'application/json' },
        delete: {},
        head: {},
      },
    },
    getUri: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    patch: jest.fn(),
  };
  return mockAxios;
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('auth', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockTokens = {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
    };

    it('should handle login successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockTokens });
      
      const result = await auth.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockTokens);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle registration successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockTokens });

      const result = await auth.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result).toEqual(mockTokens);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    });

    it('should handle logout successfully', async () => {
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await auth.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/logout', {
        refresh_token: 'mock_refresh_token',
      });
    });
  });

  describe('emailAI', () => {
    const mockEmail = {
      content: 'Test email content',
      subject: 'Test subject',
    };

    it('should analyze email content successfully', async () => {
      const mockResponse = {
        summary: 'Email summary',
        sentiment: 'positive',
        priority: 'high',
        action_items: ['Action 1', 'Action 2'],
        reply_suggestions: ['Reply 1', 'Reply 2'],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { summary: mockResponse.summary } });
      mockedAxios.post.mockResolvedValueOnce({ data: { sentiment: mockResponse.sentiment } });
      mockedAxios.post.mockResolvedValueOnce({ data: { priority: mockResponse.priority } });
      mockedAxios.post.mockResolvedValueOnce({ data: { action_items: mockResponse.action_items } });
      mockedAxios.post.mockResolvedValueOnce({ data: { reply_suggestions: mockResponse.reply_suggestions } });

      const summary = await emailAI.summarize(mockEmail.content, mockEmail.subject);
      const sentiment = await emailAI.analyzeSentiment(mockEmail.content, mockEmail.subject);
      const priority = await emailAI.classifyPriority(mockEmail.content, mockEmail.subject);
      const actions = await emailAI.extractActions(mockEmail.content, mockEmail.subject);
      const replies = await emailAI.generateReplies(mockEmail.content, mockEmail.subject);

      expect(summary).toEqual({ summary: mockResponse.summary });
      expect(sentiment).toEqual({ sentiment: mockResponse.sentiment });
      expect(priority).toEqual({ priority: mockResponse.priority });
      expect(actions).toEqual({ action_items: mockResponse.action_items });
      expect(replies).toEqual({ reply_suggestions: mockResponse.reply_suggestions });
    });
  });

  describe('lifeBalanceAI', () => {
    const mockActivities = ['Work', 'Exercise', 'Sleep'];
    const mockSchedule = 'Daily schedule...';

    it('should analyze life balance successfully', async () => {
      const mockResponse = {
        overall_score: 8.5,
        insights: ['Insight 1', 'Insight 2'],
        recommendations: ['Recommendation 1', 'Recommendation 2'],
        optimized_schedule: 'Optimized schedule...',
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { overall_score: mockResponse.overall_score } });
      mockedAxios.post.mockResolvedValueOnce({ data: { insights: mockResponse.insights } });
      mockedAxios.post.mockResolvedValueOnce({ data: { recommendations: mockResponse.recommendations } });
      mockedAxios.post.mockResolvedValueOnce({ data: { optimized_schedule: mockResponse.optimized_schedule } });

      const scores = await lifeBalanceAI.calculateScores(mockActivities);
      const insights = await lifeBalanceAI.generateInsights(mockActivities);
      const recommendations = await lifeBalanceAI.getRecommendations(mockActivities);
      const schedule = await lifeBalanceAI.optimizeSchedule(mockActivities, mockSchedule);

      expect(scores).toEqual({ overall_score: mockResponse.overall_score });
      expect(insights).toEqual({ insights: mockResponse.insights });
      expect(recommendations).toEqual({ recommendations: mockResponse.recommendations });
      expect(schedule).toEqual({ optimized_schedule: mockResponse.optimized_schedule });
    });
  });

  describe('memoryAI', () => {
    const mockSession = {
      content: 'Study content',
      duration: 30,
      method: 'reading',
      performance: 7,
    };

    it('should analyze learning and memory successfully', async () => {
      const mockResponse = {
        learning_style: 'visual',
        metrics: {
          retention_rate: 0.85,
          comprehension_score: 0.9,
          efficiency_score: 0.8,
        },
        recommendations: ['Recommendation 1', 'Recommendation 2'],
        concepts: ['Concept 1', 'Concept 2'],
        questions: ['Question 1', 'Question 2'],
        gaps: ['Gap 1', 'Gap 2'],
      };

      mockedAxios.post.mockResolvedValueOnce({ data: { learning_style: mockResponse.learning_style } });
      mockedAxios.post.mockResolvedValueOnce({ data: { metrics: mockResponse.metrics } });
      mockedAxios.post.mockResolvedValueOnce({ data: { recommendations: mockResponse.recommendations } });
      mockedAxios.post.mockResolvedValueOnce({ data: { concepts: mockResponse.concepts } });
      mockedAxios.post.mockResolvedValueOnce({ data: { questions: mockResponse.questions } });
      mockedAxios.post.mockResolvedValueOnce({ data: { gaps: mockResponse.gaps } });

      const style = await memoryAI.identifyLearningStyle([mockSession]);
      const metrics = await memoryAI.calculatePerformanceMetrics([mockSession]);
      const recommendations = await memoryAI.getStudyRecommendations([mockSession]);
      const concepts = await memoryAI.extractKeyConceptsFromContent(mockSession.content, 'text');
      const questions = await memoryAI.generateReviewQuestions(mockSession.content, 'text', 5);
      const gaps = await memoryAI.analyzeKnowledgeGaps([mockSession]);

      expect(style).toEqual({ learning_style: mockResponse.learning_style });
      expect(metrics).toEqual({ metrics: mockResponse.metrics });
      expect(recommendations).toEqual({ recommendations: mockResponse.recommendations });
      expect(concepts).toEqual({ concepts: mockResponse.concepts });
      expect(questions).toEqual({ questions: mockResponse.questions });
      expect(gaps).toEqual({ gaps: mockResponse.gaps });
    });
  });
}); 