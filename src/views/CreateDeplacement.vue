<template>
  <Layout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Nouveau déplacement</h1>
        <p class="text-gray-600">Créez une nouvelle demande de déplacement</p>
      </div>
      
      <div class="card p-6">
        <!-- Form for creating a new displacement -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Objet du déplacement *
            </label>
            <input
              v-model="form.objet"
              type="text"
              required
              class="input-field"
              placeholder="Ex: Conférence, Formation, Réunion client..."
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Lieu *
            </label>
            <input
              v-model="form.lieu"
              type="text"
              required
              class="input-field"
              placeholder="Ex: Paris, Lyon, Londres..."
            />
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de départ *
              </label>
              <input
                v-model="form.date_depart"
                type="date"
                required
                class="input-field"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de retour *
              </label>
              <input
                v-model="form.date_retour"
                type="date"
                required
                class="input-field"
              />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Moyen de transport *
              </label>
              <select
                v-model="form.moyen_transport"
                required
                class="input-field"
              >
                <option value="">Sélectionner un transport</option>
                <option value="train">Train</option>
                <option value="avion">Avion</option>
                <option value="voiture">Voiture</option>
                <option value="bus">Bus</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Coût estimé (€) *
              </label>
              <input
                v-model.number="form.cout_estime"
                type="number"
                step="0.01"
                required
                class="input-field"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <!-- Error message display -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
          
          <!-- Form action buttons -->
          <div class="flex justify-end space-x-4">
            <router-link
              to="/deplacements"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Annuler
            </router-link>
            
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary"
            >
              <span v-if="loading">Création...</span>
              <span v-else>Créer le déplacement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import axios from '../utils/axios' // Import the configured axios instance

// Initialize router for navigation
const router = useRouter()

// Reactive form data object
const form = ref({
  objet: '',
  lieu: '',
  date_depart: '',
  date_retour: '',
  moyen_transport: '',
  cout_estime: ''
})

// Reactive variables for loading state and error messages
const loading = ref(false)
const error = ref('')

/**
 * Handles form submission.
 * Sends the displacement data to the backend API.
 */
const handleSubmit = async () => {
  loading.value = true
  error.value = '' // Clear previous errors
  
  console.log('Attempting to create displacement with data:', form.value)
  
  try {
    const response = await axios.post('/api/deplacements', form.value)
    console.log('Displacement created successfully:', response.data)
    router.push('/deplacements') // Redirect to displacements list after successful creation
  } catch (err) {
    console.error('Error creating displacement:', err)
    console.error('Error response details:', err.response?.data)
    // Display error message from backend or a generic one
    error.value = err.response?.data?.message || 'Erreur lors de la création du déplacement.'
  } finally {
    loading.value = false // Always set loading to false
  }
}
</script>
