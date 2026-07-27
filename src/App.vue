<template>
  <router-view v-if="!isAuthenticated" />
  <div v-else class="min-h-screen bg-stone-50 text-slate-950">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <router-link to="/books" class="text-xl font-semibold tracking-normal text-slate-950">
            Siththara
          </router-link>
          <p class="text-sm text-slate-500">{{ username }}</p>
        </div>

        <nav class="flex flex-wrap items-center gap-2">
          <router-link
            to="/books"
            class="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            active-class="bg-emerald-50 text-emerald-800"
          >
            Books
          </router-link>
          <router-link
            to="/dashboard"
            class="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            active-class="bg-emerald-50 text-emerald-800"
          >
            Dashboard
          </router-link>
          <router-link
            v-if="canApprovePromotions"
            to="/promotions"
            class="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            active-class="bg-emerald-50 text-emerald-800"
          >
            Promotions
          </router-link>
          <button
            type="button"
            class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
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
import { mapActions, mapState } from 'pinia';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'App',
  computed: {
    ...mapState(useAuthStore, ['isAuthenticated', 'username', 'canApprovePromotions']),
  },
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    async handleLogout() {
      await this.logout();
      this.$router.push('/login');
    },
  },
};
</script>
