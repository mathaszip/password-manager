import axios, { AxiosResponse } from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const register = (
  email: string,
  password: string
): Promise<AxiosResponse> => {
  return api.post("/auth/register", { email, password });
};

export const login = (
  email: string,
  password: string
): Promise<AxiosResponse> => {
  return api.post("/auth/login", { email, password });
};

// Passwords API
export const getPasswords = (): Promise<AxiosResponse> => {
  return api.get("/passwords");
};

export const addPassword = (passwordData: any): Promise<AxiosResponse> => {
  return api.post("/passwords", passwordData);
};

export const updatePassword = (
  id: number,
  passwordData: any
): Promise<AxiosResponse> => {
  return api.put(`/passwords/${id}`, passwordData);
};

export const deletePassword = (id: number): Promise<AxiosResponse> => {
  return api.delete(`/passwords/${id}`);
};

// Testimonials API
export const getTestimonials = (): Promise<AxiosResponse> => {
  return api.get("/testimonials");
};

export const addTestimonial = (
  testimonialData: any
): Promise<AxiosResponse> => {
  return api.post("/testimonials", testimonialData);
};

export const deleteTestimonial = (id: number): Promise<AxiosResponse> => {
  return api.delete(`/testimonials/${id}`);
};

export default api;
