import axios, { AxiosInstance } from 'axios';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      try {
        const response = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthTokens> {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    await api.post('/api/auth/logout', { refresh_token: refreshToken });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<void> {
    await api.post('/api/auth/password-reset-request', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/api/auth/password-reset', { token, password });
  },
};

// Email AI API
export const emailAI = {
  async summarize(content: string, subject?: string) {
    const response = await api.post('/api/email/summarize', { content, subject });
    return response.data;
  },

  async analyzeSentiment(content: string, subject?: string) {
    const response = await api.post('/api/email/sentiment', { content, subject });
    return response.data;
  },

  async classifyPriority(content: string, subject?: string) {
    const response = await api.post('/api/email/priority', { content, subject });
    return response.data;
  },

  async extractActions(content: string, subject?: string) {
    const response = await api.post('/api/email/actions', { content, subject });
    return response.data;
  },

  async generateReplies(content: string, subject?: string) {
    const response = await api.post('/api/email/replies', { content, subject });
    return response.data;
  },
};

// Life Balance AI API
export const lifeBalanceAI = {
  async calculateScores(activities: string[]) {
    const response = await api.post('/api/life-balance/scores', { activities });
    return response.data;
  },

  async generateInsights(activities: string[]) {
    const response = await api.post('/api/life-balance/insights', { activities });
    return response.data;
  },

  async getRecommendations(activities: string[]) {
    const response = await api.post('/api/life-balance/recommendations', { activities });
    return response.data;
  },

  async optimizeSchedule(activities: string[], schedule: string) {
    const response = await api.post('/api/life-balance/optimize', { activities, schedule });
    return response.data;
  },
};

// Memory AI API
export const memoryAI = {
  async identifyLearningStyle(sessions: any[]) {
    const response = await api.post('/api/memory/learning-style', { sessions });
    return response.data;
  },

  async calculatePerformanceMetrics(sessions: any[]) {
    const response = await api.post('/api/memory/performance', { sessions });
    return response.data;
  },

  async getStudyRecommendations(sessions: any[]) {
    const response = await api.post('/api/memory/recommendations', { sessions });
    return response.data;
  },

  async extractKeyConceptsFromContent(content: string, type: string) {
    const response = await api.post('/api/memory/concepts', { content, type });
    return response.data;
  },

  async generateReviewQuestions(content: string, type: string, count: number) {
    const response = await api.post('/api/memory/questions', { content, type, count });
    return response.data;
  },

  async analyzeKnowledgeGaps(sessions: any[]) {
    const response = await api.post('/api/memory/gaps', { sessions });
    return response.data;
  },

  async getLearningStyles() {
    const response = await api.get('/api/memory/learning-styles');
    return response.data;
  },

  async getMemoryTechniques() {
    const response = await api.get('/api/memory/techniques');
    return response.data;
  },
};

export default api; 