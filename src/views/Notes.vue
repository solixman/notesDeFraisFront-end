<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notes de frais</h1>
          <p class="text-gray-600">Gérez vos notes de frais</p>
        </div>
        
        <router-link
          v-if="authStore.hasRole(['employe', 'admin'])"
          to="/notes/create"
          class="btn-primary"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouvelle note
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
          <button @click="fetchNotes()" class="btn-primary mt-4">
            Réessayer
          </button>
        </div>
      </div>
      
      <div v-else-if="notes.length === 0" class="card p-8 text-center">
        <DocumentTextIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune note de frais</h3>
        <p class="text-gray-600 mb-4">Vous n'avez aucune note de frais pour le moment.</p>
        <router-link
          v-if="authStore.hasRole(['employe', 'admin'])"
          to="/notes/create"
          class="btn-primary"
        >
          Créer votre première note
        </router-link>
      </div>
      
      <div v-else class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th v-if="authStore.hasRole(['employe', 'manager', 'comptable', 'admin'])" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="note in notes" :key="note.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(note.date_depense) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                        :class="getCategoryClass(note.categorie)">
                    {{ note.categorie }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ note.description || 'Aucune description' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ note.montant }} {{ note.devise }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(note.statut)">
                    {{ getStatusLabel(note.statut) }}
                  </span>
                </td>
                <td v-if="authStore.hasRole(['employe', 'manager', 'comptable', 'admin'])" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      v-if="note.fichier_justificatif"
                      @click="viewFile(note.fichier_justificatif)"
                      class="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                      title="Voir le justificatif"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </button>
                    
                    <router-link
                      v-if="canEdit(note)"
                      :to="{ 
                        name: 'EditNote', 
                        params: { id: note.id },
                        query: { 
                          date_depense: note.date_depense,
                          categorie: note.categorie,
                          montant: note.montant,
                          devise: note.devise,
                          description: note.description || '',
                          fichier_justificatif: note.fichier_justificatif || ''
                        }
                      }"
                      class="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </router-link>
                    
                    <button
                      v-if="canSubmit(note)"
                      @click="submitNote(note.id)"
                      class="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                      title="Soumettre"
                    >
                      <PaperAirplaneIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canValidate(note)"
                      @click="validateNote(note.id)"
                      class="p-1 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors"
                      title="Valider"
                    >
                      <CheckCircleIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canReject(note)"
                      @click="rejectNote(note.id)"
                      class="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                      title="Rejeter"
                    >
                      <XCircleIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canReimburse(note)"
                      @click="reimburseNote(note.id)"
                      class="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                      title="Rembourser"
                    >
                      <CurrencyEuroIcon class="h-4 w-4" />
                    </button>
                    
                    <button
                      v-if="canDelete(note)"
                      @click="deleteNote(note.id)"
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

      <FileViewerModal
        :show="showFileViewerModal"
        :fileUrl="currentFileBlobUrl"
        :fileName="currentFileDisplayName"
        @update:show="showFileViewerModal = $event"
        @close="handleFileViewerClose"
      />
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import FileViewerModal from '../components/FileViewer.vue'
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyEuroIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import axios from '../utils/axios'

const authStore = useAuthStore()

const notes = ref([])
const pagination = ref(null)
const loading = ref(true)
const error = ref('')

const showFileViewerModal = ref(false)
const currentFileBlobUrl = ref('')
const currentFileDisplayName = ref('')

const fetchNotes = async (page = 1) => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('Fetching notes for user role:', authStore.user?.role, 'on page:', page)
    
    const response = await axios.get(`/api/notes?page=${page}`)
    console.log('Notes API response:', response.data)
    
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    
    if (response.data.data !== undefined) {
      console.log('Handling paginated response for notes.')
      notes.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total
      }
    } else {
      console.error('Unexpected response format for notes:', response.data)
      throw new Error('Format de réponse inattendu pour les notes.')
    }
    
    console.log('Notes loaded:', notes.value.length)
  } catch (err) {
    console.error('Error fetching notes:', err)
    error.value = err.response?.data?.message || err.message || 'Erreur lors du chargement des notes.'
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const getCategoryClass = (category) => {
  const classes = {
    'repas': 'bg-blue-100 text-blue-800',
    'hôtel': 'bg-purple-100 text-purple-800',
    'transport': 'bg-green-100 text-green-800'
  }
  return classes[category] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    'brouillon': 'bg-gray-100 text-gray-800',
    'soumise': 'bg-yellow-100 text-yellow-800',
    'validée': 'bg-green-100 text-green-800',
    'rejetée': 'bg-red-100 text-red-800',
    'remboursée': 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'brouillon': 'Brouillon',
    'soumise': 'Soumise',
    'validée': 'Validée',
    'rejetée': 'Rejetée',
    'remboursée': 'Remboursée'
  }
  return labels[status] || status
}

