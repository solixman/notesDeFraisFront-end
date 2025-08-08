<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Déplacements</h1>
          <p class="text-gray-600">Gérez vos demandes de déplacement</p>
        </div>
        
        <router-link
          v-if="authStore.hasRole(['employe', 'admin'])"
          to="/deplacements/create"
          class="btn-primary"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouveau déplacement
        </router-link>
      </div>
      
      <div v-if="loading" class="card p-8 text-center">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4 mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-4 mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
        </div>
      </div>
      
      <div v-else-if="error" class="card p-8 text-center">
        <div class="text-red-600">
          <h3 class="text-lg font-medium mb-2">Erreur</h3>
          <p>{{ error }}</p>
          <button @click="fetchDeplacements()" class="btn-primary mt-4">
            Réessayer
          </button>
        </div>
      </div>
      
      <div v-else-if="deplacements.length === 0" class="card p-8 text-center">
        <TruckIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun déplacement</h3>
        <p class="text-gray-600 mb-4">Vous n'avez aucun déplacement pour le moment.</p>
        <router-link
          v-if="authStore.hasRole(['employe', 'admin'])"
          to="/deplacements/create"
          class="btn-primary"
        >
          Créer votre premier déplacement
        </router-link>
      </div>
      
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Objet
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lieu
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transport
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coût estimé
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th v-if="authStore.hasRole(['employe', 'manager', 'admin'])" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="deplacement in deplacements" :key="deplacement.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ deplacement.objet }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ deplacement.lieu }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatDate(deplacement.date_depart) }} - {{ formatDate(deplacement.date_retour) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
                    {{ deplacement.moyen_transport }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ deplacement.cout_estime }} €
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(deplacement.statut)">
                    {{ getStatusLabel(deplacement.statut) }}
                  </span>
                </td>
                <td v-if="authStore.hasRole(['employe', 'manager', 'admin'])" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="canEdit(deplacement)"
                      @click="editDeplacement(deplacement.id)"
                      class="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canSubmit(deplacement)"
                      @click="submitDeplacement(deplacement.id)"
                      class="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                      title="Soumettre"
                    >
                      <PaperAirplaneIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canValidate(deplacement)"
                      @click="validateDeplacement(deplacement.id)"
                      class="p-1 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                      title="Valider"
                    >
                      <CheckCircleIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canReject(deplacement)"
                      @click="rejectDeplacement(deplacement.id)"
                      class="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      title="Rejeter"
                    >
                      <XCircleIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canDelete(deplacement)"
                      @click="deleteDeplacement(deplacement.id)"
                      class="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="pagination && pagination.last_page > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                @click="changePage(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Affichage de
                  <span class="font-medium">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
                  à
                  <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
                  sur
                  <span class="font-medium">{{ pagination.total }}</span>
                  résultats
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    v-for="page in getPageNumbers()"
                    :key="page"
                    @click="changePage(page)"
                    :class="page === pagination.current_page 
                      ? 'bg-purple-50 border-purple-500 text-purple-600' 
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                  >
                    {{ page }}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import {
  PlusIcon,
  PencilIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  TruckIcon
} from '@heroicons/vue/24/outline'
import axios from '../utils/axios'

// Initialize router for navigation
const router = useRouter()
// Initialize auth store for role-based access control
const authStore = useAuthStore()

// Reactive variables for displacements data, pagination, loading state, and errors
const deplacements = ref([])
const pagination = ref(null)
const loading = ref(true)
const error = ref('')

/**
 * Fetches displacements from the API.
 * @param {number} page - The page number to fetch. Defaults to 1.
 */
