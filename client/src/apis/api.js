import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/actions/authActions";
import { navigateTo } from "../utils/navigation";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { user } = store.getState().auth;

    if (error.response?.status === 401 && user ) {
      
      store.dispatch(logout());

      navigateTo("/login");
    }

    return Promise.reject(error);
  }
);

export default api;