import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Важно для работы с куками
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
interface FailedRequest {
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Функция для проверки, находимся ли мы на странице логина
const isLoginPage = () => {
  return window.location.pathname === '/login';
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    // Не делать refresh для login, register, refresh
    const isAuthRequest = ['/auth/login', '/auth/register', '/auth/refresh'].some(path =>
      originalRequest.url?.includes(path)
    );
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      return new Promise(async (resolve, reject) => {
        try {
          await api.post('/auth/refresh');
          processQueue(null);
          resolve(api(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError);
          if (!isLoginPage()) {
            window.location.href = '/login';
          }
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api; 