<template>
  <div class="space-y-6">
    <section>
      <p class="text-sm font-medium uppercase tracking-wide text-blue-2">Library</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-normal text-gray-1">Saved novels</h1>
      <p class="mt-2 text-gray-2">Read and manage the novels you have favorited.</p>
    </section>

    <section v-if="loading" class="rounded-lg border border-black-4 bg-black-2 p-6 text-gray-2">
      Loading your library…
    </section>

    <section v-else-if="errorMessage" class="rounded-lg border border-red-1/30 bg-red-1/10 p-6 text-red-1">
      <h2 class="text-xl font-semibold">Unable to load your library</h2>
      <p class="mt-2">{{ errorMessage }}</p>
      <button
        class="mt-4 rounded-md border border-red-1/40 px-3 py-2 text-sm font-medium hover:bg-red-1/10"
        type="button"
        @click="loadLibrary"
      >
        Try again
      </button>
    </section>

    <section v-else-if="!items.length" class="rounded-lg border border-black-4 bg-black-2 p-6 text-gray-2">
      You have not saved any novels yet.
      <router-link to="/books" class="ml-1 font-medium text-blue-2 hover:text-blue-1">
        Browse books
      </router-link>
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in items"
        :key="item.novel.id"
        class="flex flex-col rounded-lg border border-black-4 bg-black-2 p-5 shadow-sm"
      >
        <div class="flex-1">
          <p class="text-sm font-medium uppercase tracking-wide text-blue-2">{{ item.novel.status }}</p>
          <h2 class="mt-2 text-xl font-semibold text-gray-1">{{ item.novel.title }}</h2>
          <p class="mt-2 text-sm text-gray-2">By {{ authorName(item.novel) }}</p>
          <p v-if="item.novel.summary" class="mt-4 text-sm leading-6 text-gray-2">
            {{ item.novel.summary }}
          </p>
        </div>

        <div class="mt-5 flex flex-wrap gap-2">
          <router-link
            :to="{ name: 'NovelReader', params: { novelId: item.novel.id } }"
            class="rounded-md bg-blue-2 px-3 py-2 text-sm font-medium text-white hover:bg-blue-1"
          >
            Read novel
          </router-link>
          <button
            type="button"
            class="rounded-md border border-black-4 px-3 py-2 text-sm font-medium text-gray-1 hover:bg-black-3 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="removingNovelId === item.novel.id"
            @click="removeFromLibrary(item.novel.id)"
          >
            {{ removingNovelId === item.novel.id ? 'Removing…' : 'Remove' }}
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
import {
  getLibraryApiError,
  getLibraryRemovalError,
  listLibrary,
  removeFavorite
} from '@/api/library'

export default {
  name: 'LibraryView',
  data () {
    return {
      items: [],
      loading: true,
      errorMessage: '',
      removingNovelId: null
    }
  },
  mounted () {
    this.loadLibrary()
  },
  methods: {
    async loadLibrary () {
      this.loading = true
      this.errorMessage = ''

      try {
        const library = await listLibrary()
        this.items = library.items || []
      } catch (error) {
        this.items = []
        this.errorMessage = getLibraryApiError(error)
      } finally {
        this.loading = false
      }
    },
    async removeFromLibrary (novelId) {
      if (this.removingNovelId) {
        return
      }

      this.removingNovelId = novelId
      this.errorMessage = ''

      try {
        await removeFavorite(novelId)
        this.items = this.items.filter((item) => item.novel.id !== novelId)
      } catch (error) {
        this.errorMessage = getLibraryRemovalError(error)
      } finally {
        this.removingNovelId = null
      }
    },
    authorName (novel) {
      return novel.author?.displayName || 'Unknown author'
    }
  }
}
</script>
