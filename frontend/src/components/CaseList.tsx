import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCases } from '../api';

const CaseList: React.FC = () => {
  const [cases, setCases] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        const response = await fetchCases();
        
        // Ensure cases is an array before setting state
        if (Array.isArray(response)) {
          setCases(response);
        } else {
          console.error('Expected array but got:', response);
          setCases([]);
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Failed to load cases. Please try again later.');
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg border border-red-100 mx-10">
        <div className="flex items-center text-red-600 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold">Error Loading Cases</h2>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button 
          className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md flex items-center"
          onClick={() => window.location.reload()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full h-hull">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <h2 className="text-2xl font-bold">Court Cases</h2>
            </div>
            <Link 
              to="/new-case" 
              className="px-5 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Case
            </Link>
          </div>
          <p className="mt-2 text-blue-100">Manage and access your ongoing court proceedings</p>
        </div>
        
        {cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg mb-2">No cases found</p>
            <p className="text-sm text-center max-w-md">Start a new trial to create your first court case and begin the proceedings.</p>
            <Link 
              to="/new-case" 
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Your First Case
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Array.isArray(cases) && cases.map((caseItem) => (
              <Link 
                key={caseItem.id}
                to={`/trial/${encodeURIComponent(caseItem.name)}`}
                className="block hover:bg-blue-50 transition-colors duration-150"
              >
                <div className="p-6 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-lg text-gray-900 mb-1">{caseItem.name}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created: {new Date(caseItem.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {caseItem.status && (
                      <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        caseItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {caseItem.status === 'active' ? 'Active' : 'Closed'}
                      </div>
                    )}
                    {caseItem.current_phase && (
                      <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                        {caseItem.current_phase.charAt(0).toUpperCase() + caseItem.current_phase.slice(1)} Phase
                      </div>
                    )}
                  </div>
                  <div className="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;
