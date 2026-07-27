<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-amber-700">Admin</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Promotion approvals</h1>
      </div>

      <div class="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900">
        {{ pendingRequests.length }} pending
      </div>
    </section>

    <div
      v-if="errorMessage"
      class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-900"
    >
      {{ errorMessage }}
    </div>

    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence</th>
            <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
            <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-if="isLoading">
            <td colspan="5" class="px-5 py-8 text-center text-sm font-medium text-slate-500">
              Loading promotion requests.
            </td>
          </tr>
          <tr v-else-if="requests.length === 0">
            <td colspan="5" class="px-5 py-8 text-center text-sm font-medium text-slate-500">
              No role update requests yet.
            </td>
          </tr>
          <tr v-for="request in requests" :key="request.id">
            <td class="px-5 py-4 align-top">
              <p class="font-medium text-slate-950">{{ displayName(request) }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ request.username }}</p>
            </td>
            <td class="px-5 py-4 align-top">
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                {{ request.requestedRole }}
              </span>
            </td>
            <td class="max-w-md px-5 py-4 align-top text-sm leading-6 text-slate-600">
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
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="resolvingRequestId === request.id"
                  @click="rejectRequest(request)"
                >
                  Reject
                </button>
                <button
                  type="button"
                  class="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  :disabled="resolvingRequestId === request.id"
                  @click="approveRequest(request)"
                >
                  Approve
                </button>
              </div>
              <p v-else class="text-sm text-slate-500">{{ resolvedLabel(request) }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import {
  approvePromotionRequest,
  getApiErrorMessage,
  listPromotionRequests,
  rejectPromotionRequest,
  ROLE_REQUEST_STATUS,
} from '@/api/roleRequests';

export default {
  name: 'PromotionApprovalsView',
  data() {
    return {
      requests: [],
      isLoading: false,
      errorMessage: '',
      resolvingRequestId: null,
    };
  },
  computed: {
    pendingRequests() {
      return this.requests.filter((request) => request.status === ROLE_REQUEST_STATUS.PENDING);
    },
  },
  mounted() {
    this.loadRequests();
  },
  methods: {
    async loadRequests() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        this.requests = await listPromotionRequests();
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, 'Could not load promotion requests.');
      } finally {
        this.isLoading = false;
      }
    },
    async approveRequest(request) {
      await this.resolveRequest(request, approvePromotionRequest, 'Approved from promotion queue.');
    },
    async rejectRequest(request) {
      await this.resolveRequest(request, rejectPromotionRequest, 'Rejected from promotion queue.');
    },
    async resolveRequest(request, action, reason) {
      if (this.resolvingRequestId) {
        return;
      }

      this.resolvingRequestId = request.id;
      this.errorMessage = '';

      try {
        const updatedRequest = await action(request.id, reason);
        this.replaceRequest(updatedRequest);
      } catch (error) {
        this.errorMessage = getApiErrorMessage(error, 'Could not resolve promotion request.');
      } finally {
        this.resolvingRequestId = null;
      }
    },
    replaceRequest(updatedRequest) {
      this.requests = this.requests.map((request) =>
        request.id === updatedRequest.id ? updatedRequest : request
      );
    },
    displayName(request) {
      return [request.firstName, request.lastName].filter(Boolean).join(' ') || request.username;
    },
    statusLabel(status) {
      if (!status) {
        return '';
      }

      return status.charAt(0) + status.slice(1).toLowerCase();
    },
    resolvedLabel(request) {
      if (!request.resolvedAt) {
        return '';
      }

      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(request.resolvedAt));
    },
    statusClass(status) {
      if (status === ROLE_REQUEST_STATUS.APPROVED) {
        return 'bg-emerald-50 text-emerald-800';
      }

      if (status === ROLE_REQUEST_STATUS.REJECTED) {
        return 'bg-rose-50 text-rose-800';
      }

      return 'bg-amber-50 text-amber-800';
    },
  },
};
</script>
