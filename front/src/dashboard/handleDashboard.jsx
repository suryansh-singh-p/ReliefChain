import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import NGODashboard from './NGODashboard';
import UserDash from './UserDash';

const HandleDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        // Check user type
        const userType = localStorage.getItem('userType');
        if (!userType) {
            setError('User type not found');
        }
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#575B33] mx-auto"></div>
                    <p className="mt-4 text-[#575B33]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.href = '/login'} 
                        className="mt-4 px-4 py-2 bg-[#575B33] text-white rounded hover:bg-[#444826] transition"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {localStorage.getItem('userType') === 'ngo' && <NGODashboard />}
            {localStorage.getItem('userType') === 'user' && <UserDash />}
            {localStorage.getItem('userType') === 'admin' && <Dashboard />}
        </div>
    );
};

export default HandleDashboard;