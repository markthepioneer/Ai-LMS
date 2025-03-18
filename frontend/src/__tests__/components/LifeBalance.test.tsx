import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { act } from 'react';
import LifeBalance from '../../pages/LifeBalance';
import { lifeBalanceAI } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  lifeBalanceAI: {
    calculateScores: jest.fn(),
    generateInsights: jest.fn(),
    getRecommendations: jest.fn(),
    optimizeSchedule: jest.fn(),
  },
}));

describe('LifeBalance Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock responses
    (lifeBalanceAI.calculateScores as jest.Mock).mockResolvedValue({ overall_score: 7.5 });
    (lifeBalanceAI.generateInsights as jest.Mock).mockResolvedValue({ insights: ['Good work-life balance'] });
    (lifeBalanceAI.getRecommendations as jest.Mock).mockResolvedValue({ recommendations: ['Take more breaks'] });
    (lifeBalanceAI.optimizeSchedule as jest.Mock).mockResolvedValue({ optimized_schedule: 'Optimized schedule here' });
  });

  test('renders life balance form', () => {
    render(<LifeBalance />);
    
    expect(screen.getByText('Life Balance Analysis')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add an activity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add a goal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your current daily/weekly schedule')).toBeInTheDocument();
    expect(screen.getByText('Analyze Life Balance')).toBeDisabled();
  });

  test('allows adding and removing activities', async () => {
    render(<LifeBalance />);
    
    const activityInput = screen.getByPlaceholderText('Add an activity');
    const addButtons = screen.getAllByText('Add');
    const addActivityButton = addButtons[0]; // First Add button is for activities
    
    // Add activity
    await act(async () => {
      await userEvent.type(activityInput, 'Exercise');
      fireEvent.click(addActivityButton);
    });
    
    expect(screen.getByText('Exercise')).toBeInTheDocument();
    
    // Remove activity
    const removeButton = screen.getByText('×');
    await act(async () => {
      fireEvent.click(removeButton);
    });
    
    expect(screen.queryByText('Exercise')).not.toBeInTheDocument();
  });

  test('allows adding and removing goals', async () => {
    render(<LifeBalance />);
    
    const goalInput = screen.getByPlaceholderText('Add a goal');
    const addButtons = screen.getAllByText('Add');
    const addGoalButton = addButtons[1]; // Second Add button is for goals
    
    // Add goal
    await act(async () => {
      await userEvent.type(goalInput, 'Learn React');
      fireEvent.click(addGoalButton);
    });
    
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    
    // Remove goal
    const removeButton = screen.getByText('×');
    await act(async () => {
      fireEvent.click(removeButton);
    });
    
    expect(screen.queryByText('Learn React')).not.toBeInTheDocument();
  });

  test('performs life balance analysis', async () => {
    render(<LifeBalance />);
    
    // Add required data
    const activityInput = screen.getByPlaceholderText('Add an activity');
    const goalInput = screen.getByPlaceholderText('Add a goal');
    const scheduleInput = screen.getByPlaceholderText('Describe your current daily/weekly schedule');
    const addButtons = screen.getAllByText('Add');
    const addActivityButton = addButtons[0];
    const addGoalButton = addButtons[1];
    
    // Add activity
    await act(async () => {
      await userEvent.type(activityInput, 'Exercise');
      fireEvent.click(addActivityButton);
    });
    
    // Add goal
    await act(async () => {
      await userEvent.type(goalInput, 'Stay healthy');
      fireEvent.click(addGoalButton);
    });
    
    // Add schedule
    await act(async () => {
      await userEvent.type(scheduleInput, 'Morning exercise, work, evening relaxation');
    });
    
    // Analyze
    const analyzeButton = screen.getByText('Analyze Life Balance');
    await act(async () => {
      fireEvent.click(analyzeButton);
    });
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('7.5/10')).toBeInTheDocument();
      expect(screen.getByText('Good work-life balance')).toBeInTheDocument();
      expect(screen.getByText('Take more breaks')).toBeInTheDocument();
      expect(screen.getByText('Optimized schedule here')).toBeInTheDocument();
    });
    
    // Verify all API calls were made
    expect(lifeBalanceAI.calculateScores).toHaveBeenCalledWith(['Exercise']);
    expect(lifeBalanceAI.generateInsights).toHaveBeenCalledWith(['Exercise']);
    expect(lifeBalanceAI.getRecommendations).toHaveBeenCalledWith(['Exercise']);
    expect(lifeBalanceAI.optimizeSchedule).toHaveBeenCalledWith(['Exercise'], 'Morning exercise, work, evening relaxation');
  });

  test('handles API errors', async () => {
    // Mock API error
    (lifeBalanceAI.calculateScores as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<LifeBalance />);
    
    // Add required data
    const activityInput = screen.getByPlaceholderText('Add an activity');
    const goalInput = screen.getByPlaceholderText('Add a goal');
    const scheduleInput = screen.getByPlaceholderText('Describe your current daily/weekly schedule');
    const addButtons = screen.getAllByText('Add');
    const addActivityButton = addButtons[0];
    const addGoalButton = addButtons[1];
    
    // Add activity
    await act(async () => {
      await userEvent.type(activityInput, 'Exercise');
      fireEvent.click(addActivityButton);
    });
    
    // Add goal
    await act(async () => {
      await userEvent.type(goalInput, 'Stay healthy');
      fireEvent.click(addGoalButton);
    });
    
    // Add schedule
    await act(async () => {
      await userEvent.type(scheduleInput, 'Morning exercise');
    });
    
    // Analyze
    const analyzeButton = screen.getByText('Analyze Life Balance');
    await act(async () => {
      fireEvent.click(analyzeButton);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to analyze life balance. Please try again.')).toBeInTheDocument();
    });
  });

  test('validates activity input', async () => {
    render(<LifeBalance />);
    
    const addButtons = screen.getAllByText('Add');
    const addActivityButton = addButtons[0];
    
    // Try to add empty activity
    await act(async () => {
      fireEvent.click(addActivityButton);
    });
    
    // Verify no activity was added
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  test('validates goal input', async () => {
    render(<LifeBalance />);
    
    const addButtons = screen.getAllByText('Add');
    const addGoalButton = addButtons[1];
    
    // Try to add empty goal
    await act(async () => {
      fireEvent.click(addGoalButton);
    });
    
    // Verify no goal was added
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
}); 