const fetchDeplacements = async (page = 1) => {
  loading.value = true
  error.value = '' // Clear previous errors

  try {
    console.log('Deplacements: Fetching deplacements for user role:', authStore.user?.role, 'on page:', page)
    
    const response = await axios.get(`/api/deplacements?page=${page}`)
    console.log('Deplacements: API response:', response.data)
    
    // Handle different response formats (e.g., Laravel pagination structure vs. direct array)
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    
    // Check if response is paginated (has 'data' property) or direct array
    if (response.data.data && Array.isArray(response.data.data)) {
      // Paginated response (typically for admin/manager/comptable roles)
      console.log('Deplacements: Handling paginated response.')
      deplacements.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      }
    } else if (Array.isArray(response.data)) {
      // Direct array response (typically for 'employe' role if not paginated)
      console.log('Deplacements: Handling direct array response.')
      deplacements.value = response.data
      pagination.value = null // No pagination for direct arrays
    } else {
      console.error('Deplacements: Unexpected response format:', response.data)
      throw new Error('Format de réponse inattendu pour les déplacements.')
    }
    
    console.log('Deplacements: Loaded', deplacements.value.length, 'items.')
    deplacements.value.forEach(dep => {
      console.log(`Deplacements: Item ID: ${dep.id}, Status: ${dep.statut}, User Role: ${authStore.user?.role}`);
    });

  } catch (err) {
    console.error('Deplacements: Error fetching deplacements:', err)
    error.value = err.response?.data?.message || err.message || 'Erreur lors du chargement des déplacements.'
  } finally {
    loading.value = false // Always set loading to false
  }
}

/**
 * Formats a date string to a localized date string (e.g., "DD/MM/YYYY").
 * @param {string} date - The date string to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

/**
 * Returns Tailwind CSS classes for a given displacement status.
 * @param {string} status - The status of the displacement.
 * @returns {string} Tailwind CSS classes.
 */
const getStatusClass = (status) => {
  const classes = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'soumis': 'bg-yellow-100 text-yellow-800',
    'en_attente': 'bg-orange-100 text-orange-800', // New status class
    'valide': 'bg-green-100 text-green-800',
    'rejete': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Returns a human-readable label for a given displacement status.
 * @param {string} status - The status of the displacement.
 * @returns {string} The status label.
 */
const getStatusLabel = (status) => {
  const labels = {
    'brouillon': 'Brouillon',
    'soumis': 'Soumis',
    'en_attente': 'En attente', // New status label
    'valide': 'Validé',
    'rejete': 'Rejeté'
  }
  return labels[status] || status
}

// --- Role-based permission functions for Déplacements ---
/**
 * Checks if the current user can edit a specific displacement.
 * Only 'brouillon' (draft) displacements can be edited by 'employe' or 'admin'.
 * @param {object} deplacement - The displacement object.
 * @returns {boolean} True if the user can edit, false otherwise.
 */
const canEdit = (deplacement) => {
  const result = deplacement.statut === 'brouillon' && authStore.hasRole(['employe', 'admin']);
  console.log(`Deplacements: canEdit for ID ${deplacement.id} (Status: ${deplacement.statut}, Role: ${authStore.user?.role}): ${result}`);
  return result;
}

/**
 * Checks if the current user can submit a specific displacement.
 * Only 'brouillon' (draft) displacements can be submitted by 'employe' or 'admin'.
 * @param {object} deplacement - The displacement object.
 * @returns {boolean} True if the user can submit, false otherwise.
 */
const canSubmit = (deplacement) => {
  const result = deplacement.statut === 'brouillon' && authStore.hasRole(['employe', 'admin']);
  console.log(`Deplacements: canSubmit for ID ${deplacement.id} (Status: ${deplacement.statut}, Role: ${authStore.user?.role}): ${result}`);
  return result;
}

/**
 * Checks if the current user can validate a specific displacement.
 * Only 'soumis' (submitted) displacements can be validated by 'manager' or 'admin'.
 * @param {object} deplacement - The displacement object.
 * @returns {boolean} True if the user can validate, false otherwise.
 */
const canValidate = (deplacement) => {
  const result = (deplacement.statut === 'soumis' || deplacement.statut === 'en_attente') && authStore.hasRole(['manager', 'admin']);
  console.log(`Deplacements: canValidate for ID ${deplacement.id} (Status: ${deplacement.statut}, Role: ${authStore.user?.role}): ${result}`);
  return result;
}

/**
 * Checks if the current user can reject a specific displacement.
 * Only 'soumis' (submitted) displacements can be rejected by 'manager' or 'admin'.
 * @param {object} deplacement - The displacement object.
 * @returns {boolean} True if the user can reject, false otherwise.
 */
const canReject = (deplacement) => {
  const result = (deplacement.statut === 'soumis' || deplacement.statut === 'en_attente') && authStore.hasRole(['manager', 'admin']);
  console.log(`Deplacements: canReject for ID ${deplacement.id} (Status: ${deplacement.statut}, Role: ${authStore.user?.role}): ${result}`);
  return result;
}

/**
 * Checks if the current user can delete a specific displacement.
 * Only 'brouillon' (draft) displacements can be deleted by 'employe' or 'admin'.
 * @param {object} deplacement - The displacement object.
 * @returns {boolean} True if the user can delete, false otherwise.
 */
const canDelete = (deplacement) => {
  const result = deplacement.statut === 'brouillon' && authStore.hasRole(['employe', 'admin']);
  console.log(`Deplacements: canDelete for ID ${deplacement.id} (Status: ${deplacement.statut}, Role: ${authStore.user?.role}): ${result}`);
  return result;
}

/**
 * Navigates to the edit page for a specific displacement.
 * @param {number} id - The ID of the displacement to edit.
 */
const editDeplacement = (id) => {
  router.push(`/deplacements/edit/${id}`) // Assuming an edit route for displacements exists
}

/**
 * Submits a displacement to the backend.
 * @param {number} id - The ID of the displacement to submit.
 */
const submitDeplacement = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir soumettre ce déplacement ?')) return;
  try {
    console.log('Deplacements: Submitting deplacement:', id);
    await axios.post(`/api/deplacements/${id}/soumettre`);
    alert('Déplacement soumis avec succès!');
    fetchDeplacements(pagination.value?.current_page || 1); // Refresh displacements after action
  } catch (error) {
    console.error('Deplacements: Error submitting deplacement:', error);
    alert(error.response?.data?.message || 'Erreur lors de la soumission du déplacement.');
  }
}

