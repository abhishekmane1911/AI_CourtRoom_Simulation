import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-white text-2xl font-bold tracking-tight">Cyn Court</span>
          </Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 text-white">
            <Link 
              to="/" 
              className={`font-medium hover:text-black transition duration-150  ${isActive('/') ? 'border-b-2 border-white' : ''}`}
            >
              Cases
            </Link>
            <Link 
              to="/new-case" 
              className={`font-medium hover:text-black transition duration-150  ${isActive('/new-case') ? 'border-b-2 border-white' : ''}`}
            >
              New Case
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 space-y-2">
            <Link 
              to="/" 
              className={`block py-2 px-4 text-white font-medium hover:bg-blue-600 rounded ${isActive('/') ? 'bg-blue-600' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Cases
            </Link>
            <Link 
              to="/new-case" 
              className={`block py-2 px-4 text-white font-medium hover:bg-blue-600 rounded ${isActive('/new-case') ? 'bg-blue-600' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              New Case
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;