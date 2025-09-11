import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import backImg from './media/login-background.png';
import backImgMobile from './media/portrait.png';
import axios from '../Axiosapi';
import { useNavigate } from 'react-router-dom';


const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        userType: "select",
        ngoDetails: {
            isActive: false,
            location: {
                lat: 0,
                lng: 0
            }
        }
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, password, userType } = formData;
        if (!username || !password || userType === 'select') {
            alert('Please fill all fields');
            return;
        }
        axios.post('/user/login', formData)
            .then(res => {
                console.log('Response:', res.data);
                const token = res.data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', res.data.user._id);
                localStorage.setItem('username', res.data.user.username);
                localStorage.setItem('userType', res.data.user.userType);
                localStorage.setItem('ngoDetails', JSON.stringify(res.data.user.ngoDetails));
                console.log('Login Successful)');  
                navigate('/dashboard');     
            }).catch(err => {
                if (err.response && err.response.data) {
                    const { message } = err.response.data;
                    alert(message);
                } else {
                    alert('An error occurred. Please try again.');
                }
            });
    }

    return (
        <div className="flex w-full h-screen">
            <div className="absolute inset-0 z-[-1]">
                <img src={backImg} className="hidden md:flex w-full h-full object-cover transition-opacity duration-5000 ease-in-out opacity-100" alt="Background" />
                <img src={backImgMobile} className="flex md:hidden w-full h-full object-cover transition-opacity duration-5000 ease-in-out opacity-100" alt="Background" />
            </div>

            <div className=" w-full flex  items-center justify-center">
                <div className='hidden md:flex w-1/2'> </div>
                <div className='w-full max-w-md p-8 shadow-2xl rounded-xl bg-white/65'>


                    <h2 className="text-3xl font-semibold text-[#575B33] mb-6 text-center">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            />
                        </div>

                        {/* User Type */}
                        <div>
                            <label className="block text-sm font-medium text-[#575B33]">User Type</label>
                            <select
                                name="usertype"
                                value={formData.userType}
                                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                                required
                                className="mt-1 w-full px-4 py-2 border border-[#A6A886] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#575B33]"
                            >
                                <option value="select">Select User Type</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                                <option value="ngo">NGO Admin</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="submit"
                                className="bg-[#575B33] text-white px-5 py-2 rounded-lg hover:bg-[#444826] transition-all"
                            >
                                Login
                            </button>
                            <Link to="/signup">
                                <button
                                    type="button"
                                    className="text-[#575B33] hover:underline"
                                    onClick={() => alert('Redirecting to Signup')}
                                >
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    </form>
                </div>

            </div>

        </div>




    );
}
export default Login;