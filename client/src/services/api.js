import axios from "axios";


const api = axios.create({
  baseURL: "https://applicationbudget.onrender.com/api",
});

// =====================================================
// REQUEST INTERCEPTOR
// Trimite automat JWT-ul la fiecare request
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// Token expirat sau invalid
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      // Ștergem sesiunea locală
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Evităm redirect inutil dacă suntem
      // deja pe pagina de login
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;