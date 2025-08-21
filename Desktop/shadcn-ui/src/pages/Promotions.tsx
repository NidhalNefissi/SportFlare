import React from 'react';

const Promotions: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Promotions</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your current and upcoming promotions
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">No promotions yet</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create your first promotion to get started
          </p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {}}
          >
            Create Promotion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
