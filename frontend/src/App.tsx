// App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const CaseList = lazy(() => import('./components/CaseList'));
const NewCase = lazy(() => import('./components/NewCase'));
const Trial = lazy(() => import('./components/Trial'));
const Navbar = lazy(() => import('./components/Navbar'));

// Add this import
import ConversationAnalyzer from './components/ConversationAnalyzer';

const App: React.FC = () => {
  return (
    <Router>
        <Navbar />
          <Suspense fallback={<div className="text-center text-lg">Loading...</div>}>
            <Routes>
              <Route path="/" element={<ErrorBoundary><CaseList /></ErrorBoundary>} />
              <Route path="/new-case" element={<ErrorBoundary><NewCase /></ErrorBoundary>} />
              <Route path="/trial/:caseName" element={<ErrorBoundary><Trial /></ErrorBoundary>} />
              <Route path="/analyze" element={<ConversationAnalyzer />} />
            </Routes>
          </Suspense>
    </Router>
  );
};

export default App;