import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNewCase } from '../api';

const NewCase: React.FC = () => {
  const [caseName, setCaseName] = useState<string>('');
  const [caseData, setCaseData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createNewCase({
        case_name: caseName,
        case_data: caseData,
      });

      navigate(`/trial/${response.case_name}`);
    } catch (error) {
      console.error('Error starting trial:', error);
      alert('Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen bg-gray-100 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg border border-gray-100 ">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Start New Trial</h1>
          <p className="text-gray-600 mt-2">Enter case details to begin a new court proceeding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label htmlFor="caseName" className="block text-bl text-lg font-medium text-gray-700 mb-2">Case Name</label>
            <input
              id="caseName"
              type="text"
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              placeholder="e.g., Smith v. Johnson"
              required
            />
            <p className="text-sm text-gray-500 mt-2">This will be the official title of your court case.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label htmlFor="caseData" className="block text-lg font-medium text-gray-700 mb-2">Case Details</label>
            <p className="text-sm text-gray-500 mb-4">Include all relevant information about the case, including facts, allegations, and evidence.</p>

            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-700">Case Brief</span>
                <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setCaseData('')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <textarea
                id="caseData"
                rows={12}
                className="text-black w-full p-4 focus:outline-none focus:ring-0 border-0"
                value={caseData}
                onChange={(e) => setCaseData(e.target.value)}
                placeholder="Describe the case in detail..."
                required
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Suggested information to include:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Names and backgrounds of all parties involved</li>
                <li>Timeline of events leading to the case</li>
                <li>Key evidence and witness statements</li>
                <li>Legal claims and counterclaims</li>
                <li>Desired outcomes or remedies sought</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between items-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              All case information will be processed by our AI legal system.
            </p>
            <div className="flex space-x-4">
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initializing Trial...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Start Trial
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCase;