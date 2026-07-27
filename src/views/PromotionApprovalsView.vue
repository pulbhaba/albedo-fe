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
          <tr v-for="request in requests" :key="request.id">
            <td class="px-5 py-4 align-top">
              <p class="font-medium text-slate-950">{{ request.name }}</p>
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
                {{ request.status }}
              </span>
            </td>
            <td class="px-5 py-4 text-right align-top">
              <div v-if="request.status === 'Pending'" class="flex justify-end gap-2">
                <button
                  type="button"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  @click="rejectRequest(request)"
                >
                  Reject
                </button>
                <button
                  type="button"
                  class="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                  @click="approveRequest(request)"
                >
                  Approve
                </button>
              </div>
              <p v-else class="text-sm text-slate-500">{{ request.resolvedAt }}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
export default {
  name: 'PromotionApprovalsView',
  data() {
    return {
      requests: [
        {
          id: 101,
          name: 'Anjali Perera',
          username: 'anjali',
          requestedRole: 'ROLE_EDITOR',
          evidence: 'Completed two novel drafts and requested publishing access for serialized releases.',
          status: 'Pending',
          resolvedAt: '',
        },
        {
          id: 102,
          name: 'Kavin Silva',
          username: 'kavin',
          requestedRole: 'ROLE_EDITOR',
          evidence: 'Maintains a reviewed manuscript with chapters marked ready for publication.',
          status: 'Pending',
          resolvedAt: '',
        },
        {
          id: 103,
          name: 'Mina Dias',
          username: 'mina',
          requestedRole: 'ROLE_EDITOR',
          evidence: 'Requested editor access after a previous manuscript review.',
          status: 'Approved',
          resolvedAt: 'Resolved today',
        },
      ],
    };
  },
  computed: {
    pendingRequests() {
      return this.requests.filter((request) => request.status === 'Pending');
    },
  },
  methods: {
    approveRequest(request) {
      request.status = 'Approved';
      request.resolvedAt = 'Resolved now';
    },
    rejectRequest(request) {
      request.status = 'Rejected';
      request.resolvedAt = 'Resolved now';
    },
    statusClass(status) {
      if (status === 'Approved') {
        return 'bg-emerald-50 text-emerald-800';
      }

      if (status === 'Rejected') {
        return 'bg-rose-50 text-rose-800';
      }

      return 'bg-amber-50 text-amber-800';
    },
  },
};
</script>
