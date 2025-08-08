<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75 p-4">
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          Visualisation du justificatif: {{ fileName }}
        </h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <div class="flex-1 p-4 overflow-auto flex items-center justify-center bg-gray-50">
        <template v-if="fileUrl">
          <img v-if="isImage" :src="fileUrl" :alt="fileName" class="max-w-full max-h-full object-contain" />
          <iframe v-else-if="isPdf" :src="fileUrl" class="w-[800px] h-[600px] border-none" title="Justificatif PDF"></iframe>
          <div v-else class="text-center text-gray-600">
            <ExclamationCircleIcon class="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <p>Type de fichier non pris en charge pour la prévisualisation.</p>
            <p class="text-sm">Veuillez télécharger le fichier pour le visualiser.</p>
          </div>
        </template>
        <div v-else class="text-center text-gray-600">
          <DocumentMagnifyingGlassIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p>Chargement du fichier...</p>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 flex justify-end space-x-3">
        <a
          v-if="fileUrl"
          :href="fileUrl"
          :download="fileName"
          class="btn-primary"
        >
          <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
          Télécharger
        </a>
        <button @click="closeModal" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ExclamationCircleIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: 'justificatif'
  }
})

const emit = defineEmits(['update:show', 'close'])

const isImage = computed(() => {
  const lowerCaseFileName = props.fileName.toLowerCase()
  return lowerCaseFileName.endsWith('.jpg') || 
         lowerCaseFileName.endsWith('.jpeg') || 
         lowerCaseFileName.endsWith('.png') || 
         lowerCaseFileName.endsWith('.gif') ||
         lowerCaseFileName.endsWith('.webp');
})

const isPdf = computed(() => {
  return props.fileName.toLowerCase().endsWith('.pdf');
})

const closeModal = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<style scoped>
iframe {
  width: 100%;
  height: 100%;
}
</style>
