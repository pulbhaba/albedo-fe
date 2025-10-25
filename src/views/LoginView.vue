<template>
  <div class="flex items-center justify-center min-h-screen bg-black-1 text-gray-1">
    <div class="w-full max-w-lg p-8 bg-black-2 shadow-card rounded-xl">
      <!-- SVG Logo Above Title -->
      <div class="flex justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="text-blue-2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3v18h18V3H3zm0 0l9 9 9-9M3 21l9-9 9 9"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2 class="text-3xl font-bold text-center mb-6 text-gray-1">{{ $t('login.title') }}</h2>

      <!-- Error Message Display -->
      <div v-if="errorMessage" class="mb-4 p-4 bg-red-1/10 text-red-1 rounded-lg border border-red-1/30">
        <p>{{ $t('login.errorMessage') }}</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin">
        <div class="mb-5">
          <label for="username" class="block text-sm font-medium text-gray-2 mb-2">{{ $t('login.email') }}</label>
          <input
            id="username"
            v-model="username"
            type="email"
            class="w-full px-4 py-2 border border-black-4 rounded-lg bg-black-3 text-gray-1 focus:outline-none focus:ring-2 focus:ring-blue-2/40"
            placeholder="you@example.com"
            required
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-2 mb-2">{{ $t('login.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-4 py-2 border border-black-4 rounded-lg bg-black-3 text-gray-1 focus:outline-none focus:ring-2 focus:ring-blue-2/40"
            :placeholder="$t('login.passwordPrompt')"
            required
          />
        </div>

        <!-- Buttons Section -->
        <div class="flex justify-between items-center">
          <button
            type="submit"
            class="py-3 px-6 text-gray-1 bg-blue-2 rounded-lg hover:bg-blue-1 focus:outline-none focus:ring-4 focus:ring-blue-2/40"
          >
            {{ $t('login.loginBtn') }}
          </button>
          <button
            type="button"
            @click="forgotPassword"
            class="text-sm text-blue-2 hover:text-blue-3 focus:outline-none"
          >
            {{ $t('login.forgotPassword') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia'
import { useAuthStore } from '@/store/auth'

export default {
  data () {
    return {
      username: '',
      password: '',
      errorMessage: null
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['login']),
    async handleLogin () {
      try {
        const credentials = {
          username: this.username,
          password: this.password
        }

        // Make API call to authenticate user
        await this.login(credentials)

        // After successful login, redirect to dashboard or home page
        this.$router.push('/dashboard')
      } catch (error) {
        // Handle error (e.g., invalid credentials)
        this.errorMessage = this.$t('login.errorMessage')
      }
    },
    forgotPassword () {
      // Handle "Forgot Password" logic (e.g., navigate to password reset page)
      this.$router.push('/forgot-password')
    }
  }
}
</script>

<style scoped>
/* Optional custom styles to enhance form appearance */
</style>
