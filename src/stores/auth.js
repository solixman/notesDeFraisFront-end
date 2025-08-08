import { defineStore } from "pinia"
import { ref, computed } from "vue"
import axios from "../utils/axios"

/**
 * Normalizes a given role string to a consistent lowercase format.
 * This handles various casing and language variations (e.g., "Admin", "ADMINISTRATEUR", "Employé").
 * @param {string} role - The role string to normalize.
 * @returns {string} The normalized role string (e.g., "admin", "employe"). Defaults to "employe" if invalid.
 */
const normalizeRole = (role) => {
  // If role is null, undefined, or not a string, default to 'employe'
  if (!role || typeof role !== 'string') {
    console.log('Auth: Invalid or missing role, defaulting to employe:', role)
    return 'employe'
  }
  
  // Convert the role to lowercase and remove leading/trailing whitespace
  const cleanRole = role.toLowerCase().trim()
  
  // Map of various role inputs to their normalized internal values
  const roleMap = {
    'employé': 'employe',
    'employe': 'employe',
    'employee': 'employe',
    'manager': 'manager',
    'comptable': 'comptable',
    'accountant': 'comptable', // English equivalent for comptable
    'admin': 'admin',
    'administrator': 'admin', // English equivalent for admin
    'administrateur': 'admin' // French equivalent for admin
    // Add more variations if needed, e.g., 'MANAGER', 'COMPTABLE', 'ADMIN'
    // The .toLowerCase() already handles these, but explicit mapping can be useful for clarity
  }
  
  // Return the normalized role from the map, or 'employe' if not found
  const normalizedRole = roleMap[cleanRole] || 'employe'
  console.log('Auth: Role normalized from', role, 'to', normalizedRole)
  return normalizedRole
}

// Define the Pinia authentication store
export const useAuthStore = defineStore("auth", () => {
  // Reactive state variables
  const user = ref(null) // Stores authenticated user data
  const token = ref(localStorage.getItem("auth_token")) // Stores JWT token from local storage

  // Computed property to check if the user is authenticated
  const isAuthenticated = computed(() => {
    const authenticated = !!(token.value && user.value)
    console.log("useAuth: isAuthenticated computed:", authenticated)
    return authenticated
  })

  /**
   * Initializes authentication state by checking local storage for token and user data.
   * Fetches fresh user data from API if token exists but user data is missing or invalid.
   */
  const initializeAuth = async () => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("user_data")
    
    console.log("useAuth: Initial token from localStorage:", storedToken ? "Exists" : "None")
    console.log("useAuth: Initial user from localStorage:", storedUser ? "Exists" : "None")

    if (storedToken) {
      token.value = storedToken
      
      // Try to use stored user data first to avoid an extra API call
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          if (userData && userData.id) {
            // Normalize the role before setting it
            userData.role = normalizeRole(userData.role)
            user.value = userData
            console.log("useAuth: Using stored user data with normalized role:", userData)
            return // Exit if stored user data is valid
          }
        } catch (e) {
          console.error("useAuth: Error parsing stored user data:", e)
          // If parsing fails, proceed to fetch fresh data
        }
      }
      
      // Fetch fresh user data if no token or stored data is invalid/missing
      try {
        console.log("useAuth: Fetching fresh user data from API")
        const response = await axios.get("/api/user")
        console.log("useAuth: API response for user data:", response.data)

        const userData = response.data

        if (userData && userData.id) {
          // Normalize the role before setting it
          userData.role = normalizeRole(userData.role)
          user.value = userData
          localStorage.setItem("user_data", JSON.stringify(userData)) // Update local storage
          console.log("useAuth: User set from API with normalized role:", userData)
        } else {
          console.log("useAuth: No valid user data from API, logging out.")
          logout() // Log out if API returns no valid user
        }
      } catch (error) {
        console.error("useAuth: Error fetching user from API:", error)
        console.error("useAuth: API Error details:", error.response?.data)
        logout() // Log out on API error
      }
    } else {
      console.log("useAuth: No token found, user remains null.")
    }
  }

  /**
   * Handles user login.
   * @param {object} credentials - Object containing email and password.
   * @returns {object} An object indicating success or failure with a message.
   */
  const login = async (credentials) => {
    try {
      console.log('Auth Store: Attempting login with:', credentials.email)
      
      // Send login request to backend
      const response = await axios.post("/api/login", {
        email: credentials.email,
        mot_de_passe: credentials.password, // Ensure this matches your Laravel backend's expected field
      })

      console.log('Auth Store: Login response:', response.data)

      // Validate if a token is received
      if (!response.data.token) {
        throw new Error('No token received from server.')
      }

      // Clean the token (remove 'Bearer ' prefix if present)
      let cleanToken = response.data.token
      if (cleanToken.startsWith('Bearer ')) {
        cleanToken = cleanToken.substring(7)
      }

      console.log('Auth Store: Setting token:', cleanToken)
      token.value = cleanToken
      localStorage.setItem("auth_token", cleanToken) // Store token in local storage

      // User data is expected in the login response
      if (response.data.user) {
        console.log('Auth Store: Setting user from login response:', response.data.user)
        
        // Normalize the role before setting user data
        const userData = { ...response.data.user }
        userData.role = normalizeRole(userData.role)
        
        user.value = userData
        localStorage.setItem("user_data", JSON.stringify(userData)) // Store user data in local storage

        console.log('Auth Store: Login successful with normalized role, redirecting to dashboard.')
        window.location.href = "/dashboard" // Redirect on successful login
        return { success: true }
      } else {
        // Fallback: if user data is not in login response, fetch it
        console.log('Auth Store: No user in login response, fetching user data.')
        const userResponse = await axios.get("/api/user")
        console.log('Auth Store: User fetch response:', userResponse.data)
        
        const userData = { ...userResponse.data }
        userData.role = normalizeRole(userData.role)
        
        user.value = userData
        localStorage.setItem("user_data", JSON.stringify(userData))

        window.location.href = "/dashboard"
        return { success: true }
      }
    } catch (error) {
      console.error("Auth Store: Login error:", error)
      console.error("Auth Store: Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Erreur de connexion.",
      }
    }
  }

  /**
   * Handles user logout.
   * Calls the backend logout endpoint and clears local storage.
   */
  const logout = async () => {
    try {
      // Call logout endpoint only if a token exists
      if (token.value) {
        console.log("Auth Store: Calling logout API.")
        await axios.post("/api/logout")
      }
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Always clear local data regardless of API success/failure
      console.log("useAuth: Logging out, clearing local storage.")
      user.value = null
      token.value = null
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")

      // Redirect to login page if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
  }

  /**
   * Checks if the current user has any of the specified roles.
   * @param {string[]} roles - An array of roles to check against.
   * @returns {boolean} True if the user has at least one of the specified roles, false otherwise.
   */
  const hasRole = (roles) => {
    // If no user or user role is defined, return false
    if (!user.value || !user.value.role) {
      console.log("useAuth: hasRole - No user or role found:", user.value)
      return false
    }
    // Check if the user's normalized role is included in the allowed roles array
    const hasAccess = roles.includes(user.value.role)
    console.log("useAuth: hasRole - User role:", user.value.role, "Required roles:", roles, "Has access:", hasAccess)
    return hasAccess
  }

  // Return the state and actions for the store
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initializeAuth,
    hasRole,
  }
})
