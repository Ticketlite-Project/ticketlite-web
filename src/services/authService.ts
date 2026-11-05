import axios from "axios";

// Create a reusable Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Registration request interface
export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
}

// Login request interface
export interface LoginData {
  username: string;
  password: string;
}

// Register user
export const registerUser = async (data: RegisterData) => {
  const response = await api.post("/auth/register/", data);
  return response.data;
};

// Login user
export const loginUser = async (data: LoginData) => {
  const response = await api.post("/auth/login/", data);
  return response.data;
};

export default api;