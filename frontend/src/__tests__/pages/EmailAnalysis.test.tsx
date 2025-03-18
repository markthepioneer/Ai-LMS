import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import EmailAnalysis from '../../pages/EmailAnalysis';
import { emailAI } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  emailAI: {
    summarize: jest.fn(),
    analyzeSentiment: jest.fn(),
    classifyPriority: jest.fn(),
    extractActions: jest.fn(),
    generateReplies: jest.fn(),
  },
}));

const mockEmail = {
  subject: 'Test Subject',
  content: 'Test Content',
};

const mockResults = {
  summary: 'Email summary',
  sentiment: 'positive',
  priority: 'high',
  action_items: ['Action 1', 'Action 2'],
  reply_suggestions: ['Reply 1', 'Reply 2'],
};

describe('EmailAnalysis Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (emailAI.summarize as jest.Mock).mockResolvedValue({ summary: mockResults.summary });
    (emailAI.analyzeSentiment as jest.Mock).mockResolvedValue({ sentiment: mockResults.sentiment });
    (emailAI.classifyPriority as jest.Mock).mockResolvedValue({ priority: mockResults.priority });
    (emailAI.extractActions as jest.Mock).mockResolvedValue({ action_items: mockResults.action_items });
    (emailAI.generateReplies as jest.Mock).mockResolvedValue({ reply_suggestions: mockResults.reply_suggestions });
  });

  it('renders email analysis form', () => {
    render(<EmailAnalysis />);
    expect(screen.getByPlaceholderText('Enter email subject')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email content')).toBeInTheDocument();
    expect(screen.getByText('Analyze Email')).toBeInTheDocument();
  });

  it('handles email analysis successfully', async () => {
    render(<EmailAnalysis />);
    
    await act(async () => {
      const subjectInput = screen.getByPlaceholderText('Enter email subject');
      const contentInput = screen.getByPlaceholderText('Enter email content');
      await userEvent.type(subjectInput, mockEmail.subject);
      await userEvent.type(contentInput, mockEmail.content);
    });

    await act(async () => {
      const analyzeButton = screen.getByText('Analyze Email');
      await fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      const results = screen.getByRole('region', { name: /analysis results/i });
      expect(results).toHaveTextContent(mockResults.summary);
      expect(results).toHaveTextContent(`Sentiment: ${mockResults.sentiment}`);
      expect(results).toHaveTextContent(`Priority: ${mockResults.priority}`);
      mockResults.action_items.forEach(item => {
        expect(results).toHaveTextContent(item);
      });
      mockResults.reply_suggestions.forEach(suggestion => {
        expect(results).toHaveTextContent(suggestion);
      });
    });
  });

  it('handles API errors', async () => {
    const error = new Error('API Error');
    (emailAI.summarize as jest.Mock).mockRejectedValue(error);

    render(<EmailAnalysis />);

    await act(async () => {
      const subjectInput = screen.getByPlaceholderText('Enter email subject');
      const contentInput = screen.getByPlaceholderText('Enter email content');
      await userEvent.type(subjectInput, mockEmail.subject);
      await userEvent.type(contentInput, mockEmail.content);
    });

    await act(async () => {
      const analyzeButton = screen.getByText('Analyze Email');
      await fireEvent.click(analyzeButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to analyze email. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables analyze button when content is empty', async () => {
    render(<EmailAnalysis />);
    
    const analyzeButton = screen.getByText('Analyze Email');
    expect(analyzeButton).toBeDisabled();

    await act(async () => {
      const subjectInput = screen.getByPlaceholderText('Enter email subject');
      await userEvent.type(subjectInput, mockEmail.subject);
    });

    expect(analyzeButton).toBeDisabled();

    await act(async () => {
      const contentInput = screen.getByPlaceholderText('Enter email content');
      await userEvent.type(contentInput, mockEmail.content);
    });

    expect(analyzeButton).toBeEnabled();
  });
}); 