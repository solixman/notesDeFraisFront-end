<template>
  <Layout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
          <p class="text-gray-600">Centre de notifications</p>
        </div>
        
        <button
          @click="markAllAsRead"
          :disabled="!hasUnreadNotifications"
          class="btn-primary disabled:opacity-50"
        >
          Tout marquer comme lu
        </button>
      </div>
      
      <div class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="card p-4 hover:shadow-lg transition-shadow"
          :class="{ 'bg-blue-50 border-l-4 border-blue-500': !notification.read_at }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="p-2 rounded-lg" :class="getNotificationIconClass(notification.type)">
                  <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ getNotificationTitle(notification.type) }}
                </span>
                <span v-if="!notification.read_at" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Nouveau
                </span>
              </div>
              
              <p class="text-gray-700 mb-2">{{ notification.data.message }}</p>
              
              <p class="text-sm text-gray-500">
                {{ formatDate(notification.created_at) }}
              </p>
            </div>
            
            <button
              v-if="!notification.read_at"
              @click="markAsRead(notification.id)"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Marquer comme lu
            </button>
          </div>
        </div>
        
        <div v-if="notifications.length === 0" class="card p-8 text-center">
          <BellIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
          <p class="text-gray-600">Vous n'avez aucune notification pour le moment.</p>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex justify-center">
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
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import Layout from '../components/Layout.vue'
import {
  BellIcon,
  DocumentTextIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import axios from '../utils/axios'

const authStore = useAuthStore()
const notifications = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0
})

const hasUnreadNotifications = computed(() => {
  return notifications.value.some(n => !n.read_at)
})

const fetchNotifications = async (page = 1) => {
  try {
    const response = await axios.get(`/api/notifications?page=${page}`)
    notifications.value = response.data.data
    pagination.value = {
      current_page: response.data.current_page,
      last_page: response.data.last_page,
      per_page: response.data.per_page,
      total: response.data.total
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

const markAsRead = async (id) => {
  try {
    await axios.post(`/api/notifications/${id}/mark-as-read`)
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read_at = new Date().toISOString()
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    const unreadIds = notifications.value.filter(n => !n.read_at).map(n => n.id)
    await Promise.all(unreadIds.map(id => axios.post(`/api/notifications/${id}/mark-as-read`)))
    notifications.value.forEach(n => {
      if (!n.read_at) {
        n.read_at = new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    'App\\Notifications\\NoteSubmitted': DocumentTextIcon,
    'App\\Notifications\\NoteValidated': CheckCircleIcon,
    'App\\Notifications\\NoteRejected': XCircleIcon,
    'App\\Notifications\\DeplacementSubmitted': TruckIcon,
    'App\\Notifications\\DeplacementValidated': CheckCircleIcon,
    'App\\Notifications\\DeplacementRejected': XCircleIcon
  }
  return icons[type] || BellIcon
}

const getNotificationIconClass = (type) => {
  const classes = {
    'App\\Notifications\\NoteSubmitted': 'bg-blue-100 text-blue-600',
    'App\\Notifications\\NoteValidated': 'bg-green-100 text-green-600',
    'App\\Notifications\\NoteRejected': 'bg-red-100 text-red-600',
    'App\\Notifications\\DeplacementSubmitted': 'bg-purple-100 text-purple-600',
    'App\\Notifications\\DeplacementValidated': 'bg-green-100 text-green-600',
    'App\\Notifications\\DeplacementRejected': 'bg-red-100 text-red-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}

const getNotificationTitle = (type) => {
  const titles = {
    'App\\Notifications\\NoteSubmitted': 'Note de frais soumise',
    'App\\Notifications\\NoteValidated': 'Note de frais validée',
    'App\\Notifications\\NoteRejected': 'Note de frais rejetée',
    'App\\Notifications\\DeplacementSubmitted': 'Déplacement soumis',
    'App\\Notifications\\DeplacementValidated': 'Déplacement validé',
    'App\\Notifications\\DeplacementRejected': 'Déplacement rejeté'
  }
  return titles[type] || 'Notification'
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('fr-FR')
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchNotifications(page)
  }
}

const getPageNumbers = () => {
  const pages = []
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  
  for (let i = Math.max(1, current - 2); i <= Math.min(last, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
}

onMounted(() => {
  fetchNotifications()
})
</script>
