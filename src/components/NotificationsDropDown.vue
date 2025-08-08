<template>
  <div class="relative">
     <!-- Notification bell button  -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg transition-colors"
    >
      <BellIcon class="h-6 w-6" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
    
     <!-- Dropdown menu  -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
      @click.stop
    >
       <!-- Header  -->
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Tout marquer comme lu
        </button>
      </div>
      
       <!-- Notifications list  -->
      <div class="max-h-96 overflow-y-auto">
        <div
          v-for="notification in notifications.slice(0, 5)"
          :key="notification.id"
          class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
          :class="{ 'bg-blue-50': !notification.read_at }"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div class="p-1 rounded-lg" :class="getNotificationIconClass(notification.type)">
                <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ getNotificationTitle(notification.type) }}
                </p>
                <span v-if="!notification.read_at" class="w-2 h-2 bg-blue-500 rounded-full"></span>
              </div>
              
              <p class="text-sm text-gray-600 mb-1">{{ notification.data.message }}</p>
              
              <p class="text-xs text-gray-500">
                {{ formatTimeAgo(notification.created_at) }}
              </p>
            </div>
            
            <button
              v-if="!notification.read_at"
              @click="markAsRead(notification.id)"
              class="text-xs text-blue-600 hover:text-blue-800"
            >
              ✓
            </button>
          </div>
        </div>
        
        <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
          <BellIcon class="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-500 text-sm">Aucune notification</p>
        </div>
      </div>
      
       <!-- Footer  -->
      <div v-if="notifications.length > 0" class="px-4 py-3 border-t border-gray-200">
        <router-link
          to="/notifications"
          @click="closeDropdown"
          class="block text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Voir toutes les notifications
        </router-link>
      </div>
    </div>
    
     <!-- Backdrop to close dropdown when clicking outside  -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BellIcon,
  DocumentTextIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import axios from '../utils/axios'

// Reactive state to control dropdown visibility
const isOpen = ref(false)
// Reactive state to store fetched notifications
const notifications = ref([])

/**
 * Computed property to count unread notifications.
 * @returns {number} The number of unread notifications.
 */
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read_at).length
})

/**
 * Toggles the dropdown menu visibility.
 * If opening, it also triggers a fetch of notifications.
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchNotifications()
  }
}

/**
 * Closes the dropdown menu.
 */
const closeDropdown = () => {
  isOpen.value = false
}

/**
 * Fetches notifications from the backend API.
 * Updates the `notifications` ref with the fetched data.
 */
const fetchNotifications = async () => {
  try {
    // Make a GET request to the notifications API endpoint
    // The Laravel controller returns all notifications under the 'all' key
    const response = await axios.get('/api/notifications') // Removed per_page as your controller doesn't seem to use it
    console.log('Notifications API response:', response.data);
    // Assign the 'all' array from the response to the notifications ref
    notifications.value = response.data.all || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

/**
 * Marks a specific notification as read on the backend and updates local state.
 * @param {string} id - The ID of the notification to mark as read.
 */
const markAsRead = async (id) => {
  try {
    // Send a POST request to mark the notification as read
    await axios.post(`/api/notifications/${id}/mark-as-read`)
    // Find the notification in the local array and update its read_at property
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read_at = new Date().toISOString()
    }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

/**
 * Marks all unread notifications as read on the backend and updates local state.
 */
const markAllAsRead = async () => {
  try {
    // Get IDs of all currently unread notifications
    const unreadIds = notifications.value.filter(n => !n.read_at).map(n => n.id)
    // Send parallel POST requests to mark each unread notification as read
    await Promise.all(unreadIds.map(id => axios.post(`/api/notifications/${id}/mark-as-read`)))
    // Update the read_at property for all previously unread notifications in the local array
    notifications.value.forEach(n => {
      if (!n.read_at) {
        n.read_at = new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

/**
 * Returns the appropriate Heroicons icon component based on the notification type.
 * @param {string} type - The type string of the notification (e.g., 'App\\Notifications\\NoteSubmitted').
 * @returns {object} The Vue component for the icon.
 */
const getNotificationIcon = (type) => {
  const icons = {
    'App\\Notifications\\NoteSubmitted': DocumentTextIcon,
    'App\\Notifications\\NoteValidated': CheckCircleIcon,
    'App\\Notifications\\NoteRejected': XCircleIcon,
    'App\\Notifications\\DeplacementSubmitted': TruckIcon,
    'App\\Notifications\\DeplacementValidated': CheckCircleIcon,
    'App\\Notifications\\DeplacementRejected': XCircleIcon
  }
  return icons[type] || BellIcon // Default to BellIcon if type is unknown
}

/**
 * Returns Tailwind CSS classes for the notification icon background and text color based on type.
 * @param {string} type - The type string of the notification.
 * @returns {string} Tailwind CSS classes.
 */
const getNotificationIconClass = (type) => {
  const classes = {
    'App\\Notifications\\NoteSubmitted': 'bg-blue-100 text-blue-600',
    'App\\Notifications\\NoteValidated': 'bg-green-100 text-green-600',
    'App\\Notifications\\NoteRejected': 'bg-red-100 text-red-600',
    'App\\Notifications\\DeplacementSubmitted': 'bg-purple-100 text-purple-600',
    'App\\Notifications\\DeplacementValidated': 'bg-green-100 text-green-600',
    'App\\Notifications\\DeplacementRejected': 'bg-red-100 text-red-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600' // Default classes
}

/**
 * Returns a human-readable title for the notification based on its type.
 * @param {string} type - The type string of the notification.
 * @returns {string} The notification title.
 */
const getNotificationTitle = (type) => {
  const titles = {
    'App\\Notifications\\NoteSubmitted': 'Note soumise',
    'App\\Notifications\\NoteValidated': 'Note validée',
    'App\\Notifications\\NoteRejected': 'Note rejetée',
    'App\\Notifications\\DeplacementSubmitted': 'Déplacement soumis',
    'App\\Notifications\\DeplacementValidated': 'Déplacement validé',
    'App\\Notifications\\DeplacementRejected': 'Déplacement rejeté'
  }
  return titles[type] || 'Notification' // Default title
}

/**
 * Formats a date string into a human-readable "time ago" format.
 * @param {string} date - The date string to format.
 * @returns {string} The formatted time ago string.
 */
const formatTimeAgo = (date) => {
  const now = new Date()
  const notificationDate = new Date(date)
  const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'À l\'instant'
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  
  return notificationDate.toLocaleDateString('fr-FR') // Fallback to full date for older notifications
}

/**
 * Event listener to close the dropdown when a click occurs outside of it.
 * @param {Event} event - The click event.
 */
const handleClickOutside = (event) => {
  // Check if the dropdown is open and the click is outside the dropdown's container
  if (isOpen.value && !event.target.closest('.relative')) {
    closeDropdown()
  }
}

// Lifecycle hook: Add event listener and fetch notifications when component is mounted
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchNotifications()
})

// Lifecycle hook: Remove event listener when component is unmounted to prevent memory leaks
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
