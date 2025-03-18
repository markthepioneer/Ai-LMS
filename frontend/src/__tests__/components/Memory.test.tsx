import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import Memory from '../../pages/Memory';
import { memoryAI } from '../../services/api';

// The mock matches the actual API interface
jest.mock('../../services/api', () => ({
  memoryAI: {
    identifyLearningStyle: jest.fn(),
    calculatePerformanceMetrics: jest.fn(),
    getStudyRecommendations: jest.fn(),
    extractKeyConceptsFromContent: jest.fn(),
    generateReviewQuestions: jest.fn(),
    analyzeKnowledgeGaps: jest.fn(),
  },
}));

describe('Memory Component', () => {
  const mockStudySession = {
    content: 'Studied derivatives and matrices',
    duration: 120,
    method: 'reading',
    performance: 8,
  };

  const mockResults = {
    learning_style: 'Visual',
    performance_metrics: {
      retention_rate: 0.85,
      comprehension_score: 0.8,
      efficiency_score: 0.75
    },
    recommendations: [
      'Use more diagrams and visual representations',
      'Incorporate hands-on exercises',
    ],
    key_concepts: [
      'Derivatives',
      'Matrix operations',
    ],
    review_questions: [
      'Explain the chain rule for derivatives',
      'Describe matrix multiplication',
    ],
    knowledge_gaps: [
      'Complex integration techniques',
      'Eigenvalue calculations',
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (memoryAI.identifyLearningStyle as jest.Mock).mockResolvedValue({
      learning_style: mockResults.learning_style,
    });
    (memoryAI.calculatePerformanceMetrics as jest.Mock).mockResolvedValue({
      metrics: mockResults.performance_metrics,
    });
    (memoryAI.getStudyRecommendations as jest.Mock).mockResolvedValue({
      recommendations: mockResults.recommendations,
    });
    (memoryAI.extractKeyConceptsFromContent as jest.Mock).mockResolvedValue({
      concepts: mockResults.key_concepts,
    });
    (memoryAI.generateReviewQuestions as jest.Mock).mockResolvedValue({
      questions: mockResults.review_questions,
    });
    (memoryAI.analyzeKnowledgeGaps as jest.Mock).mockResolvedValue({
      gaps: mockResults.knowledge_gaps,
    });
  });

  it('renders memory analysis form', () => {
    render(<Memory />);
    
    expect(screen.getByText('Memory & Learning Analysis')).toBeInTheDocument();
    expect(screen.getByText('Study Content')).toBeInTheDocument();
    expect(screen.getByText('Study Details')).toBeInTheDocument();
    expect(screen.getByText('Study Method:')).toBeInTheDocument();
    expect(screen.getByText('Duration (minutes):')).toBeInTheDocument();
    expect(screen.getByText('Self-Rated Performance (1-10):')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analyze Learning' })).toBeInTheDocument();
  });

  it('handles study session analysis successfully', async () => {
    render(<Memory />);

    // Fill in form
    const contentInput = screen.getByPlaceholderText('Enter the content you studied');
    const methodSelect = screen.getByLabelText('Study Method:');
    const durationInput = screen.getByLabelText('Duration (minutes):');
    const performanceInput = screen.getByLabelText('Self-Rated Performance (1-10):');
    
    await act(async () => {
      await userEvent.type(contentInput, mockStudySession.content);
      await userEvent.selectOptions(methodSelect, mockStudySession.method);
      await userEvent.clear(durationInput);
      await userEvent.type(durationInput, mockStudySession.duration.toString());
      await userEvent.clear(performanceInput);
      await userEvent.type(performanceInput, mockStudySession.performance.toString());
    });

    const analyzeButton = screen.getByRole('button', { name: 'Analyze Learning' });
    expect(analyzeButton).not.toBeDisabled();

    await act(async () => {
      await userEvent.click(analyzeButton);
    });

    // Verify API calls
    expect(memoryAI.identifyLearningStyle).toHaveBeenCalledWith([mockStudySession]);
    expect(memoryAI.calculatePerformanceMetrics).toHaveBeenCalledWith([mockStudySession]);
    expect(memoryAI.getStudyRecommendations).toHaveBeenCalledWith([mockStudySession]);
    expect(memoryAI.extractKeyConceptsFromContent).toHaveBeenCalledWith(mockStudySession.content, mockStudySession.method);
    expect(memoryAI.generateReviewQuestions).toHaveBeenCalledWith(mockStudySession.content, mockStudySession.method, 5);
    expect(memoryAI.analyzeKnowledgeGaps).toHaveBeenCalledWith([mockStudySession]);

    // Verify results are displayed
    await waitFor(() => {
      expect(screen.getByText(mockResults.learning_style)).toBeInTheDocument();
      expect(screen.getByText(`${(mockResults.performance_metrics.retention_rate * 100).toFixed(1)}%`)).toBeInTheDocument();
      expect(screen.getByText(mockResults.recommendations[0])).toBeInTheDocument();
      expect(screen.getByText(mockResults.key_concepts[0])).toBeInTheDocument();
      expect(screen.getByText(mockResults.review_questions[0])).toBeInTheDocument();
      expect(screen.getByText(mockResults.knowledge_gaps[0])).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    (memoryAI.identifyLearningStyle as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<Memory />);

    // Fill in minimal form data
    const contentInput = screen.getByPlaceholderText('Enter the content you studied');
    
    await act(async () => {
      await userEvent.type(contentInput, mockStudySession.content);
    });

    const analyzeButton = screen.getByRole('button', { name: 'Analyze Learning' });
    
    await act(async () => {
      await userEvent.click(analyzeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to analyze memory and learning. Please try again.')).toBeInTheDocument();
    });
  });

  it('validates form input', async () => {
    render(<Memory />);

    const analyzeButton = screen.getByRole('button', { name: 'Analyze Learning' });
    expect(analyzeButton).toBeDisabled();

    const contentInput = screen.getByPlaceholderText('Enter the content you studied');
    
    await act(async () => {
      await userEvent.type(contentInput, 'Test content');
    });

    expect(analyzeButton).not.toBeDisabled();
  });
}); 