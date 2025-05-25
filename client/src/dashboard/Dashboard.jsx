import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../login/IsLoggedIn';
import React, { useEffect, useState } from 'react';
import axios from '../Axiosapi';
import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_API_URL}`);

const Dashboard = () => {
    const navigate = useNavigate();
    const [deliveries, setDeliveries] = useState([]);
    const [ngoUsers, setNgoUsers] = useState([]);
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

        axios.get('user/ngo', {
            headers: {
                Authorization:'Bearer '+localStorage.getItem('token')
            }
        })
            .then((response) => {
                setNgoUsers(response.data.ngos);
            })
            .catch((error) => {
                console.error('Error fetching NGO users:', error);
                setError('Error loading NGO data');
            });

        axios.get('/demand', {
            headers: {
                Authorization:'Bearer '+localStorage.getItem('token')
            }
        })
            .then((response) => {
                const unresolvedDemands = response.data.demands.filter(
                    demand => demand.status !== 'resolved'
                );
                console.log('Demand Data:', response.data);
                setDeliveries(unresolvedDemands);
            })
            .catch((error) => {
                console.error('Error fetching demand data:', error);
                setError('Error loading demand data');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleModifyStatus = (itemId, newStatus) => {
        axios.patch(`/demand/${itemId}`, { status: newStatus }, {
            headers: {
                Authorization:'Bearer '+localStorage.getItem('token')
            }
        })
            .then((response) => {
                console.log(`Status updated for item ${itemId}:`, response.data);
                setDeliveries((prevDeliveries) =>
                    prevDeliveries.map((item) =>
                        item._id === itemId ? { ...item, status: newStatus } : item
                    )
                );
            })
            .catch((error) => {
                console.error(`Error updating status for item ${itemId}:`, error);
                alert('Failed to update status. Please try again.');
            });
    };

    const handleAssignNGO = (itemId, ngoId) => {
        const selectedNGO = ngoUsers.find(ngo => ngo._id === ngoId);
        console.log(`[dashboard] Selected NGO:`, selectedNGO);
        if (!selectedNGO) {
            console.error('Selected NGO not found');
            return;
        }

        //setting demand id to the ngo
        axios.patch(`/user/${selectedNGO._id}`, {
            ngoDetails: {
                ...selectedNGO.ngoDetails,
                assignedDemands: [...(selectedNGO.ngoDetails.assignedDemands || []), itemId]
            }
        }, {
            headers: {
                Authorization:'Bearer '+localStorage.getItem('token')
            }
        }).then((response) => {
            console.log(`[ngo patch] Delivery assigned to NGO ${selectedNGO.username}:`, response.data);
            setDeliveries((prevDeliveries) =>
                prevDeliveries.map((item) =>
                    item._id === itemId ? { ...item, assignedTo: selectedNGO.username } : item
                )
            );
        }).catch((error) => {
            console.error(`Error assigning delivery to NGO:`, error);
            alert('Failed to assign NGO. Please try again.');
        });

        //setting ngoId to the demand
        axios.patch(`/demand/${itemId}`, {
            ngoId: selectedNGO._id
        }, {
            headers: {
                Authorization:'Bearer '+localStorage.getItem('token')
            }
        }).then((response) => {
            console.log(`[demand patch] Delivery assigned to NGO ${selectedNGO.username}:`, response.data);
        }).catch((error) => {
            console.error(`Error assigning delivery to NGO:`, error);
        });
    };

    useEffect(() => {
        socket.on('demandCreated', (demand) => {
            setDeliveries((prevDeliveries) => [...prevDeliveries, demand]);
        });
        socket.on('demandUpdated', (updatedDemand) => {
            setDeliveries((prevDeliveries) => 
                prevDeliveries.map(item => item._id === updatedDemand._id ? updatedDemand : item)
            );
        });
        return () => {
            socket.off('demandCreated');
            socket.off('demandUpdated');
        };
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#575B33] mx-auto"></div>
                    <p className="mt-4 text-[#575B33]">Loading dashboard data...</p>
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

    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const inProcess = deliveries.filter(d => d.status === 'in-process').length;

    return (
        <div className="dashboard">
            <h1 className="text-4xl font-bold text-[#575B33] ml-6 mt-2 mb-0">Dashboard</h1>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-semibold text-[#575B33]">{total}</h2>
                    <p className="text-[#575B33]">Total Active Deliveries</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-semibold text-[#575B33]">{pending}</h2>
                    <p className="text-[#575B33]">Pending</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-4">
                    <h2 className="text-xl font-semibold text-[#575B33]">{inProcess}</h2>
                    <p className="text-[#575B33]">In Process</p>
                </div>
            </div>

            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
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
                                    <th className="pb-2">Assigned To</th>
                                    <th className="pb-2">Actions</th>
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
                                                    item.status === 'in-process' ? 'bg-amber-400' :
                                                        'bg-gray-400'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            {item.ngoId ? (
                                                <span className="text-[#575B33]">{ngoUsers.find(ngo => ngo._id === item.ngoId)?.username}</span>
                                            ) : (
                                                <select
                                                    onChange={(e) => {
                                                        const ngoUsername = e.target.value;
                                                        if (ngoUsername) {
                                                            const selectedNGO = ngoUsers.find(ngo => ngo.username === ngoUsername);
                                                            handleAssignNGO(item._id, selectedNGO._id);
                                                        }
                                                    }}
                                                    defaultValue=""
                                                    className="text-xs border border-gray-300 rounded px-2 py-1 text-[#575B33]"
                                                >
                                                    <option value="" disabled>Assign NGO</option>
                                                    {ngoUsers.map((ngo) => (
                                                        <option key={ngo._id} value={ngo.username}>
                                                            {ngo.name} ({ngo.username})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </td>
                                        <td className="py-2">
                                            <select
                                                onChange={(e) => {
                                                    const newStatus = e.target.value;
                                                    handleModifyStatus(item._id, newStatus);
                                                }}
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
                            <p className="text-gray-500 text-sm mt-4">No active deliveries available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
