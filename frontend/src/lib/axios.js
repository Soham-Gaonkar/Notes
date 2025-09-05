import axios from "axios";

// we create a custom axios instance
// so that we can easily make API calls with a predefined base URL
const api = axios.create({
    baseURL: "http://localhost:5001/api"
})

export default api;