<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar navigation -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
      <div class="flex h-full flex-col">
        <!-- Application Logo/Title -->
        <div class="flex h-16 items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600">
          <h1 class="text-xl font-bold text-white">Notes de Frais</h1>
        </div>
        
        <!-- Main navigation links -->
        <nav class="flex-1 space-y-1 px-4 py-6">
          <!-- Dashboard Link -->
          <router-link
            to="/dashboard"
            class="nav-link"
            :class="{ 'nav-link-active': $route.name === 'Dashboard' }"
          >
            <HomeIcon class="h-5 w-5" />
            Dashboard
          </router-link>
          
          <!-- Notes de Frais Link -->
          <router-link
            to="/notes"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/notes') }"
          >
            <DocumentTextIcon class="h-5 w-5" />
            Notes de Frais
          </router-link>
          
          <!-- Déplacements Link (visible only to specific roles) -->
          <router-link
            v-if="authStore.hasRole(['employe', 'manager', 'admin'])"
            to="/deplacements"
            class="nav-link"
            :class="{ 'nav-link-active': $route.path.startsWith('/deplacements') }"
          >
            <TruckIcon class="h-5 w-5" />
            Déplacements
          </router-link>
        </nav>
      </div>
    </div>
    
    <!-- Main content area, shifted to the right by sidebar width -->
    <div class="pl-64">
      <!-- Top navigation bar -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex h-16 items-center justify-between px-6">
          <!-- Dynamic page title based on current route name -->
          <h2 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h2>
          
          <div class="flex items-center space-x-4">
            <!-- Notifications Dropdown Component -->
            <NotificationsDropdown />
            
            <!-- User profile display -->
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ authStore.user?.nom?.charAt(0).toUpperCase() }} <!-- Display first letter of user's name -->
                </span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700">{{ authStore.user?.nom }}</p>
                <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role }}</p>
              </div>
            </div>
            
            <!-- Logout button -->
            <button
              @click="authStore.logout"
              class="text-gray-500 hover:text-red-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      <!-- Slot for page-specific content -->
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  HomeIcon,
  DocumentTextIcon,
  TruckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import NotificationsDropdown from './NotificationsDropdown.vue'

// Initialize auth store for user data and roles
const authStore = useAuthStore()
// Initialize route object to access current route information
const route = useRoute()

/**
 * Computed property to determine the page title based on the current route name.
 * Provides user-friendly titles for different sections of the application.
 */
const pageTitle = computed(() => {
  const titles = {
    'Dashboard': 'Tableau de bord',
    'Notes': 'Notes de frais',
    'CreateNote': 'Nouvelle note de frais',
    'EditNote': 'Modifier la note de frais',
    'Deplacements': 'Déplacements',
    'CreateDeplacement': 'Nouveau déplacement'
    // 'Notifications' route was removed, so it's no longer in this map
  }
  // Return the specific title or a default if the route name is not mapped
  return titles[route.name] || 'Notes de Frais'
})
</script>
