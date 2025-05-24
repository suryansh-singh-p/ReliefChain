import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL; // Adjust the port as needed

export default axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

