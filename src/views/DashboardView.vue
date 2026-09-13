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

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  getApiErrorMessage,
  listPromotionRequests,
  ROLE_REQUEST_STATUS
} from '@/api/roleRequests'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const { canApprovePromotions } = storeToRefs(authStore)

const pendingPromotionCount = ref(null)
const promotionSummaryError = ref('')

const promotionSummary = computed(() => {
  if (promotionSummaryError.value) {
    return promotionSummaryError.value
  }

  if (pendingPromotionCount.value === null) {
    return 'Checking pending requests'
  }

  if (pendingPromotionCount.value === 1) {
    return '1 pending request'
  }

  return `${pendingPromotionCount.value} pending requests`
})

async function loadPendingPromotionCount () {
  if (!canApprovePromotions.value) {
    return
  }

  promotionSummaryError.value = ''

  try {
    const requests = await listPromotionRequests(ROLE_REQUEST_STATUS.PENDING)
    pendingPromotionCount.value = requests.length
  } catch (error) {
    promotionSummaryError.value = getApiErrorMessage(error, 'Could not load requests')
  }
}

onMounted(() => {
  loadPendingPromotionCount()
})
</script>
