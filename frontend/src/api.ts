import axios from 'axios';

// Types
export interface CaseLog {
  role: string;
  message: string;
  response: string;
  timestamp: string;
}

export interface Case {
  id: number;
  name: string;
  created_at: string;
}

export interface AgentMessageRequest {
  role: string;
  message: string;
  history: Array<{ role: string; content: string }>;
  case: string;
}

export interface AgentMessageResponse {
  reply: string;
}

export interface NewCaseRequest {
  case_name: string;
  case_data: string;
}

export interface NewCaseResponse {
  case_id: number;
  case_name: string;
  initial_statement: string;
}

// Set the base URL for axios
const API = axios.create({ baseURL: 'http://localhost:8000/api/courtroom' });

// API functions
export const fetchCaseLogs = async (caseName: string): Promise<CaseLog[]> => {
  try {
    const response = await API.get(`/logs/?case=${caseName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching case logs:', error);
    return []; // Return an empty array on error
  }
};

export const sendAgentMessage = async (data: AgentMessageRequest): Promise<AgentMessageResponse> => {
  try {
    const response = await API.post('/agent/', data);
    return response.data;
  } catch (error) {
    console.error('Error sending agent message:', error);
    throw error; // Rethrow the error for handling in the component
  }
};

// Fetch cases with error handling
export const fetchCases = async (): Promise<Case[]> => {
  try {
    const response = await API.get('/cases/');
    
    // Check if the response is valid JSON
    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      console.error('Received HTML instead of JSON:', response.data);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cases:', error);
    return []; // Return empty array instead of throwing to prevent component crashes
  }
};

export const createNewCase = async (data: NewCaseRequest): Promise<NewCaseResponse> => {
  try {
    const response = await API.post('/cases/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating new case:', error);
    throw error; // Rethrow the error for handling in the component
  }
};
