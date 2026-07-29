<template>
  <div class="space-y-6">
    <section>
      <p class="text-sm font-medium uppercase tracking-wide text-blue-2">Workspace</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-normal text-gray-1">Dashboard</h1>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <router-link
        to="/books"
        class="rounded-lg border border-black-4 bg-black-2 p-5 shadow-sm transition hover:border-blue-2 hover:shadow"
      >
        <p class="text-sm font-medium text-gray-2">Library</p>
        <h2 class="mt-2 text-xl font-semibold text-gray-1">Read books</h2>
        <p class="mt-3 text-sm leading-6 text-gray-2">3 active titles</p>
      </router-link>

      <router-link
        to="/books"
        class="rounded-lg border border-black-4 bg-black-2 p-5 shadow-sm transition hover:border-blue-2 hover:shadow"
      >
        <p class="text-sm font-medium text-gray-2">Writing</p>
        <h2 class="mt-2 text-xl font-semibold text-gray-1">Draft novels</h2>
        <p class="mt-3 text-sm leading-6 text-gray-2">Available to every account</p>
      </router-link>

      <router-link
        v-if="canApprovePromotions"
        to="/promotions"
        class="rounded-lg border border-black-4 bg-black-2 p-5 shadow-sm transition hover:border-blue-2 hover:shadow"
      >
        <p class="text-sm font-medium text-gray-2">Admin</p>
        <h2 class="mt-2 text-xl font-semibold text-gray-1">Promotion approvals</h2>
        <p class="mt-3 text-sm leading-6 text-gray-2">{{ promotionSummary }}</p>
      </router-link>
    </section>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import {
  getApiErrorMessage,
  listPromotionRequests,
  ROLE_REQUEST_STATUS
} from '@/api/roleRequests'
import { useAuthStore } from '@/store/auth'

export default {
  data () {
    return {
      pendingPromotionCount: null,
      promotionSummaryError: ''
    }
  },
  computed: {
    ...mapState(useAuthStore, ['canApprovePromotions']),
    promotionSummary () {
      if (this.promotionSummaryError) {
        return this.promotionSummaryError
      }

      if (this.pendingPromotionCount === null) {
        return 'Checking pending requests'
      }

      if (this.pendingPromotionCount === 1) {
        return '1 pending request'
      }

      return `${this.pendingPromotionCount} pending requests`
    }
  },
  mounted () {
    this.loadPendingPromotionCount()
  },
  methods: {
    async loadPendingPromotionCount () {
      if (!this.canApprovePromotions) {
        return
      }

      this.promotionSummaryError = ''

      try {
        const requests = await listPromotionRequests(ROLE_REQUEST_STATUS.PENDING)
        this.pendingPromotionCount = requests.length
      } catch (error) {
        this.promotionSummaryError = getApiErrorMessage(error, 'Could not load requests')
      }
    }
  }
}
</script>
