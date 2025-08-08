<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo and title section -->
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
          <DocumentTextIcon class="h-8 w-8 text-purple-600" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Notes de Frais</h1>
        <p class="text-purple-100">Créez votre compte</p>
      </div>
      
      <!-- Registration form card -->
      <div class="card p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              v-model="form.nom"
              type="text"
              required
              class="input-field"
              placeholder="Votre nom complet"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email *
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
              Mot de passe *
            </label>
            <input
              v-model="form.mot_de_passe"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <input
              v-model="form.mot_de_passe_confirmation"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rôle *
            </label>
            <select
              v-model="form.role"
              required
              class="input-field"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="employe">Employé</option>
              <option value="manager">Manager</option>
              <option value="comptable">Comptable</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          
          <!-- Error message display -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
          
          <!-- Success message display -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-green-600 text-sm">{{ success }}</p>
          </div>
          
          <!-- Submit button for registration -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary"
          >
            <span v-if="loading">Création du compte...</span>
            <span v-else>Créer le compte</span>
          </button>
        </form>
        
        <!-- Link to login page -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Vous avez déjà un compte ?
            <router-link to="/login" class="text-purple-600 hover:text-purple-700 font-medium">
              Se connecter
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import axios from '../utils/axios' // Import the configured axios instance

// Initialize router for navigation
const router = useRouter()

// Reactive form data for registration
const form = ref({
  nom: '',
  email: '',
  mot_de_passe: '',
  mot_de_passe_confirmation: '',
  role: ''
})

// Reactive variables for loading state, error, and success messages
const loading = ref(false)
const error = ref('')
const success = ref('')

/**
 * Handles the registration form submission.
 * Validates passwords, sends registration data to the backend, and handles auto-login.
 */
const handleRegister = async () => {
  loading.value = true
  error.value = '' // Clear previous errors
  success.value = '' // Clear previous success messages

  // Client-side password confirmation check
  if (form.value.mot_de_passe !== form.value.mot_de_passe_confirmation) {
    error.value = 'Les mots de passe ne correspondent pas.'
    loading.value = false
    return
  }

  console.log('Registration attempt with:', { 
    nom: form.value.nom, 
    email: form.value.email, 
    role: form.value.role 
  })

  try {
    // Send registration request to backend
    const response = await axios.post('/api/register', form.value)
    
    console.log('Registration response:', response.data)
    
    success.value = response.data.message || 'Compte créé avec succès!'
    
    // Attempt to auto-login after successful registration if a token is provided
    if (response.data.token) {
      console.log('Registration: Token received, attempting auto-login.')
      
      // Clean the token (remove 'Bearer ' prefix if present)
      let cleanToken = response.data.token
      if (cleanToken.startsWith('Bearer ')) {
        cleanToken = cleanToken.substring(7)
      }
      
      // Normalize user role before storing (using a local helper for consistency)
      const userData = { ...response.data.user }
      const normalizeRole = (role) => {
        if (!role || typeof role !== 'string') return 'employe'
        const cleanRole = role.toLowerCase().trim()
        const roleMap = {
          'employé': 'employe', 'employe': 'employe', 'employee': 'employe',
          'manager': 'manager',
          'comptable': 'comptable', 'accountant': 'comptable',
          'admin': 'admin', 'administrator': 'admin', 'administrateur': 'admin'
        }
        return roleMap[cleanRole] || 'employe'
      }
      userData.role = normalizeRole(userData.role)
      
      // Store token and user data in local storage
      localStorage.setItem('auth_token', cleanToken)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
    } else {
      console.log('Registration: No token received, redirecting to login page.')
      // If no token, redirect to login page
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (err) {
    console.error('Registration error:', err)
    console.error('Registration error response details:', err.response?.data)
    // Display error message from backend or a generic one
    error.value = err.response?.data?.message || 'Erreur lors de la création du compte.'
  } finally {
    loading.value = false // Always reset loading state
  }
}
</script>
