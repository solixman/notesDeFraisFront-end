<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo and title section -->
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
          <DocumentTextIcon class="h-8 w-8 text-purple-600" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Notes de Frais</h1>
        <p class="text-purple-100">Connectez-vous à votre compte</p>
      </div>
      
      <!-- Login form card -->
      <div class="card p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="input-field"
              placeholder="votre@email.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>
          
          <!-- Error message display -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
          
          <!-- Submit button for login -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary"
          >
            <span v-if="loading">Connexion...</span>
            <span v-else>Se connecter</span>
          </button>
        </form>
        
        <!-- API connection test section -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <button
            @click="testConnection"
            :disabled="testingConnection"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <span v-if="testingConnection">Test en cours...</span>
            <span v-else>Tester la connexion API</span>
          </button>
          
          <!-- Connection status message -->
          <div v-if="connectionStatus" class="mt-3 p-3 rounded-lg" :class="connectionStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <p class="text-sm" :class="connectionStatus.success ? 'text-green-600' : 'text-red-600'">
              {{ connectionStatus.message }}
            </p>
          </div>
        </div>

        <!-- Link to registration page -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Vous n'avez pas de compte ?
            <router-link to="/register" class="text-purple-600 hover:text-purple-700 font-medium">
              Créer un compte
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth' // Import the authentication store
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import axios from '../utils/axios' // Import the configured axios instance

// Initialize the authentication store
const authStore = useAuthStore()

// Reactive form data for login credentials
const form = ref({
  email: '',
  password: ''
})

// Reactive variables for loading states and messages
const loading = ref(false) // Controls login button loading state
const error = ref('') // Stores login error messages
const testingConnection = ref(false) // Controls API test button loading state
const connectionStatus = ref(null) // Stores API connection test result

/**
 * Handles the login form submission.
 * Calls the auth store's login method.
 */
const handleLogin = async () => {
  loading.value = true
  error.value = '' // Clear previous errors
  
  console.log('Login attempt with email:', form.value.email)
  
  // Call the login action from the auth store
  const result = await authStore.login(form.value)
  
  console.log('Login result:', result)
  
  // If login was not successful, display the error message
  if (!result.success) {
    error.value = result.message
  }
  
  loading.value = false // Reset loading state
}

/**
 * Tests the API connection by making a simple GET request to a protected endpoint.
 * Useful for debugging connectivity issues.
 */
const testConnection = async () => {
  testingConnection.value = true
  connectionStatus.value = null // Clear previous status
  
  try {
    // Attempt to fetch user data, which requires authentication
    await axios.get('/api/user')
    connectionStatus.value = {
      success: true,
      message: 'Connexion API réussie ✓'
    }
  } catch (error) {
    connectionStatus.value = {
      success: false,
      message: `Erreur de connexion: ${error.message || 'Vérifiez votre backend ou votre connexion réseau.'}`
    }
    console.error('API connection test failed:', error);
  } finally {
    testingConnection.value = false // Reset testing state
  }
}
</script>
