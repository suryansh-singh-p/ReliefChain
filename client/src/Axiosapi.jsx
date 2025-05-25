import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
console.log(baseURL);

const instance = axios.create({
    baseURL: baseURL,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
});

export default instance;

