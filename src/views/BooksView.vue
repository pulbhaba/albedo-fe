<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-medium uppercase tracking-wide text-blue-2">Library</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-normal text-gray-1">Books</h1>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border border-black-4 bg-black-2 px-4 py-2 text-sm font-medium text-gray-1 hover:bg-black-3"
          @click="startDraft"
        >
          New manuscript
        </button>
        <button
          v-if="canPublishBooks"
          type="button"
          class="rounded-md bg-blue-2 px-4 py-2 text-sm font-medium text-white hover:bg-blue-1"
          @click="publishSelectedDraft"
        >
          Publish draft
        </button>
        <button
          v-else
          type="button"
          class="rounded-md bg-blue-2 px-4 py-2 text-sm font-medium text-white hover:bg-blue-1 disabled:cursor-not-allowed disabled:bg-blue-2/50"
          :disabled="roleRequestSubmitting || Boolean(pendingRoleRequest)"
          @click="requestEditorRole"
        >
          {{ editorRequestButtonLabel }}
        </button>
      </div>
    </section>

    <div
      v-if="activeNotice"
      class="rounded-lg border border-blue-2/30 bg-blue-2/10 px-4 py-3 text-sm font-medium text-blue-2"
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

    <section v-if="novelsLoading" class="rounded-lg border border-black-4 bg-black-2 p-6 text-gray-2">
      Loading books…
    </section>

    <section v-else-if="novelsError" class="rounded-lg border border-red-1/30 bg-red-1/10 p-6 text-red-1">
      <h2 class="text-xl font-semibold">Unable to load books</h2>
      <p class="mt-2">{{ novelsError }}</p>
      <button
        class="mt-4 rounded-md border border-red-1/40 px-3 py-2 text-sm font-medium hover:bg-red-1/10"
        type="button"
        @click="loadNovels"
      >
        Try again
      </button>
    </section>

    <section v-else-if="!books.length" class="rounded-lg border border-black-4 bg-black-2 p-6 text-gray-2">
      No books are available yet.
    </section>

    <section v-else class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <div class="space-y-3">
        <article
          v-for="book in books"
          :key="book.id"
          class="grid cursor-pointer grid-cols-[72px_minmax(0,1fr)] gap-4 rounded-lg border bg-black-2 p-3 shadow-sm transition hover:border-blue-2"
          :class="selectedBookId === book.id ? 'border-blue-2 ring-1 ring-blue-2/40' : 'border-black-4'"
          @click="selectedBookId = book.id"
        >
          <div
            class="flex aspect-[3/4] items-end rounded-md bg-cover bg-center p-2 text-xs font-semibold text-white"
            :style="{ backgroundImage: `url(${book.coverImageUrl})` }"
          >
            <span class="rounded bg-black-5/70 px-1">{{ book.title }}</span>
          </div>
          <div class="min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="truncate text-base font-semibold text-gray-1">{{ book.title }}</h2>
                <p class="mt-1 text-sm text-gray-2">{{ book.author }}</p>
              </div>
              <span class="rounded-full bg-black-3 px-2 py-1 text-xs font-medium text-gray-2">
                {{ book.status }}
              </span>
            </div>
            <p class="mt-3 text-sm leading-6 text-gray-2">By {{ book.author }}</p>
          </div>
        </article>
      </div>

      <article v-if="selectedBook" class="rounded-lg border border-black-4 bg-black-2 shadow-sm">
        <div class="border-b border-black-4 px-5 py-4">
          <p class="text-sm font-medium uppercase tracking-wide text-blue-2">{{ selectedBook.status }}</p>
          <h2 class="mt-1 text-2xl font-semibold tracking-normal text-gray-1">{{ selectedBook.title }}</h2>
          <p class="mt-1 text-sm text-gray-2">{{ selectedBook.author }}</p>
        </div>

        <div class="space-y-5 px-5 py-5">
          <div class="rounded-md bg-black-3 p-5">
            <p class="text-base leading-8 text-gray-1">This novel is available to read in the library.</p>
            <p class="mt-3 text-sm text-gray-2">Last updated {{ selectedBook.updatedAt }}</p>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm font-medium text-gray-2">Published {{ selectedBook.createdAt }}</p>
            <button
              type="button"
              class="rounded-md bg-blue-2 px-4 py-2 text-sm font-medium text-white hover:bg-blue-1"
              @click="continueReading"
            >
              Open novel
            </button>
          </div>
        </div>
      </article>
    </section>

    <section class="rounded-lg border border-black-4 bg-black-2 shadow-sm">
      <div class="border-b border-black-4 px-5 py-4">
        <h2 class="text-xl font-semibold tracking-normal text-gray-1">Manuscripts</h2>
      </div>

      <div class="divide-y divide-black-4">
        <article
          v-for="draft in drafts"
          :key="draft.id"
          class="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="font-semibold text-gray-1">{{ draft.title }}</h3>
            <p class="mt-1 text-sm text-gray-2">
              Updated {{ draft.updatedAt }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-black-3 px-3 py-1 text-xs font-medium text-gray-2">
              {{ draft.status }}
            </span>
            <button
              type="button"
              class="rounded-md border border-black-4 px-3 py-2 text-sm font-medium text-gray-1 hover:bg-black-3"
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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  createEditorRoleRequest,
  getApiErrorMessage,
  listMyRoleRequests,
  ROLE_REQUEST_STATUS,
  RoleRequest
} from '@/api/roleRequests'
import { getNovelsApiError, listNovels, Novel } from '@/api/novels'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const { canPublishBooks } = storeToRefs(authStore)

