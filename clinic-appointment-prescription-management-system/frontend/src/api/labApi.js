import axios from "axios";

const labApi = axios.create({
  baseURL: "http://localhost:5000/api/lab-inventory",
  headers: { "Content-Type": "application/json" }
});

export default labApi;
