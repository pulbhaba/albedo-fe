<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <router-link to="/books" class="inline-flex text-sm font-medium text-blue-2 hover:text-blue-1">
      Back to books
    </router-link>

    <section v-if="loading" class="rounded-lg border border-black-4 bg-black-2 p-6 text-gray-2" aria-live="polite">
      Loading manuscript…
    </section>

    <section v-else-if="forbidden" class="rounded-lg border border-red-1/30 bg-red-1/10 p-6 text-red-1" role="alert">
      <p class="text-sm font-medium uppercase tracking-wide">Access denied</p>
      <h1 class="mt-2 text-2xl font-semibold text-gray-1">You cannot edit this manuscript</h1>
      <p class="mt-2">Only the manuscript owner can edit its draft details and content.</p>
      <router-link to="/books" class="mt-4 inline-flex font-medium text-blue-2 hover:text-blue-1">
        Return to books
      </router-link>
    </section>

    <section v-else-if="errorMessage" class="rounded-lg border border-red-1/30 bg-red-1/10 p-6 text-red-1" role="alert">
      <h1 class="text-xl font-semibold">Unable to open this manuscript</h1>
      <p class="mt-2">{{ errorMessage }}</p>
      <button
        class="mt-4 rounded-md border border-red-1/40 px-3 py-2 text-sm font-medium hover:bg-red-1/10"
        type="button"
        @click="loadManuscript"
      >
        Try again
      </button>
    </section>

    <section v-else-if="novel && !isDraft" class="rounded-lg border border-black-4 bg-black-2 p-6">
      <p class="text-sm font-medium uppercase tracking-wide text-blue-2">{{ novel.status }}</p>
      <h1 class="mt-2 text-2xl font-semibold text-gray-1">This manuscript is read-only</h1>
      <p class="mt-2 text-gray-2">Only draft manuscripts can be edited.</p>
    </section>

    <template v-else-if="novel">
      <header>
        <p class="text-sm font-medium uppercase tracking-wide text-blue-2">Draft manuscript</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-normal text-gray-1">{{ novel.title }}</h1>
        <p class="mt-2 text-gray-2">Edit the manuscript details and its first chapter.</p>
      </header>

      <section class="rounded-lg border border-black-4 bg-black-2 shadow-sm">
        <div class="border-b border-black-4 px-5 py-4">
          <h2 class="text-xl font-semibold text-gray-1">Manuscript details</h2>
        </div>
        <form class="space-y-4 p-5" @submit.prevent="saveMetadata">
          <label class="block text-sm font-medium text-gray-2">
            Title
            <input
              v-model="draftTitle"
              class="mt-2 w-full rounded-md border border-black-4 bg-black-1 px-3 py-2 text-gray-1"
              maxlength="255"
              required
            >
          </label>
          <label class="block text-sm font-medium text-gray-2">
            ISBN <span class="font-normal">(optional)</span>
            <input
              v-model="draftIsbn"
              class="mt-2 w-full rounded-md border border-black-4 bg-black-1 px-3 py-2 text-gray-1"
              maxlength="32"
            >
          </label>
          <p v-if="metadataError" class="text-sm text-red-1" role="alert">{{ metadataError }}</p>
          <p v-if="metadataSaved" class="text-sm text-green-1" role="status">Manuscript details saved.</p>
          <button
            type="submit"
            class="rounded-md bg-blue-2 px-4 py-2 text-sm font-medium text-white hover:bg-blue-1 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="metadataSaving || !draftTitle.trim() || !metadataDirty"
          >
            {{ metadataSaving ? 'Saving…' : 'Save details' }}
          </button>
        </form>
      </section>

      <section class="rounded-lg border border-black-4 bg-black-2 shadow-sm">
        <div class="border-b border-black-4 px-5 py-4">
          <p class="text-sm font-medium uppercase tracking-wide text-blue-2">Chapter 1</p>
          <h2 class="mt-1 text-xl font-semibold text-gray-1">Manuscript content</h2>
        </div>
        <form class="space-y-4 p-5" @submit.prevent="saveContent">
          <label for="chapter-body" class="block text-sm font-medium text-gray-2">Chapter text</label>
          <textarea
            id="chapter-body"
            v-model="chapterBody"
            class="min-h-80 w-full resize-y rounded-md border border-black-4 bg-black-1 px-3 py-2 text-gray-1"
            placeholder="Start writing your first chapter…"
            rows="16"
          />
          <p v-if="contentError" class="text-sm text-red-1" role="alert">{{ contentError }}</p>
          <p v-if="contentSaved" class="text-sm text-green-1" role="status">Chapter content saved.</p>
          <button
            type="submit"
            class="rounded-md bg-blue-2 px-4 py-2 text-sm font-medium text-white hover:bg-blue-1 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="contentSaving || !contentDirty"
          >
            {{ contentSaving ? 'Saving…' : 'Save chapter' }}
          </button>
        </form>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getChapterContent,
  getNovel,
  getNovelApiError,
  isNovelForbiddenError,
  isNovelNotFoundError,
  Novel,
  saveChapterContent,
  updateNovel
} from '@/api/novels'

