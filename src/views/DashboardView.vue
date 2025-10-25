<template>
  <div class="min-h-screen bg-black-1 text-gray-1">
    <div class="max-w-7xl mx-auto p-4">
      <h1 class="text-4xl font-bold mb-6">Welcome to Siththara Dashboard</h1>
      <p class="text-lg text-gray-2">Here you can manage your comics, view stats, and more.</p>
      <button
        @click="handleLogout"
        class="mt-4 px-6 py-3 bg-blue-2 text-gray-1 rounded-lg hover:bg-blue-1 focus:outline-none focus:ring-4 focus:ring-blue-2/40 transition"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useAuthStore } from '@/store/auth'

export default {
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    handleLogout () {
      this.logout()
      this.$router.push('/login')
    }
  }
}
</script>
