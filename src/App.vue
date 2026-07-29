<template>
  <router-view v-if="!isAuthenticated" />
  <div v-else class="min-h-screen bg-black-1 text-gray-1">
    <header class="border-b border-black-4 bg-black-2">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <router-link to="/books" class="text-xl font-semibold tracking-normal text-gray-1">
            Siththara
          </router-link>
          <p class="text-sm text-gray-2">{{ username }}</p>
        </div>

        <nav class="flex flex-wrap items-center gap-2">
          <router-link
            to="/books"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-2 hover:bg-black-3 hover:text-gray-1"
            active-class="bg-blue-2/10 text-blue-2"
          >
            Books
          </router-link>
          <router-link
            to="/dashboard"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-2 hover:bg-black-3 hover:text-gray-1"
            active-class="bg-blue-2/10 text-blue-2"
          >
            Dashboard
          </router-link>
          <router-link
            v-if="canApprovePromotions"
            to="/promotions"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-2 hover:bg-black-3 hover:text-gray-1"
            active-class="bg-blue-2/10 text-blue-2"
          >
            Promotions
          </router-link>
          <button
            type="button"
            class="rounded-md border border-black-4 px-3 py-2 text-sm font-medium text-gray-1 hover:bg-black-3"
            @click="handleLogout"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'App',
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'username', 'canApprovePromotions'])
  },
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    async handleLogout () {
      await this.logout()
      this.$router.push('/login')
    }
  }
}
</script>
