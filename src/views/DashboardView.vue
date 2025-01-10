<template>
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-4xl font-bold mb-6">Welcome to Siththara Dashboard</h1>
    <p class="text-lg">Here you can manage your comics, view stats, and more.</p>
    <button @click="handleLogout" class="btn-primary mt-4">Logout</button>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.logout();
      this.$router.push('/login');
    },
  },
};
</script>