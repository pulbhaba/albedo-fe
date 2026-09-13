<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-blue-2">Admin</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-normal text-gray-1">Promotion approvals</h1>
      </div>

      <div class="rounded-md border border-blue-2/30 bg-blue-2/10 px-4 py-2 text-sm font-medium text-blue-2">
        {{ pendingRequests.length }} pending
      </div>
    </section>

    <div
      v-if="errorMessage"
      class="rounded-lg border border-red-1/30 bg-red-1/10 px-4 py-3 text-sm font-medium text-red-1"
    >
      {{ errorMessage }}
    </div>

    <section class="overflow-hidden rounded-lg border border-black-4 bg-black-2 shadow-sm">
      <table class="min-w-full divide-y divide-black-4">
        <thead class="bg-black-3">
          <tr>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-2">User</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-2">Role</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-2">Evidence</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-2">Status</th>
            <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-2">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black-4 bg-black-2">
          <tr v-if="isLoading">
            <td colspan="5" class="px-5 py-8 text-center text-sm font-medium text-gray-2">
              Loading promotion requests.
            </td>
          </tr>
          <tr v-else-if="requests.length === 0">
            <td colspan="5" class="px-5 py-8 text-center text-sm font-medium text-gray-2">
              No role update requests yet.
            </td>
          </tr>
          <tr v-for="request in requests" :key="request.id">
            <td class="px-5 py-4 align-top">
              <p class="font-medium text-gray-1">{{ displayName(request) }}</p>
              <p class="mt-1 text-sm text-gray-2">{{ request.username }}</p>
            </td>
            <td class="px-5 py-4 align-top">
              <span class="rounded-full bg-blue-2/10 px-3 py-1 text-xs font-medium text-blue-2">
                {{ request.requestedRole }}
              </span>
            </td>
            <td class="max-w-md px-5 py-4 align-top text-sm leading-6 text-gray-2">
              {{ request.evidence }}
            </td>
            <td class="px-5 py-4 align-top">
              <span class="rounded-full px-3 py-1 text-xs font-medium" :class="statusClass(request.status)">
                {{ statusLabel(request.status) }}
              </span>
            </td>
            <td class="px-5 py-4 text-right align-top">
              <div v-if="request.status === 'PENDING'" class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded-md border border-black-4 px-3 py-2 text-sm font-medium text-gray-1 hover:bg-black-3 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="resolvingRequestId === request.id"
                  @click="rejectRequest(request)"
                >
                  Reject
                </button>
                <button
                  type="button"
                  class="rounded-md bg-blue-2 px-3 py-2 text-sm font-medium text-white hover:bg-blue-1 disabled:cursor-not-allowed disabled:bg-blue-2/50"
                  :disabled="resolvingRequestId === request.id"
                  @click="approveRequest(request)"
                >
                  Approve
                </button>
              </div>
              <p v-else class="text-sm text-gray-2">{{ resolvedLabel(request) }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  approvePromotionRequest,
  getApiErrorMessage,
  listPromotionRequests,
  rejectPromotionRequest,
  ROLE_REQUEST_STATUS
} from '@/api/roleRequests'

const requests = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const resolvingRequestId = ref(null)

const pendingRequests = computed(() => {
  return requests.value.filter((request) => request.status === ROLE_REQUEST_STATUS.PENDING)
})

async function loadRequests () {
  isLoading.value = true
  errorMessage.value = ''

  try {
    requests.value = await listPromotionRequests()
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Could not load promotion requests.')
  } finally {
    isLoading.value = false
  }
}

async function approveRequest (request) {
  await resolveRequest(request, approvePromotionRequest, 'Approved from promotion queue.')
}

async function rejectRequest (request) {
  await resolveRequest(request, rejectPromotionRequest, 'Rejected from promotion queue.')
}

async function resolveRequest (request, action, reason) {
  if (resolvingRequestId.value) {
    return
  }

  resolvingRequestId.value = request.id
  errorMessage.value = ''

  try {
    const updatedRequest = await action(request.id, reason)
    replaceRequest(updatedRequest)
  } catch (error) {
    errorMessage.value = getApiErrorMessage(error, 'Could not resolve promotion request.')
  } finally {
    resolvingRequestId.value = null
  }
}

function replaceRequest (updatedRequest) {
  requests.value = requests.value.map((request) =>
    request.id === updatedRequest.id ? updatedRequest : request
  )
}

function displayName (request) {
  return [request.firstName, request.lastName].filter(Boolean).join(' ') || request.username
}

function statusLabel (status) {
  if (!status) {
    return ''
  }

  return status.charAt(0) + status.slice(1).toLowerCase()
}

function resolvedLabel (request) {
  if (!request.resolvedAt) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(request.resolvedAt))
}

function statusClass (status) {
  if (status === ROLE_REQUEST_STATUS.APPROVED) {
    return 'bg-blue-2/10 text-blue-2'
  }

  if (status === ROLE_REQUEST_STATUS.REJECTED) {
    return 'bg-red-1/10 text-red-1'
  }

  return 'bg-black-3 text-gray-2'
}

onMounted(loadRequests)
</script>
