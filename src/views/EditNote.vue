<template>
  <Layout>
    <div class="max-w-2xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Modifier la note de frais</h1>
        <p class="text-gray-600">Modifiez les détails de votre note de frais</p>
      </div>
      
      <!-- Display message if no note data is found or an error occurs -->
      <div v-if="!route.params.id || error" class="card p-6">
        <div class="text-center">
          <p class="text-gray-600 mb-4">Aucune donnée de note trouvée ou une erreur est survenue.</p>
          <router-link to="/notes" class="btn-primary">
            Retour aux notes
          </router-link>
        </div>
      </div>
      
      <!-- Form for editing an expense note -->
      <div v-else class="card p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Description *
            </label>
            <textarea
              v-model="form.description"
              required
              rows="3"
              class="input-field"
              placeholder="Décrivez la dépense..."
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fichier justificatif
            </label>
            <!-- Display current file name if available -->
            <div v-if="currentFile" class="mb-2 p-2 bg-gray-50 rounded">
              <p class="text-sm text-gray-600">Fichier actuel: {{ currentFile }}</p>
            </div>
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
              :disabled="submitting"
              class="btn-primary"
            >
              <span v-if="submitting">Modification...</span>
              <span v-else>Modifier la note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Layout from '../components/Layout.vue'
import axios from '../utils/axios' // Import the configured axios instance

// Initialize route and router for accessing route parameters/queries and navigation
const route = useRoute()
const router = useRouter()

// Reactive variable to hold the initial note data (not directly used in template, but for context)
const noteData = ref(null)

// Reactive form data object, initialized with default values
const form = ref({
  date_depense: '',
  categorie: '',
  montant: '',
  devise: 'EUR',
  description: '',
  fichier_justificatif: null // Stores the new file object for upload
})

// Reactive variables for submission state, error messages, and current file display
const submitting = ref(false)
const error = ref('')
const currentFile = ref('') // To display the name of the existing file

/**
 * Initializes the form fields with data from route query parameters.
 * This is how the note's existing data is passed to the edit page.
 */
const initializeForm = () => {
  const query = route.query // Get query parameters from the URL
  
  // Check if essential data is present in query parameters
  if (query.date_depense && query.categorie && query.montant) {
    console.log('Got note data from query params:', query)
    
    // Populate the form fields with data from query parameters
    form.value = {
      date_depense: query.date_depense,
      categorie: query.categorie,
      montant: parseFloat(query.montant) || 0, // Convert montant to number
      devise: query.devise || 'EUR',
      description: query.description || '',
      fichier_justificatif: null // New file input is initially null
    }
    
    currentFile.value = query.fichier_justificatif || '' // Set current file name for display
    noteData.value = { id: route.params.id, ...query } // Store full note data for reference
    console.log('Form initialized with:', form.value)
  } else {
    console.error('No essential note data found in query parameters.')
    error.value = 'Aucune donnée de note trouvée. Veuillez retourner à la liste des notes.'
  }
}

/**
 * Handles file input change event.
 * Validates file size and sets the new file to the form data.
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
 * Handles form submission for updating the note.
 * Sends the updated note data, including a new file if selected, to the backend API.
 */
const handleSubmit = async () => {
  // Ensure note ID is present in route parameters
  if (!route.params.id) {
    error.value = 'ID de note manquant pour la modification.'
    return
  }
  
  submitting.value = true
  error.value = '' // Clear previous errors
  
  console.log('Attempting to update note with ID:', route.params.id, 'and data:', {
    date_depense: form.value.date_depense,
    categorie: form.value.categorie,
    montant: form.value.montant,
    devise: form.value.devise,
    description: form.value.description,
    hasFile: !!form.value.fichier_justificatif // Check if a new file is selected
  })
  
  try {
    // Create FormData object for multipart/form-data, necessary for file uploads and PUT method simulation
    const formData = new FormData()
    formData.append('date_depense', form.value.date_depense)
    formData.append('categorie', form.value.categorie)
    formData.append('montant', form.value.montant)
    formData.append('devise', form.value.devise)
    formData.append('description', form.value.description)
    formData.append('_method', 'PUT') // Laravel requires this for PUT requests with FormData
    
    if (form.value.fichier_justificatif) {
      formData.append('fichier_justificatif', form.value.fichier_justificatif)
    }
    
    console.log('Sending update request to:', `/api/notes/${route.params.id}`)
    await axios.post(`/api/notes/${route.params.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Explicitly set content type for FormData
      }
    })
    
    console.log('Note updated successfully.')
    router.push('/notes') // Redirect to notes list after successful update
  } catch (err) {
    console.error('Error updating note:', err)
    console.error('Error response details:', err.response?.data)
    // Display error message from backend or a generic one
    error.value = err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la modification de la note.'
  } finally {
    submitting.value = false // Always set submitting to false
  }
}

// Initialize the form when the component is mounted
onMounted(() => {
  initializeForm()
})
</script>
