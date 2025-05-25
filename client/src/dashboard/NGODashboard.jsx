import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../login/IsLoggedIn';
import React, { useEffect, useState } from 'react';
import axios from '../Axiosapi';
import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_API_URL}`);

const NGODashboard = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const ngoDetails = JSON.parse(localStorage.getItem('ngoDetails'));
        setIsActive(ngoDetails.isActive);

        const ngoId = localStorage.getItem('userId');
        axios.get(`/demand/ngo/${ngoId}`, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then((response) => {
                setDeliveries(response.data.demands);
            })
            .catch((error) => {
                console.error('Error fetching demands:', error);
                setError('Error loading assigned deliveries');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleModifyStatus = (itemId, newStatus) => {
        axios.patch(`/demand/${itemId}`, { status: newStatus }, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then((response) => {
                setDeliveries((prev) =>
                    prev.map((item) =>
                        item._id === itemId ? { ...item, status: newStatus } : item
                    )
                );
            })
            .catch((error) => {
                console.error('Error updating status:', error);
                alert('Failed to update status. Please try again.');
            });
    };

    const toggleActiveStatus = () => {
        const ngoDetails = JSON.parse(localStorage.getItem('ngoDetails'));
        const updatedDetails = {
            ...ngoDetails,
            isActive: !isActive
        };
        axios.patch(`/user/${localStorage.getItem('userId')}`, 
            { ngoDetails: updatedDetails }, 
            {
                headers: {
                    Authorization:'Bearer '+localStorage.getItem('token')
                }
            }
        )
            .then(() => {
                setIsActive(!isActive);
                localStorage.setItem('ngoDetails', JSON.stringify(updatedDetails));
            })
            .catch((err) => {
                console.error('Error toggling active status:', err);
                alert('Failed to update status. Please try again.');
            });
    };

    useEffect(() => {
        socket.on('demandUpdated', (updatedDemand) => {
            console.log('[NGO Dashboard] Received updated demand:', updatedDemand);
            setDeliveries(prevDeliveries => {
                const demandExists = prevDeliveries.some(item => item._id === updatedDemand._id);
                if (demandExists) {
                    return prevDeliveries.map(item =>
                        item._id === updatedDemand._id ? updatedDemand : item
                    );
                } else if (updatedDemand.ngoId === localStorage.getItem('userId')) {
                    return [...prevDeliveries, updatedDemand];
                }
                return prevDeliveries;
            });
        });

        return () => {
            socket.off('demandUpdated');
        };
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#575B33] mx-auto"></div>
                    <p className="mt-4 text-[#575B33]">Loading NGO dashboard...</p>
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
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-[#575B33] text-white rounded hover:bg-[#444826] transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="flex justify-between items-center px-6 mt-4">
                <h1 className="text-4xl font-bold text-[#575B33]">NGO Dashboard</h1>
                <button
                    onClick={toggleActiveStatus}
                    className={`px-4 py-2 rounded text-white font-semibold ${isActive ? 'bg-green-600' : 'bg-red-500'}`}
                >
                    {isActive ? 'Active' : 'Inactive'}
                </button>
            </div>

            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Assigned Deliveries</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-sm">
                                    <th className="pb-2">Item</th>
                                    <th className="pb-2">Description</th>
                                    <th className="pb-2">Quantity</th>
                                    <th className="pb-2">Location</th>
                                    <th className="pb-2">Contact</th>
                                    <th className="pb-2">User</th>
                                    <th className="pb-2">Status</th>
                                    <th className="pb-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {deliveries.map((item, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="py-2 font-medium text-[#575B33]">{item.itemname}</td>
                                        <td className="py-2">{item.description}</td>
                                        <td className="py-2">{item.quantity}</td>
                                        <td className="py-2">{item.location}</td>
                                        <td className="py-2">{item.contact}</td>
                                        <td className="py-2">{item.username}</td>
                                        <td className="py-2">
                                            <span className={`text-white px-2 py-1 rounded-full text-xs ${item.status === 'pending' ? 'bg-red-500' :
                                                item.status === 'resolved' ? 'bg-green-500' :
                                                    item.status === 'in-process' ? 'bg-amber-400' : 'bg-gray-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <select
                                                onChange={(e) => handleModifyStatus(item._id, e.target.value)}
                                                defaultValue=""
                                                className="text-xs border border-gray-300 rounded px-2 py-1 text-[#575B33]"
                                            >
                                                <option value="" disabled>Update</option>
                                                <option value="in-process">In Process</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {deliveries.length === 0 && (
                            <p className="text-gray-500 text-sm mt-4">No assigned deliveries</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NGODashboard;