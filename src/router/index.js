import { createRouter, createWebHistory } from "vue-router"
// Import all view components
import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Dashboard from "../views/Dashboard.vue"
import Notes from "../views/Notes.vue"
import CreateNote from "../views/CreateNote.vue"
import EditNote from "../views/EditNote.vue"
import Deplacements from "../views/Deplacements.vue"
import CreateDeplacement from "../views/CreateDeplacement.vue"
import Unauthorized from "../views/Unauthorized.vue"
import NotFound from "../views/NotFound.vue"

// Define application routes
const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true }, // Meta field to indicate guest-only access
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresGuest: true }, // Meta field to indicate guest-only access
  },
  {
    path: "/",
    redirect: "/dashboard", // Redirect root path to dashboard
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, allowedRoles: ["employe", "manager", "comptable", "admin"] }, // Requires authentication and specific roles
  },
  {
    path: "/notes",
    name: "Notes",
    component: Notes,
    meta: { requiresAuth: true, allowedRoles: ["employe", "manager", "comptable", "admin"] },
  },
  {
    path: "/notes/create",
    name: "CreateNote",
    component: CreateNote,
    meta: { requiresAuth: true, allowedRoles: ["employe", "admin"] }, // Only employe and admin can create notes
  },
  {
    path: "/notes/edit/:id",
    name: "EditNote",
    component: EditNote,
    meta: { requiresAuth: true, allowedRoles: ["employe", "admin"] }, // Only employe and admin can edit notes
  },
  {
    path: "/deplacements",
    name: "Deplacements",
    component: Deplacements,
    meta: { requiresAuth: true, allowedRoles: ["employe", "manager", "admin"] }, // Comptable can view but not manage, so not listed here for management routes
  },
  {
    path: "/deplacements/create",
    name: "CreateDeplacement",
    component: CreateDeplacement,
    meta: { requiresAuth: true, allowedRoles: ["employe", "admin"] }, // Only employe and admin can create displacements
  },
  {
    path: "/unauthorized",
    name: "Unauthorized",
    component: Unauthorized, // Page for unauthorized access
  },
  {
    path: "/:pathMatch(.*)*", // Catch-all route for 404 Not Found
    name: "NotFound",
    component: NotFound,
  },
]

// Create the router instance
const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode
  routes, // Pass the defined routes
})

/**
 * Global navigation guard to handle authentication and role-based access control.
 * Runs before each route navigation.
 */
router.beforeEach(async (to, from, next) => {
  console.log(`Router beforeEach: Navigating from ${from.path} to ${to.path}`)

  // Dynamically import the auth store to avoid circular dependencies
  const { useAuthStore } = await import("../stores/auth")
  const authStore = useAuthStore()

  // Initialize authentication state if user data is not loaded but a token exists
  if (!authStore.user && localStorage.getItem("auth_token")) {
    console.log("Router beforeEach: Auth store user is null but token exists. Initializing auth...")
    try {
      await authStore.initializeAuth()
    } catch (error) {
      console.error("Router beforeEach: Auth initialization failed:", error)
      // If initialization fails (e.g., token expired), the logout function in authStore will handle redirection
    }
  }

  console.log("Router beforeEach: Is Authenticated (after init check):", authStore.isAuthenticated)
  console.log("Router beforeEach: Current user:", authStore.user)

  // 1. Handle guest-only routes (e.g., Login, Register)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log("Router beforeEach: Guest route but user is authenticated. Redirecting to dashboard.")
    return next("/dashboard") // Redirect authenticated users away from guest-only pages
  }

  // 2. Handle authentication-required routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log("Router beforeEach: Auth required but user not authenticated. Redirecting to login.")
    return next("/login") // Redirect unauthenticated users to login
  }

  // 3. Handle role-based access for authenticated users
  if (to.meta.allowedRoles && authStore.isAuthenticated) {
    const hasAccess = authStore.hasRole(to.meta.allowedRoles)
    console.log("Router beforeEach: Role check - Required roles:", to.meta.allowedRoles, "User role:", authStore.user?.role, "Has access:", hasAccess)

    if (!hasAccess) {
      console.log("Router beforeEach: User lacks required role. Redirecting to unauthorized page.")
      return next("/unauthorized") // Redirect if user does not have required role
    }
  }

  console.log("Router beforeEach: Proceeding with navigation.")
  next() // Proceed to the route
})

export default router
