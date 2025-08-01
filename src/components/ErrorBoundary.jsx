import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error('Route error:', error);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
        <div className="text-xl text-gray-700 mb-6">
          Something went wrong.
        </div>
        <p className="text-gray-600 mb-8">
          {error?.message || 'An unexpected error occurred'}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary; 