const selectedBookId = ref<string | number | null>(null)
const novels = ref<Novel[]>([])
const novelsLoading = ref(true)
const novelsError = ref('')
const activeNotice = ref('')
const roleRequests = ref<RoleRequest[]>([])
const roleRequestsLoading = ref(false)
const roleRequestSubmitting = ref(false)
const roleRequestError = ref('')

const books = computed(() => novels.value.filter((novel) => novel.status === 'published'))
const drafts = computed(() => novels.value.filter((novel) => novel.status === 'draft'))
const selectedBook = computed(() => {
  return books.value.find((book) => book.id === selectedBookId.value) || books.value[0] || null
})
const pendingRoleRequest = computed(() => {
  return roleRequests.value.find((request) => request.status === ROLE_REQUEST_STATUS.PENDING)
})
const latestRoleRequest = computed(() => roleRequests.value[0] || null)
const editorRequestButtonLabel = computed(() => {
  if (roleRequestSubmitting.value) {
    return 'Sending request'
  }

  if (pendingRoleRequest.value) {
    return 'Request pending'
  }

  return 'Request editor role'
})
const roleRequestMessage = computed(() => {
  if (canPublishBooks.value) {
    return ''
  }

  if (roleRequestsLoading.value) {
    return 'Checking editor role request status.'
  }

  if (roleRequestError.value) {
    return roleRequestError.value
  }

  if (pendingRoleRequest.value) {
    return 'Your editor role request is waiting for admin approval.'
  }

  if (latestRoleRequest.value?.status === ROLE_REQUEST_STATUS.REJECTED) {
    return 'Your latest editor role request was rejected. You can submit a new request.'
  }

  return ''
})
const roleRequestMessageClass = computed(() => {
  if (roleRequestError.value || latestRoleRequest.value?.status === ROLE_REQUEST_STATUS.REJECTED) {
    return 'border-red-1/30 bg-red-1/10 text-red-1'
  }

  return 'border-blue-2/30 bg-blue-2/10 text-blue-2'
})

function novelView (novel: Novel): Novel {
  return {
    ...novel,
    author: novel.author?.displayName || 'Unknown author'
  }
}

async function loadNovels () {
  novelsLoading.value = true
  novelsError.value = ''

  try {
    const page = await listNovels({ limit: 100 })
    novels.value = (page.items || []).map(novelView)
    selectedBookId.value = books.value[0]?.id || null
  } catch (error) {
    novels.value = []
    selectedBookId.value = null
    novelsError.value = getNovelsApiError(error)
  } finally {
    novelsLoading.value = false
  }
}

async function loadRoleRequests () {
  if (canPublishBooks.value) {
    return
  }

  roleRequestsLoading.value = true
  roleRequestError.value = ''

  try {
    roleRequests.value = await listMyRoleRequests()
  } catch (error) {
    roleRequestError.value = getApiErrorMessage(error, 'Could not load editor role request status.')
  } finally {
    roleRequestsLoading.value = false
  }
}

function continueReading () {
  router.push({ name: 'NovelReader', params: { novelId: selectedBook.value.id } })
}

function startDraft () {
  activeNotice.value = 'New manuscript started.'
}

function editDraft (draft: Novel): void {
  activeNotice.value = `${draft.title} opened for writing.`
}

function publishSelectedDraft () {
  activeNotice.value = 'Draft submitted for publishing.'
}

async function requestEditorRole () {
  if (pendingRoleRequest.value || roleRequestSubmitting.value) {
    return
  }

  roleRequestSubmitting.value = true
  roleRequestError.value = ''
  activeNotice.value = ''

  try {
    const request = await createEditorRoleRequest(
      'Requested publishing access from the books workspace.'
    )
    roleRequests.value = [request, ...roleRequests.value]
    activeNotice.value = 'Editor role request sent for admin approval.'
  } catch (error) {
    roleRequestError.value = getApiErrorMessage(error, 'Could not request editor role.')
  } finally {
    roleRequestSubmitting.value = false
  }
}

onMounted(() => {
  loadNovels()
  loadRoleRequests()
})
</script>
