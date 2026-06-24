import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  // Generous timeout: the free host "sleeps" when idle and can take
  // ~50s to wake up on the first request.
  timeout: 90000,
});

export default axiosClient;
