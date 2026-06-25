import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// ─── Refresh token interceptor ────────────────────────────────────────────────
//
// When any request gets a 401 (access token expired), this interceptor:
//   1. Calls POST /auth/refresh once (the refreshToken cookie is sent automatically)
//   2. On success: retries the original request with new cookies
//   3. On failure: the refresh token itself is invalid/expired → redirect to /login
//
// The `_retry` flag on the config prevents an infinite retry loop if /auth/refresh
// itself returns a 401 (e.g. refresh token is also expired).

let isRefreshing = false;
let refreshQueue: Array<{ resolve: () => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // Only intercept 401s that haven't already been retried, and not from /auth/* itself
    const isAuthRoute = originalRequest?.url?.includes('/auth/');
    if (error.response?.status !== 401 || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: () => resolve(api(originalRequest)),
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call /auth/refresh — the refreshToken cookie is sent automatically
      await api.post('/auth/refresh');
      processQueue(null);
      // Retry the original request — new access token cookie is now set
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      // Refresh token is invalid/expired → force user back to login
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;