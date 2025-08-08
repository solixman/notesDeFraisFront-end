<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full text-center">
      <div class="card p-8">
        <div class="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <span class="text-2xl font-bold text-gray-600">404</span>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
        <p class="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <router-link
          to="/dashboard"
          class="btn-primary"
        >
          Retour au tableau de bord
        </router-link>
      </div>
    </div>
  </div>
</template>
