<script setup lang="ts">
import { ref } from 'vue'
import { useDarkMode } from './composables/useDarkMode'
import SimpleMode from './components/SimpleMode.vue'
import CompoundMode from './components/CompoundMode.vue'

type Tab = 'simple' | 'compound'
const tab = ref<Tab>('compound')
const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
    <div class="max-w-lg mx-auto px-4 py-8">

      <!-- Header -->
      <div class="mb-8 text-center relative">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Salda</h1>
        <p class="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Cuentas claras, amistades largas.</p>
        <button
          class="absolute right-0 top-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          :title="isDark ? 'Modo claro' : 'Modo oscuro'"
          @click="toggle"
        >
          <!-- Sun -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <!-- Moon -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-xl mb-6 transition-colors">
        <button
          class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          :class="tab === 'simple'
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'"
          @click="tab = 'simple'"
        >
          Simple
        </button>
        <button
          class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          :class="tab === 'compound'
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'"
          @click="tab = 'compound'"
        >
          Compuesta
        </button>
      </div>

      <!-- Content -->
      <SimpleMode v-show="tab === 'simple'" />
      <CompoundMode v-show="tab === 'compound'" />

    </div>
  </div>
</template>