/**
 * Validates a displacement on the backend.
 * @param {number} id - The ID of the displacement to validate.
 */
const validateDeplacement = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir valider ce déplacement ?')) return;
  try {
    console.log('Deplacements: Validating deplacement:', id);
    await axios.post(`/api/deplacements/${id}/valider`, {
      commentaire: 'Déplacement validé' // Default comment for validation
    });
    alert('Déplacement validé avec succès!');
    fetchDeplacements(pagination.value?.current_page || 1); // Refresh displacements after action
  } catch (error) {
    console.error('Deplacements: Error validating deplacement:', error);
    alert(error.response?.data?.message || 'Erreur lors de la validation du déplacement.');
  }
}

/**
 * Rejects a displacement on the backend. Prompts for a rejection comment.
 * @param {number} id - The ID of the displacement to reject.
 */
const rejectDeplacement = async (id) => {
  const commentaire = prompt('Commentaire de rejet (optionnel):');
  if (!confirm('Êtes-vous sûr de vouloir rejeter ce déplacement ?')) return;
  try {
    console.log('Deplacements: Rejecting deplacement:', id, 'Comment:', commentaire);
    await axios.post(`/api/deplacements/${id}/rejeter`, {
      commentaire: commentaire || 'Déplacement rejeté' // Use provided comment or default
    });
    alert('Déplacement rejeté avec succès!');
    fetchDeplacements(pagination.value?.current_page || 1); // Refresh displacements after action
  } catch (error) {
    console.error('Deplacements: Error rejecting deplacement:', error);
    alert(error.response?.data?.message || 'Erreur lors du rejet du déplacement.');
  }
}

/**
 * Deletes a displacement from the backend.
 * @param {number} id - The ID of the displacement to delete.
 */
const deleteDeplacement = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce déplacement ?')) {
    try {
      console.log('Deplacements: Deleting deplacement:', id);
      await axios.delete(`/api/deplacements/${id}`);
      alert('Déplacement supprimé avec succès!');
      fetchDeplacements(pagination.value?.current_page || 1); // Refresh displacements after action
    } catch (error) {
      console.error('Deplacements: Error deleting deplacement:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression du déplacement.');
    }
  }
}

/**
 * Changes the current page of the displacements table.
 * @param {number} page - The new page number.
 */
const changePage = (page) => {
  if (pagination.value && page >= 1 && page <= pagination.value.last_page) {
    fetchDeplacements(page)
  }
}

/**
 * Generates an array of page numbers for pagination display.
 * Shows current page, and up to 2 pages before/after.
 * @returns {number[]} An array of page numbers.
 */
const getPageNumbers = () => {
  if (!pagination.value) return []
  
  const pages = []
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  
  for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
}

// Fetch displacements when the component is mounted
onMounted(() => {
  fetchDeplacements()
})
</script>
