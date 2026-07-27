<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-emerald-700">Library</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Books</h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          @click="startDraft"
        >
          New manuscript
        </button>
        <button
          v-if="canPublishBooks"
          type="button"
          class="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          @click="publishSelectedDraft"
        >
          Publish draft
        </button>
        <button
          v-else
          type="button"
          class="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-300"
          :disabled="roleRequestSubmitting || Boolean(pendingRoleRequest)"
          @click="requestEditorRole"
        >
          {{ editorRequestButtonLabel }}
        </button>
      </div>
    </section>

    <div
      v-if="activeNotice"
      class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
    >
      {{ activeNotice }}
    </div>

    <div
      v-if="roleRequestMessage"
      class="rounded-lg border px-4 py-3 text-sm font-medium"
      :class="roleRequestMessageClass"
    >
      {{ roleRequestMessage }}
    </div>

    <section class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <div class="space-y-3">
        <article
          v-for="book in books"
          :key="book.id"
          class="grid cursor-pointer grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-lg border bg-white p-3 shadow-sm transition hover:border-emerald-300"
          :class="selectedBookId === book.id ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-200'"
          @click="selectedBookId = book.id"
        >
          <div
            class="flex aspect-[3/4] items-end rounded-md bg-gradient-to-br p-2 text-xs font-semibold text-white"
            :class="book.coverClass"
          >
            {{ book.shortTitle }}
          </div>
          <div class="min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="truncate text-base font-semibold text-slate-950">{{ book.title }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ book.author }}</p>
              </div>
              <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {{ book.status }}
              </span>
            </div>
            <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{{ book.summary }}</p>
            <div class="mt-4 h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-emerald-600" :style="{ width: `${book.progress}%` }"></div>
            </div>
          </div>
        </article>
      </div>

      <article class="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-5 py-4">
          <p class="text-sm font-medium text-slate-500">{{ selectedBook.genre }}</p>
          <h2 class="mt-1 text-2xl font-semibold tracking-normal text-slate-950">{{ selectedBook.title }}</h2>
          <p class="mt-1 text-sm text-slate-500">{{ selectedBook.author }}</p>
        </div>

        <div class="space-y-5 px-5 py-5">
          <div class="rounded-md bg-stone-100 p-5">
            <p class="text-base leading-8 text-slate-800">{{ selectedBook.excerpt }}</p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-500">{{ selectedBook.progress }}% read</p>
            <button
              type="button"
              class="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              @click="continueReading"
            >
              Continue reading
            </button>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-5 py-4">
        <h2 class="text-xl font-semibold tracking-normal text-slate-950">Manuscripts</h2>
      </div>

      <div class="divide-y divide-slate-200">
        <article
          v-for="draft in drafts"
          :key="draft.id"
          class="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="font-semibold text-slate-950">{{ draft.title }}</h3>
            <p class="mt-1 text-sm text-slate-500">
              {{ draft.words.toLocaleString() }} words &middot; {{ draft.updated }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {{ draft.status }}
            </span>
            <button
              type="button"
              class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              @click="editDraft(draft)"
            >
              Write
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import {
  createEditorRoleRequest,
  getApiErrorMessage,
  listMyRoleRequests,
  ROLE_REQUEST_STATUS,
} from '@/api/roleRequests';
import { useAuthStore } from '@/store/auth';

export default {
  name: 'BooksView',
  data() {
    return {
      selectedBookId: 1,
      activeNotice: '',
      roleRequests: [],
      roleRequestsLoading: false,
      roleRequestSubmitting: false,
      roleRequestError: '',
      books: [
        {
          id: 1,
          title: 'The Lantern Archive',
          shortTitle: 'LA',
          author: 'Maya Senanayake',
          genre: 'Literary fantasy',
          status: 'Published',
          progress: 64,
          coverClass: 'from-emerald-800 to-teal-500',
          summary: 'A city archivist finds a sealed room where unfinished lives are catalogued by lamplight.',
          excerpt:
            'The archive woke before the city did. Lamps clicked on in their brass cages, one by one, until the hall became a river of warm light and paper dust. Nila pressed her palm to the oldest drawer and felt it answer with a pulse.',
        },
        {
          id: 2,
          title: 'A Map of Quiet Seas',
          shortTitle: 'QS',
          author: 'Jon Bell',
          genre: 'Adventure',
          status: 'Published',
          progress: 18,
          coverClass: 'from-sky-700 to-cyan-500',
          summary: 'Two cartographers cross a windless ocean that refuses to stay mapped.',
          excerpt:
            'By noon the compass had chosen east, then north, then the precise direction of a memory Mara had never told anyone. The sea around them stayed flat as polished glass, reflecting a sky without clouds or mercy.',
        },
        {
          id: 3,
          title: 'The Orchard After Rain',
          shortTitle: 'OR',
          author: 'Leena Arul',
          genre: 'Contemporary',
          status: 'Published',
          progress: 91,
          coverClass: 'from-amber-700 to-rose-500',
          summary: 'A family returns to an abandoned orchard and negotiates what should be preserved.',
          excerpt:
            'Rainwater gathered in the cracked steps like small mirrors. Every branch in the orchard held a bead of light, and for the first time in twenty years, Kavish could name the place without lowering his voice.',
        },
      ],
      drafts: [
        {
          id: 'draft-1',
          title: 'Untitled rainfall chapter',
          status: 'Draft',
          words: 4280,
          updated: 'Updated today',
        },
        {
          id: 'draft-2',
          title: 'Chapter 4: The Glass Road',
          status: 'Ready for review',
          words: 12140,
          updated: 'Updated yesterday',
        },
      ],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canPublishBooks']),
    selectedBook() {
      return this.books.find((book) => book.id === this.selectedBookId) || this.books[0];
    },
    pendingRoleRequest() {
      return this.roleRequests.find((request) => request.status === ROLE_REQUEST_STATUS.PENDING);
    },
    latestRoleRequest() {
      return this.roleRequests[0] || null;
    },
    editorRequestButtonLabel() {
      if (this.roleRequestSubmitting) {
        return 'Sending request';
      }

      if (this.pendingRoleRequest) {
        return 'Request pending';
      }

      return 'Request editor role';
    },
    roleRequestMessage() {
      if (this.canPublishBooks) {
        return '';
      }

      if (this.roleRequestsLoading) {
        return 'Checking editor role request status.';
      }

      if (this.roleRequestError) {
        return this.roleRequestError;
      }

      if (this.pendingRoleRequest) {
        return 'Your editor role request is waiting for admin approval.';
      }

      if (this.latestRoleRequest?.status === ROLE_REQUEST_STATUS.REJECTED) {
        return 'Your latest editor role request was rejected. You can submit a new request.';
      }

      return '';
    },
    roleRequestMessageClass() {
      if (this.roleRequestError || this.latestRoleRequest?.status === ROLE_REQUEST_STATUS.REJECTED) {
        return 'border-rose-200 bg-rose-50 text-rose-900';
      }

      return 'border-amber-200 bg-amber-50 text-amber-900';
    },
  },
  mounted() {
    this.loadRoleRequests();
  },
  methods: {
    async loadRoleRequests() {
      if (this.canPublishBooks) {
        return;
      }

      this.roleRequestsLoading = true;
      this.roleRequestError = '';

      try {
        this.roleRequests = await listMyRoleRequests();
      } catch (error) {
        this.roleRequestError = getApiErrorMessage(error, 'Could not load editor role request status.');
      } finally {
        this.roleRequestsLoading = false;
      }
    },
    continueReading() {
      this.activeNotice = `Opened ${this.selectedBook.title}.`;
    },
    startDraft() {
      this.activeNotice = 'New manuscript started.';
    },
    editDraft(draft) {
      this.activeNotice = `${draft.title} opened for writing.`;
    },
    publishSelectedDraft() {
      this.activeNotice = 'Draft submitted for publishing.';
    },
    async requestEditorRole() {
      if (this.pendingRoleRequest || this.roleRequestSubmitting) {
        return;
      }

      this.roleRequestSubmitting = true;
      this.roleRequestError = '';
      this.activeNotice = '';

      try {
        const request = await createEditorRoleRequest(
          'Requested publishing access from the books workspace.'
        );
        this.roleRequests = [request, ...this.roleRequests];
        this.activeNotice = 'Editor role request sent for admin approval.';
      } catch (error) {
        this.roleRequestError = getApiErrorMessage(error, 'Could not request editor role.');
      } finally {
        this.roleRequestSubmitting = false;
      }
    },
  },
};
</script>