const canEdit = (note) => {
  return note.statut === 'brouillon' && authStore.hasRole(['employe', 'admin'])
}

const canSubmit = (note) => {
  return note.statut === 'brouillon' && authStore.hasRole(['employe', 'admin'])
}

const canValidate = (note) => {
  return note.statut === 'soumise' && authStore.hasRole(['manager', 'admin'])
}

const canReject = (note) => {
  return note.statut === 'soumise' && authStore.hasRole(['manager', 'admin'])
}

const canReimburse = (note) => {
  return note.statut === 'validée' && authStore.hasRole(['comptable'])
}

const canDelete = (note) => {
  return note.statut === 'brouillon' && authStore.hasRole(['employe', 'admin'])
}

const viewFile = async (filename) => {
  const baseFilename = filename.split('/').pop();
  console.log('Attempting to view file:', baseFilename);
  
  currentFileBlobUrl.value = '';
  currentFileDisplayName.value = baseFilename;
  showFileViewerModal.value = true;
  
  try {
    const response = await axios.get(`/api/justificatif/${baseFilename}`, {
      responseType: 'blob'
    });
    
    const contentType = response.headers['content-type'];
    console.log('Received Content-Type:', contentType);

    const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
    console.log('Blob URL created:', url);
    
    currentFileBlobUrl.value = url;
    
  } catch (error) {
    console.error('Error viewing file:', error);
    alert('Erreur lors de l\'affichage du fichier. Veuillez vérifier si le fichier existe ou si vous avez les permissions nécessaires.');
    if (error.response) {
      console.error('Server response for file view:', error.response.status, error.response.data);
      if (error.response.status === 404) {
        error.value = 'Fichier non trouvé.';
      } else if (error.response.status === 403) {
        error.value = 'Accès refusé au fichier.';
      } else {
        error.value = error.response?.data?.message || 'Erreur inconnue lors de l\'affichage du fichier.';
      }
    } else {
      error.value = 'Erreur réseau ou serveur inaccessible.';
    }
    showFileViewerModal.value = false;
  }
}

const handleFileViewerClose = () => {
  if (currentFileBlobUrl.value) {
    window.URL.revokeObjectURL(currentFileBlobUrl.value);
    console.log('Blob URL revoked:', currentFileBlobUrl.value);
    currentFileBlobUrl.value = '';
  }
  currentFileDisplayName.value = '';
  error.value = '';
}

const submitNote = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir soumettre cette note ?')) return;
  try {
    console.log('Submitting note with ID:', id);
    await axios.post(`/api/notes/${id}/soumettre`);
    alert('Note soumise avec succès!');
    fetchNotes(pagination.value?.current_page || 1);
  } catch (error) {
    console.error('Error submitting note:', error);
    alert(error.response?.data?.message || 'Erreur lors de la soumission de la note.');
  }
}

const validateNote = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir valider cette note ?')) return;
  try {
    console.log('Validating note with ID:', id);
    await axios.post(`/api/notes/${id}/valider`, {
      commentaire: 'Note validée'
    });
    alert('Note validée avec succès!');
    fetchNotes(pagination.value?.current_page || 1);
  } catch (error) {
    console.error('Error validating note:', error);
    alert(error.response?.data?.message || 'Erreur lors de la validation de la note.');
  }
}

const rejectNote = async (id) => {
  const commentaire = prompt('Commentaire de rejet (requis):');
  if (!commentaire) {
    alert('Le commentaire de rejet est requis.');
    return;
  }
  if (!confirm('Êtes-vous sûr de vouloir rejeter cette note ?')) return;

  try {
    console.log('Rejecting note with ID:', id, 'Comment:', commentaire);
    await axios.post(`/api/notes/${id}/rejeter`, {
      commentaire: commentaire
    });
    alert('Note rejetée avec succès!');
    fetchNotes(pagination.value?.current_page || 1);
  } catch (error) {
    console.error('Error rejecting note:', error);
    alert(error.response?.data?.message || 'Erreur lors du rejet de la note.');
  }
}

const reimburseNote = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir rembourser cette note ?')) return;
  try {
    console.log('Reimbursing note with ID:', id);
    await axios.post(`/api/notes/${id}/remboursement`);
    alert('Note remboursée avec succès!');
    fetchNotes(pagination.value?.current_page || 1);
  } catch (error) {
    console.error('Error reimbursing note:', error);
    alert(error.response?.data?.message || 'Erreur lors du remboursement de la note.');
  }
}

const deleteNote = async (id) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
    try {
      console.log('Deleting note with ID:', id);
      await axios.delete(`/api/notes/${id}`);
      alert('Note supprimée avec succès!');
      fetchNotes(pagination.value?.current_page || 1);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression de la note.');
    }
  }
}

const changePage = (page) => {
  if (pagination.value && page >= 1 && page <= pagination.value.last_page) {
    fetchNotes(page)
  }
}

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

onMounted(() => {
  fetchNotes()
})
</script>
