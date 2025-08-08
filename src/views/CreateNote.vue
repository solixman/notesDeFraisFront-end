<template>
  <Layout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Nouvelle note de frais</h1>
        <p class="text-gray-600">Créez une nouvelle note de frais</p>
      </div>
      
      <div class="card p-6">
        <!-- Form for creating a new expense note -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date de dépense *
            </label>
            <input
              v-model="form.date_depense"
              type="date"
              required
              class="input-field"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              v-model="form.categorie"
              required
              class="input-field"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="repas">Repas</option>
              <option value="hôtel">Hôtel</option>
              <option value="transport">Transport</option>
            </select>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Montant *
              </label>
              <input
                v-model.number="form.montant"
                type="number"
                step="0.01"
                required
                class="input-field"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Devise *
              </label>
              <select
                v-model="form.devise"
                required
                class="input-field"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input-field"
              placeholder="Décrivez la dépense..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fichier justificatif
            </label>
            <input
              @change="handleFileChange"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              class="input-field"
            />
            <p class="text-sm text-gray-500 mt-1">
              Formats acceptés: PDF, JPG, PNG (max 5MB)
            </p>
          </div>
          
          <!-- Error message display -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
          
          <!-- Form action buttons -->
          <div class="flex justify-end space-x-4">
            <router-link
              to="/notes"
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
              <span v-else>Créer la note</span>
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
  date_depense: '',
  categorie: '',
  montant: '',
  devise: 'EUR', // Default currency
  description: '',
  fichier_justificatif: null // Stores the file object
})

// Reactive variables for loading state and error messages
const loading = ref(false)
const error = ref('')

/**
 * Handles file input change event.
 * Validates file size and sets the file to the form data.
 * @param {Event} event - The file input change event.
 */
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Le fichier ne doit pas dépasser 5MB.'
      form.value.fichier_justificatif = null // Clear the file if too large
      return
    }
    form.value.fichier_justificatif = file
    error.value = '' // Clear any previous file-related errors
  } else {
    form.value.fichier_justificatif = null
  }
}

/**
 * Handles form submission.
 * Sends the note data, including the file, to the backend API.
 */
const handleSubmit = async () => {
  loading.value = true
  error.value = '' // Clear previous errors
  
  console.log('Attempting to create note with data:', {
    date_depense: form.value.date_depense,
    categorie: form.value.categorie,
    montant: form.value.montant,
    devise: form.value.devise,
    description: form.value.description,
    hasFile: !!form.value.fichier_justificatif // Check if a file is present
  })
  
  try {
    // Create FormData object to send multipart/form-data, necessary for file uploads
    const formData = new FormData()
    formData.append('date_depense', form.value.date_depense)
    formData.append('categorie', form.value.categorie)
    formData.append('montant', form.value.montant)
    formData.append('devise', form.value.devise)
    formData.append('description', form.value.description || '') // Ensure description is not null
    
    if (form.value.fichier_justificatif) {
      formData.append('fichier_justificatif', form.value.fichier_justificatif)
    }
    
    console.log('Sending FormData to /api/notes...')
    const response = await axios.post('/api/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Explicitly set content type for FormData
      }
    })
    
    console.log('Note created successfully:', response.data)
    router.push('/notes') // Redirect to notes list after successful creation
  } catch (err) {
    console.error('Error creating note:', err)
    console.error('Error response details:', err.response?.data)
    // Display error message from backend or a generic one
    error.value = err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création de la note.'
  } finally {
    loading.value = false // Always set loading to false
  }
}
</script>
