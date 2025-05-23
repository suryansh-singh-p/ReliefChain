import React, { useState } from 'react';
import backImg from './media/login-background.png';
import backImgMobile from './media/portrait.png';
import axios from '../Axiosapi';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        userType: '',
        ngoDetails: {
            isActive: false,
            location: {
                lat: 0,
                lng: 0
            }
        }
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    ngoDetails: {
                        ...prev.ngoDetails,
                        location: {
                            lat: latitude,
                            lng: longitude
                        }
                    }
                }));
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location');
            }
        );
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        axios.post('/user/signup', formData)
        .then(response => {
            console.log('Response:', response.data);
            navigate('/login');
        }).catch(error => { 
            console.log('Error:', error);
        });
    };

    return (
        <div className="flex w-full h-screen relative">
            {/* Background */}
            <div className="absolute inset-0 z-[-1]">
                <img src={backImg} className="hidden md:flex w-full h-full object-cover transition-opacity duration-1000 ease-in-out" alt="Background" />
                <img src={backImgMobile} className="flex md:hidden w-full h-full object-cover transition-opacity duration-1000 ease-in-out" alt="Background" />
            </div>

            {/* Signup Form */}
            <div className="w-full flex items-center justify-center">
                <div className='hidden md:flex w-1/2' />
                <div className='w-full max-w-md p-8 shadow-2xl rounded-xl bg-white/65'>
                    <h2 className="text-3xl font-semibold text-[#575B33] mb-6 text-center">Sign Up</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">User Type</label>
                            <select
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            >
                                <option value="">Select User Type</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                                <option value="ngo">NGO Admin</option>
                            </select>
                        </div>

                        {/* NGO Location Fields - Only show when NGO is selected */}
                        {formData.userType === 'ngo' && (
                            <div className="space-y-4 pt-4 border-t border-[#A6A886]">
                                <h3 className="text-lg font-medium text-[#575B33]">NGO Location</h3>
                                <div>
                                    <label className="block text-sm font-medium text-[#575B33]">Latitude</label>
                                    <input
                                        type="number"
                                        value={formData.ngoDetails.location.lat}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            ngoDetails: {
                                                ...prev.ngoDetails,
                                                location: {
                                                    ...prev.ngoDetails.location,
                                                    lat: parseFloat(e.target.value)
                                                }
                                            }
                                        }))}
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#575B33]">Longitude</label>
                                    <input
                                        type="number"
                                        value={formData.ngoDetails.location.lng}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            ngoDetails: {
                                                ...prev.ngoDetails,
                                                location: {
                                                    ...prev.ngoDetails.location,
                                                    lng: parseFloat(e.target.value)
                                                }
                                            }
                                        }))}
                                        required
                                        className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleUseMyLocation}
                                    className="w-full bg-[#6F723C] text-white px-4 py-2 rounded-md hover:bg-[#575B33] transition"
                                >
                                    Use My Location
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="submit"
                                className="bg-[#575B33] text-white px-5 py-2 rounded-lg hover:bg-[#444826] transition-all"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
