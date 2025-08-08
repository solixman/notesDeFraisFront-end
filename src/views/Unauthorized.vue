<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <div class="card p-8">
        <div class="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ExclamationTriangleIcon class="h-8 w-8 text-red-600" />
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
        <p class="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <div class="space-y-4">
          <router-link
            to="/dashboard"
            class="btn-primary w-full"
          >
            Retour au tableau de bord
          </router-link>
          
          <button
            @click="authStore.logout"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
</script>
