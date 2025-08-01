import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const Checkout = () => {
  return (
    <div className="min-h-screen pt-24 bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary-100 text-primary-600 mb-8">
          <Clock className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Coming Soon!
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Our checkout page is currently under construction. We're working hard to bring you a seamless and secure checkout experience.
        </p>
        <Link
          to="/collections"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Checkout; 