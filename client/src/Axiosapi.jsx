import axios from "axios";
const port = 3000;
const baseURL = `http://localhost:${port}`; // Adjust the port as needed

export default axios.create({
    baseURL: baseURL,
});