// The novels API does not expose chapter discovery or creation yet.
const FIRST_CHAPTER_ID = 'chapter-1'

const route = useRoute()
const novel = ref<Novel | null>(null)
const draftTitle = ref('')
const draftIsbn = ref('')
const chapterBody = ref('')
const savedChapterBody = ref('')
const loading = ref(true)
const forbidden = ref(false)
const errorMessage = ref('')
const metadataSaving = ref(false)
const metadataError = ref('')
const metadataSaved = ref(false)
const contentSaving = ref(false)
const contentError = ref('')
const contentSaved = ref(false)

const isDraft = computed(() => novel.value?.status.toLowerCase() === 'draft')
const metadataDirty = computed(() => {
  return Boolean(novel.value) && (
    draftTitle.value.trim() !== novel.value?.title ||
    (draftIsbn.value.trim() || null) !== (novel.value?.isbn || null)
  )
})
const contentDirty = computed(() => chapterBody.value !== savedChapterBody.value)

async function loadManuscript (): Promise<void> {
  loading.value = true
  forbidden.value = false
  errorMessage.value = ''
  metadataError.value = ''
  contentError.value = ''
  metadataSaved.value = false
  contentSaved.value = false
  novel.value = null

  try {
    const novelId = String(route.params.novelId)
    const loadedNovel = await getNovel(novelId)
    novel.value = loadedNovel
    draftTitle.value = loadedNovel.title
    draftIsbn.value = loadedNovel.isbn || ''

    if (loadedNovel.status.toLowerCase() !== 'draft') {
      return
    }

    try {
      const chapter = await getChapterContent(novelId, FIRST_CHAPTER_ID)
      chapterBody.value = chapter.body || ''
    } catch (error) {
      if (!isNovelNotFoundError(error)) {
        throw error
      }

      // The chapter API returns 404 until its first content save.
      chapterBody.value = ''
    }
    savedChapterBody.value = chapterBody.value
  } catch (error) {
    if (isNovelForbiddenError(error)) {
      forbidden.value = true
    } else {
      errorMessage.value = getNovelApiError(error, 'Could not load this manuscript.')
    }
  } finally {
    loading.value = false
  }
}

async function saveMetadata (): Promise<void> {
  if (!novel.value || !metadataDirty.value || metadataSaving.value) {
    return
  }

  metadataSaving.value = true
  metadataError.value = ''
  metadataSaved.value = false
  const title = draftTitle.value.trim()
  const isbn = draftIsbn.value.trim() || null

  try {
    const updatedNovel = await updateNovel(String(route.params.novelId), { title, isbn })
    novel.value = {
      ...novel.value,
      ...updatedNovel,
      title: updatedNovel.title || title,
      isbn: updatedNovel.isbn === undefined ? isbn : updatedNovel.isbn
    }
    draftTitle.value = novel.value.title
    draftIsbn.value = novel.value.isbn || ''
    metadataSaved.value = true
  } catch (error) {
    if (isNovelForbiddenError(error)) {
      forbidden.value = true
    } else {
      metadataError.value = getNovelApiError(error, 'Could not save manuscript details.')
    }
  } finally {
    metadataSaving.value = false
  }
}

async function saveContent (): Promise<void> {
  if (!novel.value || !contentDirty.value || contentSaving.value) {
    return
  }

  contentSaving.value = true
  contentError.value = ''
  contentSaved.value = false

  try {
    const chapter = await saveChapterContent(
      String(route.params.novelId),
      FIRST_CHAPTER_ID,
      chapterBody.value
    )
    chapterBody.value = chapter.body ?? chapterBody.value
    savedChapterBody.value = chapterBody.value
    contentSaved.value = true
  } catch (error) {
    if (isNovelForbiddenError(error)) {
      forbidden.value = true
    } else {
      contentError.value = getNovelApiError(error, 'Could not save chapter content.')
    }
  } finally {
    contentSaving.value = false
  }
}

onMounted(loadManuscript)
watch(() => route.params.novelId, loadManuscript)
</script>
