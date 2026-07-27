<template>
  <section class="rounded-lg border border-black-4 bg-black-2 px-6 py-10 text-center shadow-sm">
    <p class="text-sm font-medium uppercase tracking-wide text-red-1">Access denied</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-normal text-gray-1">This page needs a different role</h1>
    <router-link
      to="/books"
      class="mt-6 inline-flex rounded-md bg-blue-2 px-4 py-2 text-sm font-medium text-white hover:bg-blue-1"
    >
      Back to books
    </router-link>
  </section>
</template>

<script>
export default {
  name: 'ForbiddenView',
};
</script>
