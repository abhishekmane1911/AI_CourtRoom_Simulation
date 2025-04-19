import React, { useState } from 'react';
import { analyzeConversation, loadConversationFile } from '../utils/conversationAnalyzer';

const ConversationAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await loadConversationFile(file);
      const results = analyzeConversation(data);
      setAnalysis(results);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze file. Make sure it\'s a valid trial export.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <h1 className="text-2xl font-bold">Trial Conversation Analyzer</h1>
          <p className="mt-2 text-blue-100">Upload exported trial JSON files to analyze realism and relevance</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Trial Export File
            </label>
            <div className="flex">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className={`ml-4 px-4 py-2 rounded-md text-white font-medium ${
                  !file || loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </div>
          
          {analysis && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Analysis Results: {analysis.case_name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Basic Statistics</h3>
                  <p><span className="font-medium">Total Turns:</span> {analysis.total_turns}</p>
                  <p><span className="font-medium">Avg Response Length:</span> {Math.round(analysis.avg_response_length)} characters</p>
                  <p><span className="font-medium">Avg Prompt Length:</span> {Math.round(analysis.avg_prompt_length)} characters</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Role Distribution</h3>
                  <ul>
                    {Object.entries(analysis.role_distribution).map(([role, count]: [string, any]) => (
                      <li key={role}>
                        <span className="font-medium">{role}:</span> {count} turns ({Math.round(count/analysis.total_turns*100)}%)
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h3 className="font-medium text-gray-700 mb-2">Legal Terminology Usage</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(analysis.legal_term_usage).map(([term, count]: [string, any]) => (
                      <span key={term} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {term}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    const jsonStr = JSON.stringify(analysis, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `analysis_${analysis.case_name.replace(/\s+/g, '_')}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Export Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationAnalyzer;