<template>
  <Layout>
    <div class="space-y-6">
      <!-- Welcome message -->
      <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 class="text-2xl font-bold mb-2">
          Bonjour, {{ authStore.user?.nom }} !
        </h1>
        <p class="text-purple-100">
          Voici un aperçu de votre activité récente
        </p>
      </div>
      
      <!-- Dashboard cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Employe cards -->
        <template v-if="authStore.user?.role === 'employe'">
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <DocumentTextIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Notes</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.total_notes || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-100 rounded-lg">
                <ClockIcon class="h-6 w-6 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Notes Soumises</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.notes_soumises || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Notes Remboursées</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.notes_remboursees || 0 }}</p>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Manager cards -->
        <template v-if="authStore.user?.role === 'manager'">
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-orange-100 rounded-lg">
                <ClockIcon class="h-6 w-6 text-orange-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Notes à valider</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.notes_a_valider || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-indigo-100 rounded-lg">
                <TruckIcon class="h-6 w-6 text-indigo-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Déplacements à valider</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.deplacements_a_valider || 0 }}</p>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Comptable cards -->
        <template v-if="authStore.user?.role === 'comptable'">
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <CurrencyEuroIcon class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Notes à rembourser</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.notes_a_rembourser || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <BanknotesIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Remboursements</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.total_remboursements || 0 }}€</p>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Admin cards -->
        <template v-if="authStore.user?.role === 'admin'">
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <UsersIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.total_utilisateurs || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <DocumentTextIcon class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Notes</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.total_notes || 0 }}</p>
              </div>
            </div>
          </div>
          
          <div class="card p-6">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 rounded-lg">
                <TruckIcon class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Déplacements</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardData.total_deplacements || 0 }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Quick actions -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div class="flex flex-wrap gap-4">
          <router-link
            v-if="authStore.hasRole(['employe', 'admin'])"
            to="/notes/create"
            class="btn-primary"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Nouvelle note de frais
          </router-link>
          
          <router-link
            v-if="authStore.hasRole(['employe', 'admin'])"
            to="/deplacements/create"
            class="btn-primary"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            Nouveau déplacement
          </router-link>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  CurrencyEuroIcon,
  BanknotesIcon,
  UsersIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import axios from '../utils/axios'

const authStore = useAuthStore()
const dashboardData = ref({})

const fetchDashboardData = async () => {
  try {
    const response = await axios.get('/api/dashboard')
    dashboardData.value = response.data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
