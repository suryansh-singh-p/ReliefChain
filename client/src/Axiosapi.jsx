import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();
const baseURL = process.env.REACT_APP_API_URL; // Adjust the port as needed

export default axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

