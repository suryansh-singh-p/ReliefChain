import Logo from './media/logo.png';
import { isLoggedIn } from '../login/IsLoggedIn';
import {Link} from 'react-router-dom';

const Navbar = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('usertype');
        window.location.href = '/login'; // Redirect to login page after logout
    };
    return (
        <div className="h-16"> {/* Add height to prevent content jump */}
            <nav className="bg-[#575B33] p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 shadow-lg">
                <div className="text-white text-2xl font-bold">
                    <img src={Logo} alt="Logo" className="h-10 w-10 inline-block mr-2" />
                </div>

                <div className="flex space-x-4">
                    {localStorage.getItem("username") ? (
                        <>
                            <Link to="/dashboard" className="text-white hover:text-[#A6A886]">Dashboard</Link>
                            <Link to="/map" className="text-white hover:text-[#A6A886]">Map</Link>
                            {/* <Link to="/services" className="text-white hover:text-[#A6A886]">Services</Link> */}
                            <button onClick={handleLogout} className="text-white hover:text-[#A6A886]">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-[#A6A886]">Login</Link>
                            <Link to="/signup" className="text-white hover:text-[#A6A886]">Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}
export default Navbar;