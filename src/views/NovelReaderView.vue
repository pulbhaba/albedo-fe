<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <router-link to="/books" class="inline-flex text-sm font-medium text-blue-2 hover:text-blue-1">
      Back to books
    </router-link>

    <section v-if="loading" class="rounded-lg border border-black-4 bg-black-2 p-6 text-gray-2">
      Loading novel…
    </section>

    <section v-else-if="errorMessage" class="rounded-lg border border-red-1/30 bg-red-1/10 p-6 text-red-1">
      <h1 class="text-xl font-semibold">Unable to open this novel</h1>
      <p class="mt-2">{{ errorMessage }}</p>
      <button class="mt-4 rounded-md border border-red-1/40 px-3 py-2 text-sm font-medium hover:bg-red-1/10" type="button" @click="loadNovel">
        Try again
      </button>
    </section>

    <article v-else-if="novel" class="rounded-lg border border-black-4 bg-black-2 shadow-sm">
      <header class="border-b border-black-4 px-6 py-8">
        <p class="text-sm font-medium uppercase tracking-wide text-blue-2">{{ novel.status }}</p>
        <h1 class="mt-3 text-4xl font-semibold tracking-normal text-gray-1">{{ novel.title }}</h1>
        <p v-if="novel.summary" class="mt-4 text-lg leading-8 text-gray-2">{{ novel.summary }}</p>
      </header>
      <div class="whitespace-pre-wrap px-6 py-8 text-lg leading-9 text-gray-1">{{ novel.body }}</div>
    </article>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { getNovel, getNovelApiError } from '@/api/novels'
import { useRoute } from 'vue-router'

const route = useRoute()
const novel = ref(null)
const loading = ref(true)
const errorMessage = ref('')

async function loadNovel () {
  loading.value = true
  errorMessage.value = ''

  try {
    novel.value = await getNovel(route.params.novelId)
  } catch (error) {
    novel.value = null
    errorMessage.value = getNovelApiError(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadNovel)
watch(() => route.params.novelId, loadNovel)
</script>
