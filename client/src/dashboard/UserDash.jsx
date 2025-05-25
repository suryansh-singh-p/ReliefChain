// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from '../Axiosapi';
import { io } from 'socket.io-client';

const socket = io(`${import.meta.env.VITE_API_URL}`);

const UserDashboard = () => {
  const username = localStorage.getItem('username');
  const [formData, setFormData] = useState({
    itemname: '',
    quantity: '',
    location: '',
    contact: '',
    description: '',
    username: localStorage.getItem('username'),
    ngoId: '',
    status: 'pending',
  });

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    axios.get(`/demand/user/${username}`, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then(res => {
        console.log('Fetched requests:', res.data.demands);
        setRequests(res.data.demands);
      })
      .catch(err => {
        console.error('Error fetching requests:', err);
        setError('Error loading your requests');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = `${latitude}, ${longitude}`;
        setFormData(prev => ({ ...prev, location: loc }));
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    axios.post('/demand', formData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
      .then(res => {
        alert('Request submitted successfully');
        setRequests(prev => [...prev, res.data.demand]);
        setFormData({
          itemname: '',
          quantity: '',
          location: '',
          contact: '',
          description: '',
          username: localStorage.getItem('username') || '',
          ngoId: localStorage.getItem('ngoId') || '',
          status: 'pending',
        });
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Error submitting request. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    socket.on('demandUpdated', (updatedDemand) => {
      setRequests(prev => prev.map(item => item._id === updatedDemand._id ? updatedDemand : item));
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
          <p className="mt-4 text-[#575B33]">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-[#F5F6E7] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#3F4228] mb-10">
          Welcome, <span className="text-[#6F723C]">{localStorage.getItem('username')}</span>
        </h1>

        {/* Demand Aid Form */}
        <div className="bg-white shadow-lg rounded-xl p-8 mb-12 border border-[#e5e7eb]">
          <h2 className="text-2xl font-semibold text-[#575B33] mb-6">Submit Aid Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4B4E2F]">Item Name</label>
              <input
                type="text"
                name="itemname"
                value={formData.itemname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#D2D3C3] focus:ring-[#6F723C] focus:border-[#6F723C] transition"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4B4E2F]">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#D2D3C3] focus:ring-[#6F723C] focus:border-[#6F723C] transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-[#4B4E2F]">Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-[#D2D3C3] focus:ring-[#6F723C] focus:border-[#6F723C]"
                />
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="bg-[#6F723C] text-white px-4 py-2 rounded-md hover:bg-[#575B33] transition"
                >
                  Use My Location
                </button>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4B4E2F]">Contact Number</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-md border border-[#D2D3C3] focus:ring-[#6F723C] focus:border-[#6F723C]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 text-sm font-medium text-[#4B4E2F]">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-[#D2D3C3] focus:ring-[#6F723C] focus:border-[#6F723C]"
                placeholder="Additional details..."
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-[#575B33] text-white py-2 rounded-md hover:bg-[#444826] transition font-semibold text-lg ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Submitted Requests Table */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-[#e5e7eb]">
          <h2 className="text-2xl font-semibold text-[#575B33] mb-6">Your Submitted Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-[#f7f7f0] text-[#575B33]">
                <tr>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Contact</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {requests.length > 0 ? (
                  requests.map((req, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{req.itemname}</td>
                      <td className="px-4 py-2">{req.quantity}</td>
                      <td className="px-4 py-2">{req.location}</td>
                      <td className="px-4 py-2">{req.contact}</td>
                      <td className="px-4 py-2">{req.description}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-white text-xs ${
                          req.status === 'resolved' ? 'bg-green-600' : 'bg-yellow-500'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
