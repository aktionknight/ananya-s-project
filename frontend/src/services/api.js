import axios from "axios";

const API = axios.create({
  baseURL: "https://finance-tracker-backend-65kf.onrender.com",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN BEING SENT:", token); // add this temporarily

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
