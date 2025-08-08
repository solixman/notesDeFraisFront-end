import axios from "axios"

// Create an Axios instance with a base URL and default headers
const instance = axios.create({
  baseURL: "http://localhost:8000", // IMPORTANT: Adjust this to your Laravel backend URL
  headers: {
    "Content-Type": "application/json", // Default content type for requests
    Accept: "application/json", // Request JSON responses
  },
})

/**
 * Request Interceptor:
 * Intercepts outgoing requests to add the Authorization header if a token exists in local storage.
 */
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  console.log('Axios request interceptor: Checking for token. Token exists?', !!token)
  if (token) {
    // Set the Authorization header with the Bearer token
    config.headers.Authorization = `Bearer ${token}`
    console.log('Axios request interceptor: Authorization header set.')
  }
  return config // Return the modified config
})

/**
 * Response Interceptor:
 * Intercepts incoming responses to handle global errors, especially 401 Unauthorized.
 */
instance.interceptors.response.use(
  (response) => {
    console.log('Axios response interceptor: Success response received.', response.status, response.config.url)
    return response // Return successful responses as is
  },
  (error) => {
    console.error("Axios response interceptor: Error response received.", error.response?.status, error.response?.data)
    console.error("Axios response interceptor: Error URL:", error.config?.url)

    // Handle 401 Unauthorized errors: clear auth data and redirect to login
    if (error.response?.status === 401) {
      console.log("Axios response interceptor: 401 Unauthorized error detected. Clearing authentication data and redirecting to login.")
      // Clear authentication data from local storage
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error) // Propagate the error for specific component handling
  },
)

export default instance // Export the configured Axios instance
